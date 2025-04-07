# Filename: _plugins/update_author_yaml.rb
require 'yaml'

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true
    priority :low # Run after other generators

    def generate(site)
      Jekyll.logger.info "Starting author YAML update..."

      # Directory paths
      authors_dir = File.join(site.source, '_authors')
      
      # Ensure authors are treated as a collection or static files
      site.collections['authors'] ||= Jekyll::Collection.new(site, 'authors')

      # Process each post
      site.posts.docs.each do |post|
        author_name = post.data['author']
        next unless author_name

        # Format post information
        formatted_date = post.data['date'].strftime('%Y/%m/%d')
        slug = post.data['title'].downcase.gsub(/\s+/, '-')
        
        post_info = {
          'title' => post.data['title'],
          'url' => "/blog/#{formatted_date}/#{slug}",
          'date' => post.data['date'].strftime('%Y-%m-%d'),
          'excerpt' => post.data['excerpt'] || ''
        }

        update_author_file(site, authors_dir, author_name, post_info)
      end

      Jekyll.logger.info "Author YAML update complete."
    end

    private

    def update_author_file(site, authors_dir, author_name, post_info)
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

          # Write updated content to disk
          new_content = "---\n#{parsed[:data].to_yaml}---\n#{parsed[:content]}"
          File.write(author_path, new_content)
          Jekyll.logger.info "Updated file for author: #{author_name}"

          # Update in-memory representation
          update_site_data(site, author_filename, parsed[:data], parsed[:content])
        else
          Jekyll.logger.info "Post already exists for author '#{author_name}': #{post_info['title']}"
        end
      else
        # Create new author file if it doesn't exist
        create_author_file(site, author_path, author_name, post_info)
      end
    end

    def update_site_data(site, filename, data, content)
      # Find or create the document in the authors collection
      doc = site.collections['authors'].docs.find { |d| d.basename == File.basename(filename, '.md') }
      if doc
        doc.data.merge!(data)
        doc.content = content
      else
        # Add as a new document
        new_doc = Jekyll::Document.new(
          File.join(site.source, '_authors', filename),
          { site: site, collection: site.collections['authors'] }
        )
        new_doc.read # Load the content
        new_doc.data.merge!(data)
        new_doc.content = content
        site.collections['authors'].docs << new_doc
      end
    end

    def create_author_file(site, author_path, author_name, post_info)
      content = "---\nname: #{author_name}\nposts:\n  - #{post_info.to_yaml.sub('---', '').strip}\n---\n"
      File.write(author_path, content)
      Jekyll.logger.info "Created new author file for: #{author_name}"

      # Add to site collection
      new_doc = Jekyll::Document.new(
        author_path,
        { site: site, collection: site.collections['authors'] }
      )
      new_doc.read
      site.collections['authors'].docs << new_doc
    end

    def parse_front_matter(content)
      if content =~ /\A(---\s*\n.*?\n?)^(---\s*\n)/m
        front_matter = $1
        body = $POSTMATCH
        data = YAML.safe_load(front_matter, permitted_classes: [Date, Time]) || {}
        { data: data, content: body }
      else
        { data: {}, content: content }
      end
    end
  end
end
