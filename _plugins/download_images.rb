# _plugins/download_images.rb
require 'open-uri'
require 'fileutils'
require 'uri'
require 'digest/md5'
require 'cloudflare_clearance'

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

  max_retries = 3
  retry_count = 0

  # List of realistic User-Agents
  user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
  ]

  loop do
    begin
      # Random User-Agent
      user_agent = user_agents.sample
      headers = {
        "User-Agent" => user_agent,
        "Accept" => "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language" => "en-US,en;q=0.9",
        "Accept-Encoding" => "gzip, deflate, br",
        "Referer" => "https://www.findagrave.com/", # Specific to Find A Grave
        "Connection" => "keep-alive",
        "DNT" => "1", # Do Not Track for added realism
        "Upgrade-Insecure-Requests" => "1"
      }

      # Optional: Fetch cookies from the parent domain (uncomment if needed)
      # cookies = fetch_cookies("https://www.findagrave.com/")
      # headers["Cookie"] = cookies.map { |k, v| "#{k}=#{v}" }.join("; ") if cookies

      # Use HTTParty for more control over the request
      response = HTTParty.get(image_url, {
        headers: headers,
        timeout: 30,
        follow_redirects: true,
        ssl_version: :TLSv1_2, # Ensure modern TLS version
        verify: true
      })

      if response.code == 200
        File.open(download_path, 'wb') do |file|
          bytes_written = file.write(response.body)
          Jekyll.logger.debug "Wrote #{bytes_written} bytes to #{download_path}"
        end
        break
      else
        Jekyll.logger.warn "Non-200 response (#{response.code}) for '#{image_url}': #{response.headers.inspect}"
        raise OpenURI::HTTPError.new("#{response.code} #{response.message}", nil)
      end

    rescue OpenURI::HTTPError, Net::HTTPBadResponse => e
      if e.message.include?("403 Forbidden") && retry_count < max_retries
        retry_count += 1
        sleep_time = 2**retry_count + rand(0.5) # Exponential backoff with jitter
        Jekyll.logger.warn "403 Forbidden on '#{image_url}', retrying (#{retry_count}/#{max_retries}) after #{sleep_time.round(2)}s..."
        sleep(sleep_time)
        next
      else
        Jekyll.logger.error "HTTP error downloading '#{image_url}': #{e.message}"
        raise
      end
    rescue Errno::EACCES => e
      Jekyll.logger.error "Permission denied saving to '#{download_path}': #{e.message}"
      raise
    rescue StandardError => e
      Jekyll.logger.error "Unexpected error downloading '#{image_url}': #{e.message} (#{e.class})"
      raise if retry_count >= max_retries
      retry_count += 1
      sleep(2 + rand(1)) # Random delay for other errors
      next
    end
  end
end

    def sanitize_filename(file_name)
      ext = File.extname(file_name)
      base = File.basename(file_name, ext)
      "#{base.gsub(/[^0-9A-Za-z.\-]/, '_')}#{ext}"
    end
  end
end
