# Filename: _plugins/generate_tag_pages.rb
module Jekyll
  class GenerateTagPages < Generator
    safe true

    def generate(site)
      Jekyll.logger.info "Starting tag page generation..."

      # Collect all tags from posts
      all_tags = []
      site.posts.docs.each do |post|
        tags = post.data['tags'] || []
        all_tags += tags
      end
      all_tags = all_tags.uniq
      Jekyll.logger.info "Found tags: #{all_tags.join(', ')}"

      # Create a tag page for each tag
      all_tags.each do |tag|
        dir = "blog/tag/#{tag}"
        name = "index.html"
        Jekyll.logger.info "Creating page for tag '#{tag}' at '#{dir}/#{name}'"

        # Use PageWithoutAFile for virtual pages
        begin
          page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
          page.data = {
            'layout' => 'tag_page',
            'tag' => tag,
            'robots' => 'noindex'
          }
          page.content = '' # Content can be empty; layout handles rendering
          site.pages << page
          Jekyll.logger.info "Page added for tag '#{tag}'"
        rescue StandardError => e
          Jekyll.logger.error "Error creating page for tag '#{tag}': #{e.message}"
          raise # Re-raise to halt and show the full stack trace
        end
      end

      Jekyll.logger.info "Tag page generation complete."
    end
  end
end
