# _plugins/image_optimization.rb
require 'mini_magick'
require 'fileutils'

module Jekyll
  class ImageOptimization < Jekyll::Generator
    safe true

    def generate(site)
      # Set directories for images to optimize
      image_dir = 'assets/images'
      optimized_dir = 'assets/images/optimized'

      # Create optimized directory if it doesn't exist
      FileUtils.mkdir_p(optimized_dir)

      # Iterate over all posts and pages
      site.posts.docs.each do |post|
        optimize_images_in_content(post, image_dir, optimized_dir)
      end

      site.pages.each do |page|
        optimize_images_in_content(page, image_dir, optimized_dir)
      end
    end

    # Method to check for image links and optimize
    def optimize_images_in_content(item, image_dir, optimized_dir)
      item.content.gsub!(/(src|data-src)="(\/?#{image_dir}\/[\w\/\-\.]+)"/) do |match|
        image_path = $2
        optimized_image_path = optimize_image(image_path, image_dir, optimized_dir)
        "#{ $1 }=\"#{ optimized_image_path }\""
      end
    end

    # Method to handle image optimization
    def optimize_image(image_path, image_dir, optimized_dir)
      # Construct full file paths
      full_image_path = File.join(Dir.pwd, image_path)
      file_extension = File.extname(image_path).downcase
      optimized_image_path = File.join(Dir.pwd, optimized_dir, File.basename(image_path, '.*') + '.webp')

      # Only process images if they exist
      if File.exist?(full_image_path)
        # Open image using MiniMagick
        image = MiniMagick::Image.open(full_image_path)
        
        # If image is not already in WebP, convert it
        if file_extension != '.webp'
          # Convert non-WebP images to WebP format
          image.format 'webp'
        end
        
        # Compress image (adjust quality for both .webp and other formats)
        image.quality 80  # Adjust the quality for compression (you can change this)

        # Write the optimized image (either a new WebP or optimized WebP)
        image.write(optimized_image_path)

        # Return optimized image path (relative to the site root)
        "/#{ optimized_image_path.gsub(Dir.pwd, '') }"
      else
        # If the image does not exist, return the original path
        image_path
      end
    end
  end
end
