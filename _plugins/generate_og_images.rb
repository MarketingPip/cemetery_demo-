# _plugins/generate_og_images.rb
require 'fileutils'
require 'open3'

module Jekyll
  class GenerateOgImages < Generator
    safe true
    priority :normal

    def generate(site)
      Jekyll.logger.info "Starting Open Graph image generation..."

      # Configuration defaults
      og_folder = site.config['og_images_folder'] || 'assets/og-images'
      template_path = site.config['og_template'] || '_includes/og-template.html'
      output_dir = File.join(site.dest, og_folder)

      # Ensure output directory exists and is writable
      begin
        FileUtils.mkdir_p(output_dir) unless File.directory?(output_dir)
        FileUtils.chmod_R(0755, output_dir)
        Jekyll.logger.info "OG image directory ensured: #{output_dir}"
      rescue Errno::EACCES => e
        Jekyll.logger.error "Permission denied creating directory: #{e.message}"
        return
      end

      # Verify wkhtmltoimage is installed
      unless system('wkhtmltoimage --version >/dev/null 2>&1')
        Jekyll.logger.error "wkhtmltoimage not found. Please ensure it’s installed (e.g., 'sudo apt-get install wkhtmltopdf')."
        return
      end
      Jekyll.logger.info "wkhtmltoimage is installed and available."

      # Process each post
      site.posts.docs.each do |post|
        process_post(post, site, output_dir, og_folder, template_path)
      end

      Jekyll.logger.info "Open Graph image generation complete."
    end

    private

    def process_post(post, site, output_dir, og_folder, template_path)
      # Skip if post already has an image
      has_image = post.content =~ /(?:src|href)=["']?(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|svg))/i || post.data['image']
      return if has_image

      Jekyll.logger.info "Generating OG image for post: #{post.path}"

      # Define file paths
      slug = post.data['slug'] || post.basename_without_ext
      og_image_name = "#{slug}-og.png"
      og_image_path = File.join(output_dir, og_image_name)
      relative_path = File.join('/', og_folder, og_image_name)

      # Verify template exists
      template_full_path = File.join(site.source, template_path)
      unless File.exist?(template_full_path)
        Jekyll.logger.error "Template not found: #{template_full_path}"
        return
      end

      # Render HTML and write to temp file
      html_content = render_template(site, template_path, post)
      temp_html = File.join(Dir.tmpdir, "#{slug}-og-#{Time.now.to_i}.html")
      
      begin
        File.write(temp_html, html_content)
        unless File.exist?(temp_html)
          Jekyll.logger.error "Failed to create temporary HTML file: #{temp_html}"
          return
        end
        Jekyll.logger.debug "Temporary HTML file created: #{temp_html}"

        # Generate the image
        success = generate_image(temp_html, og_image_path)
        
        # Verify image creation before proceeding
        if success && verify_file(og_image_path)
          Jekyll.logger.info "Image verified at: #{og_image_path}"
          site.static_files << Jekyll::StaticFile.new(site, site.dest, og_folder, og_image_name)
          set_og_meta_tags(post, relative_path)
        else
          Jekyll.logger.error "Image generation failed or file is invalid at: #{og_image_path}"
        end
      rescue StandardError => e
        Jekyll.logger.error "Error processing post #{post.path}: #{e.message}"
        Jekyll.logger.debug "Backtrace: #{e.backtrace.join("\n")}"
      ensure
        File.delete(temp_html) if File.exist?(temp_html)
      end
    end

    def render_template(site, template_path, post)
      template = File.read(File.join(site.source, template_path))
      liquid = Liquid::Template.parse(template)
      
      raw_excerpt = post.data['excerpt'] || post.content[0..150] || "No preview available"
      excerpt_content = raw_excerpt.is_a?(Jekyll::Excerpt) ? raw_excerpt.to_s : raw_excerpt
      excerpt_content = "No preview available" if excerpt_content.nil? || excerpt_content.strip.empty?
      
      liquid.render(
        'title' => post.data['title']&.strip || "Untitled",
        'excerpt' => excerpt_content&.strip,
        'date' => post.date.strftime('%B %d, %Y'),
        'site' => site.config
      )
    end

    def generate_image(html_file, output_path)
      output_dir = File.dirname(output_path)
      begin
        FileUtils.mkdir_p(output_dir) unless File.directory?(output_dir)
        FileUtils.chmod(0755, output_dir)
        
        cmd = "wkhtmltoimage --width 1200 --height 630 --quality 85 '#{html_file}' '#{output_path}'"
        stdout, stderr, status = Open3.capture3(cmd)

        if status.success?
          Jekyll.logger.info "wkhtmltoimage executed successfully for: #{output_path}"
          return true
        else
          Jekyll.logger.error "wkhtmltoimage failed: #{stderr}"
          Jekyll.logger.debug "Command output: #{stdout}"
          return false
        end
      rescue Errno::EACCES => e
        Jekyll.logger.error "Permission error generating image: #{e.message}"
        return false
      end
    end

    def verify_file(file_path)
      attempts = 0
      max_attempts = 5
      sleep_interval = 0.5

      while attempts < max_attempts
        if File.exist?(file_path) && File.size?(file_path).to_i > 0
          Jekyll.logger.info "File verified - exists and non-empty: #{file_path} (size: #{File.size(file_path)} bytes)"
          return true
        else
          Jekyll.logger.debug "Waiting for file: #{file_path} (Attempt #{attempts + 1}/#{max_attempts})"
          sleep sleep_interval
          attempts += 1
        end
      end
      Jekyll.logger.error "File not created or empty after waiting: #{file_path}"
      Jekyll.logger.debug "Exists? #{File.exist?(file_path)}, Size: #{File.size?(file_path) || 0}"
      false
    end

    def set_og_meta_tags(post, image_path)
      raw_excerpt = post.data['excerpt'] || post.content[0..150] || "No preview available"
      excerpt_content = raw_excerpt.is_a?(Jekyll::Excerpt) ? raw_excerpt.to_s : raw_excerpt
      excerpt_content = "No preview available" if excerpt_content.nil? || excerpt_content.strip.empty?
      
      post.data['og'] ||= {}
      post.data['og'].merge!({
        'image' => image_path,
        'type' => 'article',
        'title' => post.data['title']&.strip || "Untitled",
        'description' => excerpt_content&.strip
      })
      Jekyll.logger.debug "Set OG meta tags for: #{post.path}"
    end
  end
end
