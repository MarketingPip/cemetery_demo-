# _plugins/download_images.rb
require 'open-uri'
require 'fileutils'
require 'uri'
require 'digest/md5'

module Jekyll
  class DownloadImages < Generator
    safe true
    priority :high

    def generate(site)
      Jekyll.logger.info "Starting image download process..."

      download_folder = site.config['download_images_folder'] || 'assets/images'
      source_path = File.join(site.source, download_folder)

      begin
        FileUtils.mkdir_p(source_path) unless File.directory?(source_path)
        Jekyll.logger.info "Source directory ensured: #{source_path}"
      rescue StandardError => e
        Jekyll.logger.error "Failed to create source directory '#{source_path}': #{e.message}"
        return
      end

      (site.pages + site.posts.docs).each do |item|
        process_item(item, download_folder, source_path, site)
      end

      Jekyll.logger.info "Image download process complete."
    end

    private

    def process_item(item, download_folder, source_path, site)
      return unless item.content

      Jekyll.logger.debug "Processing item: #{item.path || item.url}"
      # Improved regex to capture full URLs including query parameters
      image_urls = item.content.scan(/(?:src|href)=["']?(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|webp|png|gif|svg)(?:\?[^"'\s]*)?)/i)

      if image_urls.empty?
        Jekyll.logger.debug "No image URLs found in: #{item.path || item.url}"
        return
      end

      image_urls.each do |url_match|
        image_url = url_match[0]
        Jekyll.logger.info "Found image URL: #{image_url}"
        begin
          download_and_replace(image_url, item, download_folder, source_path, site)
        rescue StandardError => e
          Jekyll.logger.error "Error processing '#{image_url}' in '#{item.path || item.url}': #{e.message}"
        end
      end
    end

    def download_and_replace(image_url, item, download_folder, source_path, site)
      uri = URI.parse(image_url)
      base_filename = File.basename(uri.path)
      query_string = uri.query
      
      # Generate unique filename including query parameters if present
      file_name = if query_string
        ext = File.extname(base_filename)
        base = File.basename(base_filename, ext)
        query_hash = Digest::MD5.hexdigest(query_string)[0..7] # Short hash of query params
        sanitize_filename("#{base}_#{query_hash}#{ext}")
      else
        sanitize_filename(base_filename)
      end

      download_path = File.join(source_path, file_name)
      relative_path = File.join('/', download_folder, file_name)
      
      if ENV['JEKYLL_ENV'] == 'production' && site.config['gh_repo_name'] && !site.config['gh_repo_name'].empty?
        relative_path = "/#{site.config['gh_repo_name']}#{relative_path}"
      end

      unless File.exist?(download_path)
        download_image(image_url, download_path)
        if File.exist?(download_path)
          Jekyll.logger.info "Successfully downloaded '#{image_url}' to '#{download_path}'"
          site.static_files << Jekyll::StaticFile.new(site, site.source, download_folder, file_name)
          Jekyll.logger.debug "Added to static files: #{relative_path}"
        else
          Jekyll.logger.error "Download appeared to succeed but file not found at: #{download_path}"
          return
        end
      else
        Jekyll.logger.debug "Image already exists at: #{download_path}"
        unless site.static_files.any? { |sf| sf.path == download_path }
          site.static_files << Jekyll::StaticFile.new(site, site.source, download_folder, file_name)
          Jekyll.logger.debug "Registered existing file: #{relative_path}"
        end
      end

      item.content.gsub!(image_url, relative_path)
      Jekyll.logger.debug "Replaced URL with: #{relative_path}"
    end

    def download_image(image_url, download_path)
      Jekyll.logger.debug "Attempting to download: #{image_url} to #{download_path}"

      # Define the headers from the provided object
      headers = {
        "accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language" => "en-US,en;q=0.9",
        "cache-control" => "no-cache",
        "pragma" => "no-cache",
        "sec-ch-ua" => "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        "sec-ch-ua-mobile" => "?1",
        "sec-ch-ua-platform" => "\"Android\"",
        "sec-fetch-dest" => "document",
        "sec-fetch-mode" => "navigate",
        "sec-fetch-site" => "none",
        "sec-fetch-user" => "?1",
        "upgrade-insecure-requests" => "1"
      }

      URI.open(image_url, 'rb', {
        read_timeout: 10,
        **headers # Merge the headers into the options hash
      }) do |image|
        File.open(download_path, 'wb') do |file|
          bytes_written = file.write(image.read)
          Jekyll.logger.debug "Wrote #{bytes_written} bytes to #{download_path}"
        end
      end
    rescue OpenURI::HTTPError => e
      Jekyll.logger.error "HTTP error downloading '#{image_url}': #{e.message}"
      raise
    rescue Errno::EACCES => e
      Jekyll.logger.error "Permission denied saving to '#{download_path}': #{e.message}"
      raise
    end

    def sanitize_filename(file_name)
      ext = File.extname(file_name)
      base = File.basename(file_name, ext)
      "#{base.gsub(/[^0-9A-Za-z.\-]/, '_')}#{ext}"
    end
  end
end
