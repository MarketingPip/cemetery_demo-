# Filename: _plugins/update_author_yaml.rb
require 'yaml'

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "Starting author YAML update..."

      authors_dir = File.join(site.source, '_authors')
      site.collections['authors'] ||= Jekyll::Collection.new(site, 'authors')

      site.posts.docs.each do |post|
        author_name = post.data['author']
        next unless author_name

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
      author_FILENAME = "#{author_name.downcase.gsub(/\s+/, '-')}.md"
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        content = File.read(author_path)
        parsed = parse_front_matter(content)

        parsed[:data]['posts'] ||= []
        unless parsed[:data]['posts'].any? { |p| p['url'] == post_info['url'] }
          parsed[:data]['posts'] << post_info

          # Ensure content is a string, default to empty if nil
          parsed_content = parsed[:content] || ''
          new_content = "---\n#{parsed[:data].to_yaml}---\n#{parsed_content}"
          
          Jekyll.logger.info "Writing to #{author_path}: #{new_content[0..100]}..." # Log first 100 chars
          File.write(author_path, new_content)
          Jekyll.logger.info "Updated file for author: #{author_name}"

          update_site_data(site, author_filename, parsed[:data], parsed_content)
        else
          Jekyll.logger.info "Post already exists for author '#{author_name}': #{post_info['title']}"
        end
      else
        create_author_file(site, author_path, author_name, post_info)
      end
    end

    def update_site_data(site, filename, data, content)
      doc = site.collections['authors'].docs.find { |d| d.basename == File.basename(filename, '.md') }
      if doc
        doc.data.merge!(data)
        doc.content = content || '' # Ensure content is never nil
        Jekyll.logger.info "Updated in-memory doc for #{filename}"
      else
        new_doc = Jekyll::Document.new(
          File.join(site.source, '_authors', filename),
          { site: site, collection: site.collections['authors'] }
        )
        new_doc.read
        new_doc.data.merge!(data)
        new_doc.content = content || '' # Ensure content is never nil
        site.collections['authors'].docs << new_doc
        Jekyll.logger.info "Added new in-memory doc for #{filename}"
      end
    end

    def create_author_file(site, author_path, author_name, post_info)
      content = "---\nname: #{author_name}\nposts:\n  - #{post_info.to_yaml.sub('---', '').strip}\n---\n"
      File.write(author_path, content)
      Jekyll.logger.info "Created new author file for: #{author_name} at #{author_path}"

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
        Jekyll.logger.debug "Parsed front matter: #{data.inspect}"
        { data: data, content: body }
      else
        Jekyll.logger.warn "No front matter found in content: #{content[0..50]}..."
        { data: {}, content: content }
      end
    end
  end
end
