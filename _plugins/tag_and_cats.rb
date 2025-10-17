# Filename: _plugins/generate_tag_and_category_pages.rb
module Jekyll
  class GenerateTagAndCategoryPages < Generator
    safe true
    priority :low

    POSTS_PER_PAGE = 10

    COLLECTIONS = %w[blog exhibits].freeze
    KEYS = %w[categories tags].freeze

    def generate(site)
      Jekyll.logger.info "Starting tag and category page generation with pagination..."

      COLLECTIONS.each do |collection_name|
        collection = site.collections[collection_name]
        next unless collection

        docs = collection.docs
        KEYS.each do |key|
          all_values = docs.flat_map { |p| p.data[key] || [] }.uniq
          next if all_values.empty?

          all_values.each do |value|
            value_posts = docs.select { |p| (p.data[key] || []).include?(value) }
            value_posts.sort_by! { |p| -p.date.to_f }

            total_pages = (value_posts.size.to_f / POSTS_PER_PAGE).ceil
            Jekyll.logger.info "Generating #{total_pages} pages for #{collection_name} #{key.singularize} '#{value}'"

            (1..total_pages).each do |page_num|
              paginate(site, collection_name, key, value, value_posts, page_num, total_pages)
            end
          end
        end
      end

      Jekyll.logger.info "Tag and category page generation complete."
    end

    def paginate(site, collection_name, key, value, posts, page_num, total_pages)
      start_index = (page_num - 1) * POSTS_PER_PAGE
      end_index = start_index + POSTS_PER_PAGE - 1
      page_posts = posts[start_index..end_index] || []

      base_dir = "#{collection_name}/#{key}/#{value}"
      dir = page_num == 1 ? base_dir : "#{base_dir}/page#{page_num}"
      name = "index.html"

      Jekyll.logger.info "Creating #{dir}/#{name}"

      begin
        page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
        page.data = {
          'layout' => key.singularize,
          key.singularize => value,
          'robots' => 'noindex',
          'paginator' => {
            'page' => page_num,
            'per_page' => POSTS_PER_PAGE,
            'total_pages' => total_pages,
            'total_posts' => posts.size,
            'previous_page' => (page_num > 1 ? page_num - 1 : nil),
            'next_page' => (page_num < total_pages ? page_num + 1 : nil),
            'posts' => page_posts
          }
        }
        page.content = ''
        site.pages << page
      rescue StandardError => e
        Jekyll.logger.error "Error creating paginated page for #{key.singularize} '#{value}': #{e.message}"
        raise
      end
    end
  end
end
