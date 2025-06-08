# Filename: _plugins/update_author_yaml.rb
require "yaml"

module Jekyll
  class UpdateAuthorYAML < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "Starting author YAML update…"

      authors_dir = File.join(site.source, "_authors")
      site.collections["authors"] ||= Jekyll::Collection.new(site, "authors")

      site.posts.docs.each do |post|
        author_name = post.data["author"]
        next unless author_name

        # Build a URL‐slug and date strings consistently
        formatted_date = post.data["date"].strftime("%Y/%m/%d")
        slug = post.data["title"]
                 .downcase
                 .strip
                 .gsub(/[^\w]+/, "-")
                 .gsub(/^-|-$/, "")

        post_info = {
          "title"   => post.data["title"],
          "url"     => "/blog/#{formatted_date}/#{slug}",
          "date"    => post.data["date"].strftime("%Y-%m-%d"),
          "excerpt" => escape_excerpt(post.data["excerpt"].to_s || "")
        }

        update_or_create_author_file(site, authors_dir, author_name, post_info)
      end

      Jekyll.logger.info "Author YAML update complete."
    end

    private

    # Escape any double quotes or backslashes so that YAML.dump will still emit a valid string
    def escape_excerpt(text)
      text.gsub(/["\\]/) { |s| "\\#{s}" }
    end

    def update_or_create_author_file(site, authors_dir, author_name, post_info)
      # Turn "John Doe" into "john-doe.md"
      author_filename = "#{author_name.downcase.strip.gsub(/\s+/, '-')}.md"
      author_path = File.join(authors_dir, author_filename)

      if File.exist?(author_path)
        # Read existing file, parse front matter, push new post if it doesn't already exist
        raw = File.read(author_path)
        parsed = parse_front_matter(raw)

        # `parsed[:data]` is always a Hash, even if there was no front‐matter before
        front_data = parsed[:data]
        front_data["posts"] ||= []

        unless front_data["posts"].any? { |p| p["url"] == post_info["url"] }
          front_data["posts"] << post_info

          # Re‐dump the entire front‐matter hash
          new_front_matter = front_data.to_yaml

          # The part after front‐matter (if any) was in parsed[:content]
          body_content = parsed[:content] || ""

          new_content = +"---\n" + new_front_matter + "---\n" + body_content

          Jekyll.logger.info "Writing to #{author_path}: #{new_content.lines.first.chomp}…"
          File.write(author_path, new_content)
          Jekyll.logger.info "Updated file for author: #{author_name}"

          update_site_collection(site, author_filename, front_data, body_content)
        else
          Jekyll.logger.info "Post already exists for author '#{author_name}': #{post_info['title']}"
        end
      else
        # File does not exist yet → create a brand‐new front‐matter with name + posts array
        create_author_file(site, author_path, author_name, post_info)
      end
    end

    def create_author_file(site, author_path, author_name, post_info)
      # Build a Ruby hash and dump it all at once
      author_data = {
        "name"  => author_name,
        "posts" => [ post_info ]
      }

      front_matter = author_data.to_yaml
      content = +"---\n" + front_matter + "---\n"

      # Write the new .md file under _authors/
      File.write(author_path, content)
      Jekyll.logger.info "Created new author file for #{author_name} at #{author_path}"

      # Add to in‐memory collection so Jekyll “sees” it immediately
      new_doc = Jekyll::Document.new(
        author_path,
        { site: site, collection: site.collections["authors"] }
      )
      new_doc.read
      site.collections["authors"].docs << new_doc
    end

    def parse_front_matter(content)
      # If it starts with a YAML front‐matter block (--- … ---)
      if content =~ /\A(---\s*\n.*?\n?)^(---\s*\n)/m
        front_block = Regexp.last_match(1)
        body = Regexp.last_match.post_match

        # Load the YAML into a Ruby hash (or empty hash)
        data = YAML.safe_load(front_block, permitted_classes: [Date, Time]) || {}
        Jekyll.logger.debug "Parsed front matter keys: #{data.keys.inspect}"
        { data: data, content: body }
      else
        # No front matter at all → return an empty hash for data
        Jekyll.logger.warn "No front matter found in author file. Assuming blank."
        { data: {}, content: content }
      end
    end

    def update_site_collection(site, filename, data, body_content)
      # Find (or add) the Document in site.collections["authors"]
      basename = File.basename(filename, ".md")
      existing = site.collections["authors"].docs.find { |d| d.basename_without_ext == basename }

      if existing
        existing.data.merge!(data)
        existing.content = body_content || ""
        Jekyll.logger.info "Updated in‐memory author doc: #{filename}"
      else
        new_doc = Jekyll::Document.new(
          File.join(site.source, "_authors", filename),
          { site: site, collection: site.collections["authors"] }
        )
        new_doc.read
        new_doc.data.merge!(data)
        new_doc.content = body_content || ""
        site.collections["authors"].docs << new_doc
        Jekyll.logger.info "Added in‐memory author doc: #{filename}"
      end
    end
  end
end
