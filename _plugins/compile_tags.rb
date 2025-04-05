# Filename: _plugins/generate_tag_pages.rb
require 'fileutils'

module Jekyll
  class GenerateTagPages < Generator
    safe true

    def generate(site)
      # Define the directory where tag pages should go in the final site output
      tag_dir = 'tag'  # Folder for tag pages in _site directory
      tag_dir_path = File.join(site.dest, tag_dir)  # Final path where the tag pages will be written

      # Ensure the tag directory exists in the final output
      FileUtils.mkdir_p(tag_dir_path) unless File.exists?(tag_dir_path)
      puts "Tag directory created at #{tag_dir_path}" # Debugging line to confirm directory creation

      # Collect all tags from posts
      all_tags = []
      site.posts.docs.each do |post|
        tags = post.data['tags'] || []
        all_tags += tags
      end

      # Remove duplicate tags
      all_tags = all_tags.uniq

      # Create a tag page for each tag
      all_tags.each do |tag|
        tag_file_path = File.join(tag_dir_path, "#{tag}.html")
        
        # Only create the tag page if it doesn't exist already
        unless File.exist?(tag_file_path)
          File.open(tag_file_path, 'w') do |f|
            # Write the tag page with front matter
            f.write("---\n")
            f.write("layout: tag_page\n")
            f.write("permalink: /blog/#{tag}\n")
            f.write("tag: #{tag}\n")
            f.write("robots: noindex\n")
            f.write("---\n\n")
            f.write("<h1>Tag: #{tag}</h1>\n")
            f.write("<p>This is the tag page for `#{tag}`.</p>\n")
            f.write("<ul>\n")
            site.posts.docs.each do |post|
              if post.data['tags'] && post.data['tags'].include?(tag)
                f.write("<li><a href=\"#{post.url}\">#{post.data['title']}</a></li>\n")
              end
            end
            f.write("</ul>\n")
            puts "Tag page created: #{tag_file_path}" # Debugging line to confirm page creation
          end
        else
          puts "Tag page already exists: #{tag_file_path}" # Debugging line
        end
      end
    end
  end
end
