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
      output_dir = File.join(site.source, og_folder)

      # Ensure output directory exists
      FileUtils.mkdir_p(output_dir) unless File.directory?(output_dir)
      Jekyll.logger.info "OG image directory ensured: #{output_dir}"

      # Check if wkhtmltoimage is installed
      unless system('wkhtmltoimage --version >/dev/null 2>&1')
        Jekyll.logger.error "wkhtmltoimage not found. Please install it first."
        return
      end

      site.posts.docs.each do |post|
        process_post(post, site, output_dir, og_folder, template_path)
      end

      Jekyll.logger.info "Open Graph image generation complete."
    end

    private

    def process_post(post, site, output_dir, og_folder, template_path)
      # Check if post has an image (adjust this condition based on your setup)
      has_image = post.content =~ /(?:src|href)=["']?(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|svg))/i ||
                 post.data['image']

      return if has_image

      Jekyll.logger.info "Generating OG image for post: #{post.path}"

      # Generate OG image filename
      slug = post.data['slug'] || post.basename_without_ext
      og_image_name = "#{slug}-og.png"
      og_image_path = File.join(output_dir, og_image_name)
      relative_path = File.join('/', og_folder, og_image_name)

      # Render HTML template
      html_content = render_template(site, template_path, post)
      temp_html = File.join(Dir.tmpdir, "#{slug}-og.html")
      File.write(temp_html, html_content)

      # Convert to image
      generate_image(temp_html, og_image_path)

      # Clean up temporary file
      File.delete(temp_html) if File.exist?(temp_html)

      # Set meta tags in post data
      set_og_meta_tags(post, relative_path)
    end

    def render_template(site, template_path, post)
      template = File.read(File.join(site.source, template_path))
      liquid = Liquid::Template.parse(template)
      liquid.render(
        'title' => post.data['title'],
        'excerpt' => post.data['excerpt'] || post.content[0..150],
        'date' => post.date.strftime('%B %d, %Y'),
        'site' => site.config
      )
    end

    def generate_image(html_file, output_path)
      cmd = "wkhtmltoimage --width 1200 --height 630 --quality 85 '#{html_file}' '#{output_path}'"
      stdout, stderr, status = Open3.capture3(cmd)

      if status.success?
        Jekyll.logger.info "Generated OG image: #{output_path}"
      else
        Jekyll.logger.error "Failed to generate OG image: #{stderr}"
      end
    end

    def set_og_meta_tags(post, image_path)
      post.data['og'] ||= {}
      post.data['og'].merge!({
        'image' => image_path,
        'type' => 'article',
        'title' => post.data['title'],
        'description' => post.data['excerpt'] || post.content[0..150]
      })
      Jekyll.logger.debug "Set OG meta tags for: #{post.path}"
    end
  end
end
