require 'open-uri'
require 'fileutils'
require 'digest'
require 'nokogiri'

module Jekyll
  class DownloadImagesPostBuild
    # Hook into site post_write
    Jekyll::Hooks.register :site, :post_write do |site|
      Jekyll.logger.info "DownloadImages:", "Starting post-build image download..."

      site_output_path = site.dest
      download_folder = site.config['download_images_folder'] || 'assets/images'
      local_download_path = File.join(site.source, download_folder)

      FileUtils.mkdir_p(local_download_path) unless File.directory?(local_download_path)

      Dir.glob(File.join(site_output_path, "**", "*.html")) do |html_file|
        process_html_file(html_file, local_download_path, site_output_path, site, download_folder)
      end

      Jekyll.logger.info "DownloadImages:", "Finished downloading images."
    end

    def self.process_html_file(html_file, local_download_path, site_output_path, site, download_folder)
      html = File.read(html_file)
      doc = Nokogiri::HTML(html)

      doc.css('img').each do |img_tag|
        url = img_tag['src']
        next unless url =~ %r{^https?://.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$}i

        begin
          downloaded_path, relative_path = download_image(url, local_download_path, site, download_folder)
          next unless downloaded_path

          # Update the HTML image src to point to the local version
          img_tag['src'] = relative_path

        rescue => e
          Jekyll.logger.warn "DownloadImages:", "Failed to download #{url}: #{e.message}"
        end
      end

      # Save modified HTML
      File.write(html_file, doc.to_html)
    end

    def self.download_image(url, download_path, site, download_folder)
      uri = URI.parse(url)
      base_filename = File.basename(uri.path)
      query_string = uri.query

      file_name = if query_string
        ext = File.extname(base_filename)
        base = File.basename(base_filename, ext)
        hash = Digest::MD5.hexdigest(query_string)[0..7]
        "#{base}_#{hash}#{ext}"
      else
        base_filename
      end

      local_file_path = File.join(download_path, file_name)
      relative_url_path = File.join('/', download_folder, file_name)

      return [local_file_path, relative_url_path] if File.exist?(local_file_path)

      URI.open(url, 'rb', { "User-Agent" => "JekyllImageDownloader/#{Jekyll::VERSION}" }) do |image|
        File.open(local_file_path, 'wb') { |f| f.write(image.read) }
        Jekyll.logger.info "Downloaded image: #{url} → #{relative_url_path}"
      end

      [local_file_path, relative_url_path]
    end
  end
end
