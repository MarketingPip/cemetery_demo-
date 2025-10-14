require 'yaml'

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "Starting author YAML update..."

      authors_dir = File.join(site.source, '_authors')
      site.collections['authors'] ||= Jekyll::Collection.new(site, 'authors')

      # Handle posts
      site.posts.docs.each do |post|
        author_name = post.data['author']
        next unless author_name

        formatted_date = post.data['date'].strftime('%Y/%m/%d')
        slug = post.data['slug'] || File.basename(post.relative_path, '.md').sub(/^\d{4}-\d{2}-\d{2}-/, '')

        post_info = {
          'title' => post.data['title'],
          'url' => "/blog/#{formatted_date}/#{slug}",
          'date' => post.data['date'].strftime('%Y-%m-%d'),
          'excerpt' => (post.data['excerpt'] || '').to_s[0, 100]
        }

        update_author_file(site, authors_dir, author_name, post_info, nil)
      end

      # Handle exhibits
      if site.collections['exhibits']
        site.collections['exhibits'].docs.each do |exhibit|
          author_name = exhibit.data['author']
          next unless author_name

          slug = exhibit.data['slug'] || File.basename(exhibit.relative_path, '.md')

          # Safely format date
          date_str = nil
          begin
            date_str = exhibit.data['date'].strftime('%Y-%m-%d')
          rescue
            date_str = nil
          end

          exhibit_info = {
            'title' => exhibit.data['title'],
            'url' => "/exhibits/#{slug}",
            'date' => date_str,
            'excerpt' => (exhibit.data['excerpt'] || '').to_s[0, 100],
            'location' => exhibit.data['location'] || ''
          }

          update_author_file(site, authors_dir, author_name, nil, exhibit_info)
        end
      end

      Jekyll.logger.info "Author YAML update complete."
    end

    private

    def update_author_file(site, authors_dir, author_name, post_info = nil, exhibit_info = nil)
      author_filename = "#{author_name.downcase.strip.gsub(/\s+/, '-')}.md"
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        content = File.read(author_path)
        parsed = parse_front_matter(content)

        # Handle posts
        if post_info
          parsed[:data]['posts'] ||= []
          existing_index = parsed[:data]['posts'].index { |p| p['url'] == post_info['url'] }

          if existing_index
            if parsed[:data]['posts'][existing_index] != post_info
              parsed[:data]['posts'][existing_index] = post_info
              Jekyll.logger.info "Updated existing post entry for author '#{author_name}': #{post_info['title']}"
            else
              Jekyll.logger.info "No changes for post entry: #{post_info['title']}"
            end
          else
            parsed[:data]['posts'] << post_info
            Jekyll.logger.info "Added new post entry for author '#{author_name}': #{post_info['title']}"
          end
        end

        # Handle exhibits
        if exhibit_info
          parsed[:data]['exhibits'] ||= []
          existing_index = parsed[:data]['exhibits'].index { |e| e['url'] == exhibit_info['url'] }

          if existing_index
            if parsed[:data]['exhibits'][existing_index] != exhibit_info
              parsed[:data]['exhibits'][existing_index] = exhibit_info
              Jekyll.logger.info "Updated exhibit for author '#{author_name}': #{exhibit_info['title']}"
            end
          else
            parsed[:data]['exhibits'] << exhibit_info
            Jekyll.logger.info "Added exhibit for author '#{author_name}': #{exhibit_info['title']}"
          end
        end

        parsed_content = parsed[:content] || ''
        yaml_content = parsed[:data].to_yaml.sub(/^---\n/, '')
        new_content = "---\n#{yaml_content}---\n#{parsed_content}"

        File.write(author_path, new_content)
        File.utime(Time.now, Time.now, author_path)

        Jekyll.logger.info "Wrote updated file: #{author_path}"

        update_site_data(site, author_filename, parsed[:data], parsed_content)
      else
        create_author_file(site, author_path, author_name, post_info, exhibit_info)
      end
    end

    def create_author_file(site, author_path, author_name, post_info = nil, exhibit_info = nil)
      data = {
        'name' => author_name,
        'posts' => post_info ? [post_info] : [],
        'exhibits' => exhibit_info ? [exhibit_info] : []
      }

      yaml_content = data.to_yaml.sub(/^---\n/, '')
      content = "---\n#{yaml_content}---\n"

      File.write(author_path, content)
      File.utime(Time.now, Time.now, author_path)

      Jekyll.logger.info "Created new author file for: #{author_name} at #{author_path}"

      new_doc = Jekyll::Document.new(
        author_path,
        { site: site, collection: site.collections['authors'] }
      )
      new_doc.read

      unless site.collections['authors'].docs.any? { |d| d.path == new_doc.path }
        site.collections['authors'].docs << new_doc
        Jekyll.logger.info "Added new in-memory doc for #{author_name}"
      else
        Jekyll.logger.warn "Skipped adding duplicate doc for #{author_name}"
      end
    end

    def update_site_data(site, filename, data, content)
      collection = site.collections['authors']
      basename = File.basename(filename, '.md')
      author_path = File.join(site.source, '_authors', filename)

      existing_doc = collection.docs.find do |d|
        d.path == author_path || d.basename_without_ext == basename
      end

      if existing_doc
        existing_doc.data.merge!(data)
        existing_doc.content = content || ''
        Jekyll.logger.info "Updated in-memory doc for #{filename}"
      else
        new_doc = Jekyll::Document.new(
          author_path,
          { site: site, collection: collection }
        )
        new_doc.read
        new_doc.data.merge!(data)
        new_doc.content = content || ''

        unless collection.docs.any? { |d| d.path == new_doc.path }
          collection.docs << new_doc
          Jekyll.logger.info "Added new in-memory doc for #{filename}"
        else
          Jekyll.logger.warn "Skipped duplicate doc for #{filename}"
        end
      end
    end

    def parse_front_matter(content)
      if content =~ /\A---\s*\n(.*?)\n---\s*\n?/m
        data = YAML.safe_load($1, permitted_classes: [Date, Time]) || {}
        body = $POSTMATCH
        { data: data, content: body }
      else
        Jekyll.logger.warn "No front matter found in content: #{content[0..50]}..."
        { data: {}, content: content }
      end
    end
  end
end
