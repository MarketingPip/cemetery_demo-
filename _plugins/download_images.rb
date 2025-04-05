# _plugins/download_images.rb
require 'open-uri'
require 'fileutils'
require 'uri'

module Jekyll
  class DownloadImages < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "Starting image download process..."

      # Use source directory instead of dest for downloads
      download_folder = site.config['download_images_folder'] || 'assets/images'
      source_path = File.join(site.source, download_folder)

      # Ensure the source directory exists
      begin
        FileUtils.mkdir_p(source_path) unless File.directory?(source_path)
        Jekyll.logger.info "Source directory ensured: #{source_path}"
      rescue StandardError => e
        Jekyll.logger.error "Failed to create source directory '#{source_path}': #{e.message}"
        return
      end

      # Process pages and posts
      (site.pages + site.posts.docs).each do |item|
        process_item(item, download_folder, source_path, site)
      end

      Jekyll.logger.info "Image download process complete."
    end

    private

    def process_item(item, download_folder, source_path, site)
      return unless item.content

      Jekyll.logger.debug "Processing item: #{item.path || item.url}"
      # Match image URLs in src or href attributes
      image_urls = item.content.scan(/(?:src|href)=["']?(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|svg))/i)

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
      file_name = sanitize_filename(File.basename(uri.path))
      download_path = File.join(source_path, file_name)

      # Relative path for the content replacement
      relative_path = File.join('/', download_folder, file_name)
      if site.config['gh_repo_name'] && !site.config['gh_repo_name'].empty?
        relative_path = "/#{site.config['gh_repo_name']}#{relative_path}"
      end

      # Download the image if it doesn’t exist
      unless File.exist?(download_path)
        download_image(image_url, download_path)
        if File.exist?(download_path)
          Jekyll.logger.info "Successfully downloaded '#{image_url}' to '#{download_path}'"
        else
          Jekyll.logger.error "Download appeared to succeed but file not found at: #{download_path}"
          return
        end
      else
        Jekyll.logger.debug "Image already exists at: #{download_path}"
      end

      # Replace the URL in the content with the relative path
      item.content.gsub!(image_url, relative_path)
      Jekyll.logger.debug "Replaced URL with: #{relative_path}"
    end

    def download_image(image_url, download_path)
      Jekyll.logger.debug "Attempting to download: #{image_url} to #{download_path}"

      URI.open(image_url, 'rb', {
        read_timeout: 10,
        'User-Agent': "Jekyll Image Downloader/#{Jekyll::VERSION}"
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
