# Filename: _plugins/update_author_yaml.rb
require 'yaml'

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true

    def generate(site)
      Jekyll.logger.info "Starting author YAML update..."

      # Directory paths
      posts_dir = File.join(site.source, '_posts')
      authors_dir = File.join(site.source, '_authors')

      # Process each post
      site.posts.docs.each do |post|
        author_name = post.data['author']
        next unless author_name

        # Format post information
        formatted_date = post.data['date'].strftime('%Y/%m/%d')
        slug = post.data['title'].downcase.gsub(/\s+/, '-')
        
        # Convert Time to ISO 8601 string to avoid Psych::DisallowedClass
        post_info = {
          'title' => post.data['title'],
          'url' => "/blog/#{formatted_date}/#{slug}",
          'date' => post.data['date'].strftime('%Y-%m-%d'), # Convert to string
          'excerpt' => post.data['excerpt'] || ''
        }

        update_author_file(authors_dir, author_name, post_info)
      end

      Jekyll.logger.info "Author YAML update complete."
    end

    private

    def update_author_file(authors_dir, author_name, post_info)
      author_filename = "#{author_name.downcase.gsub(/\s+/, '-')}.md"
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        # Read existing file
        content = File.read(author_path)
        parsed = parse_front_matter(content)

        # Initialize posts array if it doesn't exist
        parsed[:data]['posts'] ||= []
        
        # Check if post already exists
        unless parsed[:data]['posts'].any? { |p| p['url'] == post_info['url'] }
          parsed[:data]['posts'] << post_info
          
          # Write updated content with safe YAML dumping
          new_content = "---\n#{parsed[:data].to_yaml}---\n#{parsed[:content]}"
          File.write(author_path, new_content)
          Jekyll.logger.info "Updated posts for author: #{author_name}"
        else
          Jekyll.logger.info "Post already exists for author '#{author_name}': #{post_info['title']}"
        end
      else
        Jekyll.logger.warn "Author file not found for: #{author_name}"
      end
    end

    def parse_front_matter(content)
      if content =~ /\A(---\s*\n.*?\n?)^(---\s*\n)/m
        front_matter = $1
        body = $POSTMATCH
        # Use safe_load to avoid class loading issues
        data = YAML.safe_load(front_matter, permitted_classes: [Date, Time]) || {}
        { data: data, content: body }
      else
        { data: {}, content: content }
      end
    end
  end
end
