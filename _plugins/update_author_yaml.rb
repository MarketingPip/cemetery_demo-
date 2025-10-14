require 'yaml'

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "🔄 Starting author YAML update..."

      authors_dir = File.join(site.source, '_authors')
      site.collections['authors'] ||= Jekyll::Collection.new(site, 'authors')

      # --- Handle posts ---
      (site.collections['posts']&.docs || site.posts.docs).each do |post|
        author_name = post.data['author'] || Array(post.data['authors']).first
        next unless author_name

        slug = post.data['slug'] || File.basename(post.relative_path, '.md').sub(/^\d{4}-\d{2}-\d{2}-/, '')
        formatted_date = post.data['date'].strftime('%Y/%m/%d') rescue ''

        post_info = {
          'title' => post.data['title'],
          'url' => post.url || "/blog/#{formatted_date}/#{slug}",
          'date' => post.data['date'].strftime('%Y-%m-%d') rescue nil,
          'excerpt' => (post.data['excerpt'] || '').to_s[0, 100]
        }

        update_author_file(site, authors_dir, author_name, post_info, nil)
      end

      # --- Handle exhibits ---
      if site.collections['exhibits']
        site.collections['exhibits'].docs.each do |exhibit|
          author_name = exhibit.data['author'] || Array(exhibit.data['authors']).first
          next unless author_name

          slug = exhibit.data['slug'] || File.basename(exhibit.relative_path, '.md')
          date_str = exhibit.data['date'].strftime('%Y-%m-%d') rescue nil

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

      Jekyll.logger.info "✅ Author YAML update complete."
    end

    private

    # Normalize author filename consistently
    def normalized_author_filename(name)
      "#{name.to_s.strip.downcase.gsub(/\s+/, '-')}.md"
    end

    def update_author_file(site, authors_dir, author_name, post_info = nil, exhibit_info = nil)
      author_filename = normalized_author_filename(author_name)
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        content = File.read(author_path)
        parsed = parse_front_matter(content)

        # Initialize keys if missing
        parsed[:data]['posts'] ||= []
        parsed[:data]['exhibits'] ||= []

        # --- Handle posts ---
        if post_info
          existing_index = parsed[:data]['posts'].index { |p| p['url'] == post_info['url'] || p['title'] == post_info['title'] }
          if existing_index
            if parsed[:data]['posts'][existing_index] != post_info
              parsed[:data]['posts'][existing_index] = post_info
              Jekyll.logger.info "📝 Updated existing post for #{author_name}: #{post_info['title']}"
            end
          else
            parsed[:data]['posts'] << post_info
            Jekyll.logger.info "➕ Added new post for #{author_name}: #{post_info['title']}"
          end
        end

        # --- Handle exhibits ---
        if exhibit_info
          existing_index = parsed[:data]['exhibits'].index { |e| e['url'] == exhibit_info['url'] || e['title'] == exhibit_info['title'] }
          if existing_index
            if parsed[:data]['exhibits'][existing_index] != exhibit_info
              parsed[:data]['exhibits'][existing_index] = exhibit_info
              Jekyll.logger.info "📝 Updated exhibit for #{author_name}: #{exhibit_info['title']}"
            end
          else
            parsed[:data]['exhibits'] << exhibit_info
            Jekyll.logger.info "➕ Added exhibit for #{author_name}: #{exhibit_info['title']}"
          end
        end

        # Ensure both arrays exist, even if empty
        parsed[:data]['posts'] ||= []
        parsed[:data]['exhibits'] ||= []

        parsed_content = parsed[:content] || ''
        yaml_content = parsed[:data].to_yaml.sub(/^---\n/, '')
        new_content = "---\n#{yaml_content}---\n#{parsed_content}"

        File.write(author_path, new_content)
        File.utime(Time.now, Time.now, author_path)

        Jekyll.logger.info "💾 Wrote updated file: #{author_path}"

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

      Jekyll.logger.info "🆕 Created new author file: #{author_path}"

      new_doc = Jekyll::Document.new(
        author_path,
        { site: site, collection: site.collections['authors'] }
      )
      new_doc.read

      unless site.collections['authors'].docs.any? { |d| d.path == new_doc.path }
        site.collections['authors'].docs << new_doc
        Jekyll.logger.info "📄 Added in-memory doc for #{author_name}"
      else
        Jekyll.logger.warn "⚠️ Skipped duplicate doc for #{author_name}"
      end
    end

    def update_site_data(site, filename, data, content)
      collection = site.collections['authors']
      basename = File.basename(filename, '.md')
      author_path = File.join(site.source, '_authors', filename)

      existing_doc = collection.docs.find { |d| d.path == author_path || d.basename_without_ext == basename }

      if existing_doc
        existing_doc.data.merge!(data)
        existing_doc.content = content || ''
        Jekyll.logger.info "🔄 Updated in-memory author doc for #{filename}"
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
          Jekyll.logger.info "📄 Added new in-memory author: #{filename}"
        else
          Jekyll.logger.warn "⚠️ Skipped duplicate in-memory doc for #{filename}"
        end
      end
    end

    def parse_front_matter(content)
      if content =~ /\A---\s*\n(.*?)\n---\s*\n?/m
        begin
          data = YAML.safe_load($1, permitted_classes: [Date, Time], aliases: true) || {}
        rescue => e
          Jekyll.logger.warn "⚠️ YAML parse error: #{e.message}"
          data = {}
        end
        body = $POSTMATCH
        { data: data, content: body }
      else
        Jekyll.logger.warn "⚠️ No front matter found in: #{content[0..50]}..."
        { data: {}, content: content }
      end
    end
  end
end
