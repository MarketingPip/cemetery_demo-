require 'fileutils'
require 'yaml'

module Jekyll
  class CompileTags < Generator
    safe true
    priority :high

    def generate(site)
      # Collect all tags from the posts
      all_tags = collect_tags(site)
      
      # Remove old tag pages if any exist
      remove_old_tag_pages(site)

      # Create tag pages for each tag
      create_tag_pages(site, all_tags)
    end

    def collect_tags(site)
      all_tags = []

      # Collect tags from each post
      site.posts.docs.each do |post|
        if post.data['tags']
          all_tags.concat(post.data['tags'])
        end
      end

      # Remove duplicates and sort the tags
      all_tags.uniq.sort
    end

    def remove_old_tag_pages(site)
      # Remove old tag pages in the 'tag' directory
      tag_dir = File.join(site.source, 'tag')
      if File.directory?(tag_dir)
        Dir.glob(File.join(tag_dir, '*.md')).each do |tag_page|
          File.delete(tag_page)
        end
      end
    end

    def create_tag_pages(site, tags)
      tag_dir = File.join(site.source, 'tag')

      # Create the 'tag' directory if it doesn't exist
      FileUtils.mkdir_p(tag_dir)

      # Write a new tag page for each tag
      tags.each do |tag|
        tag_page_path = File.join(tag_dir, "#{tag}.md")

        # Write the front matter and tag page content
        File.open(tag_page_path, 'w') do |file|
          file.write(<<~YAML)
            ---
            layout: tagpage
            tag: #{tag}
            robots: noindex
            ---
          YAML
        end
      end

      puts "Generated tag pages for: #{tags.join(', ')}"
    end
  end
end
