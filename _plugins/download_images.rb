# _plugins/download_images.rb

require 'open-uri'
require 'fileutils'
require 'uri'

module Jekyll
  class DownloadImages < Generator
    priority :low

    def generate(site)
      # Get the download folder path from the configuration
      download_folder = site.config['download_images_folder'] || 'assets/images'

      # Ensure the directory for the downloaded images exists
      ensure_directory_exists(download_folder)

      # Loop through all pages/posts in the site and find external image links
      site.pages.each { |page| download_external_images(page, download_folder) }
      site.posts.each { |post| download_external_images(post, download_folder) }
    end

    def ensure_directory_exists(download_folder)
      # Create the directory if it doesn't exist
      destination_path = File.join(Dir.pwd, download_folder)
      
      # Ensure the directory exists
      FileUtils.mkdir_p(destination_path) unless File.exists?(destination_path)
    end

    def download_external_images(item, download_folder)
      # Regex to match all image URLs
      image_urls = item.content.scan(/(?:src|href)="(https?:\/\/(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})(\/[^\"]+\.(?:jpg|jpeg|png|gif|svg))"/)

      # Download and save each image
      image_urls.each do |url|
        image_url = url[0] + url[1]
        file_name = sanitize_filename(File.basename(URI.parse(image_url).path))
        download_path = File.join(Dir.pwd, download_folder, file_name)

        # Download the image if it doesn't already exist locally
        unless File.exist?(download_path)
          puts "Downloading #{image_url} to #{download_path}"
          begin
            open(image_url) do |image|
              File.open(download_path, 'wb') do |f|
                f.write(image.read)
              end
            end
          rescue StandardError => e
            puts "Failed to download #{image_url}: #{e.message}"
          end
        end

        # Replace the image URL with the path to the downloaded image
        item.content.gsub!(image_url, File.join(download_folder, file_name))
      end
    end

    # Method to sanitize the file name, removing any special characters
    def sanitize_filename(file_name)
      file_name.gsub(/[^0-9A-Za-z.\-]/, '_')
    end
  end
end
