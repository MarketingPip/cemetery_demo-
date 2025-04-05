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

      download_folder = site.config['download_images_folder'] || 'assets/images'
      destination_path = File.join(site.dest, download_folder) # Changed to site.dest for output directory

      begin
        FileUtils.mkdir_p(destination_path) unless File.directory?(destination_path)
        Jekyll.logger.info "Output directory ensured: #{destination_path}"
      rescue StandardError => e
        Jekyll.logger.error "Failed to create output directory '#{destination_path}': #{e.message}"
        return
      end

      (site.pages + site.posts.docs).each do |item|
        process_item(item, download_folder, destination_path)
      end

      Jekyll.logger.info "Image download process complete."
    end

    private

    def process_item(item, download_folder, destination_path)
      return unless item.content

      Jekyll.logger.debug "Processing item: #{item.path || item.url}"
      image_urls = item.content.scan(/(?:src|href)=["']?(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|svg))/i)

      if image_urls.empty?
        Jekyll.logger.debug "No image URLs found in: #{item.path || item.url}"
      end

      image_urls.each do |url_match|
        image_url = url_match[0]
        Jekyll.logger.info "Found image URL: #{image_url}"
        begin
          download_and_replace(image_url, item, download_folder, destination_path)
        rescue StandardError => e
          Jekyll.logger.error "Error processing '#{image_url}' in '#{item.path || item.url}': #{e.message}"
        end
      end
    end

    def download_and_replace(image_url, item, download_folder, destination_path)
      uri = URI.parse(image_url)
      file_name = sanitize_filename(File.basename(uri.path))
      download_path = File.join(destination_path, file_name)
      relative_path = File.join('/', download_folder, file_name)

      if File.exist?(download_path)
        Jekyll.logger.debug "Image already exists at: #{download_path}"
      else
        download_image(image_url, download_path)
        if File.exist?(download_path)
          Jekyll.logger.info "Successfully downloaded '#{image_url}' to '#{download_path}'"
        else
          Jekyll.logger.error "Download appeared to succeed but file not found at: #{download_path}"
        end
      end

      item.content.gsub!(image_url, relative_path)
      Jekyll.logger.debug "Replaced URL with: #{relative_path}"
    end

    def download_image(image_url, download_path)
      Jekyll.logger.debug "Attempting to download: #{image_url} to #{download_path}"
      
      URI.open(image_url, 'rb', {
        :read_timeout => 10,
        'User-Agent' => "Jekyll Image Downloader/#{Jekyll::VERSION}"
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
