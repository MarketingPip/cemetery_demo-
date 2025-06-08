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
        slug = post.basename.sub(/^\d{4}-\d{2}-\d{2}-/, '').sub(/\.md$/, '').downcase.strip.gsub(/[^\w]+/, '-').gsub(/^-|-$/, '')

        post_info = {
          'title' => post.data['title'],
          'url' => "/blog/#{formatted_date}/#{slug}",
          'date' => post.data['date'].strftime('%Y-%m-%d'),
          'excerpt' => (post.data['excerpt'] || '').to_s[0, 100]
        }

        update_author_file(site, authors_dir, author_name, post_info)
      end

      Jekyll.logger.info "Author YAML update complete."
    end

    private

    def update_author_file(site, authors_dir, author_name, post_info)
      author_filename = "#{author_name.downcase.strip.gsub(/\s+/, '-')}.md"
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        content = File.read(author_path)
        parsed = parse_front_matter(content)

        parsed[:data]['posts'] ||= []
        unless parsed[:data]['posts'].any? { |p| p['url'] == post_info['url'] }
          parsed[:data]['posts'] << post_info

          parsed_content = parsed[:content] || ''
          yaml_content = parsed[:data].to_yaml.sub(/^---\n/, '')
          new_content = "---\n#{yaml_content}---\n#{parsed_content}"

          Jekyll.logger.info "Writing to #{author_path}: #{new_content[0..100]}..."
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
        doc.content = content || ''
        Jekyll.logger.info "Updated in-memory doc for #{filename}"
      else
        new_doc = Jekyll::Document.new(
          File.join(site.source, '_authors', filename),
          { site: site, collection: site.collections['authors'] }
        )
        new_doc.read
        new_doc.data.merge!(data)
        new_doc.content = content || ''
        site.collections['authors'].docs << new_doc
        Jekyll.logger.info "Added new in-memory doc for #{filename}"
      end
    end

    def create_author_file(site, author_path, author_name, post_info)
      data = {
        'name' => author_name,
        'posts' => [post_info]
      }
      yaml_content = data.to_yaml.sub(/^---\n/, '')
      content = "---\n#{yaml_content}---\n"
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
