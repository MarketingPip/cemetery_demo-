# Filename: _plugins/generate_tag_pages.rb
module Jekyll
  class GenerateTagPages < Generator
    safe true
    priority :low

    # Configure how many posts per page
    POSTS_PER_PAGE = 10

    def generate(site)
      Jekyll.logger.info "Starting tag page generation with pagination..."

      # Collect all unique tags
      all_tags = site.posts.docs.flat_map { |p| p.data['tags'] || [] }.uniq
      Jekyll.logger.info "Found tags: #{all_tags.join(', ')}"

      all_tags.each do |tag|
        tagged_posts = site.posts.docs.select { |p| (p.data['tags'] || []).include?(tag) }
        tagged_posts.sort_by! { |p| -p.date.to_f }

        total_pages = (tagged_posts.size.to_f / POSTS_PER_PAGE).ceil
        Jekyll.logger.info "Generating #{total_pages} pages for tag '#{tag}'"

        (1..total_pages).each do |page_num|
          paginate(site, tag, tagged_posts, page_num, total_pages)
        end
      end

      Jekyll.logger.info "Tag page generation complete."
    end

    def paginate(site, tag, tagged_posts, page_num, total_pages)
      # Slice posts for this page
      start_index = (page_num - 1) * POSTS_PER_PAGE
      end_index = start_index + POSTS_PER_PAGE - 1
      page_posts = tagged_posts[start_index..end_index] || []

      dir = page_num == 1 ? "blog/tag/#{tag}" : "blog/tag/#{tag}/page#{page_num}"
      name = "index.html"

      Jekyll.logger.info "Creating #{dir}/#{name}"

      begin
        page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
        page.data = {
          'layout' => 'tag',
          'tag' => tag,
          'robots' => 'noindex',
          'paginator' => {
            'page' => page_num,
            'per_page' => POSTS_PER_PAGE,
            'total_pages' => total_pages,
            'total_posts' => tagged_posts.size,
            'previous_page' => (page_num > 1 ? page_num - 1 : nil),
            'next_page' => (page_num < total_pages ? page_num + 1 : nil),
            'posts' => page_posts
          }
        }
        page.content = ''
        site.pages << page
      rescue StandardError => e
        Jekyll.logger.error "Error creating paginated page for tag '#{tag}': #{e.message}"
        raise
      end
    end
  end
end
