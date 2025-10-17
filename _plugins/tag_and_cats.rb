module Jekyll
  class GenerateTagAndCategoryPages < Generator
    safe true
    priority :low

    # Default posts per page
    POSTS_PER_PAGE = 10

    COLLECTIONS = %w[blog exhibits].freeze
    KEYS = %w[categories tags].freeze

    def generate(site)
      COLLECTIONS.each do |collection_name|
        collection = site.collections[collection_name]
        next unless collection

        docs = collection.docs.sort_by { |d| d.date || Time.at(0) }.reverse
        next if docs.empty?

        KEYS.each do |key|
          terms = collect_terms(docs, key)
          terms.each do |term|
            term_docs = docs.select { |d| Array(d.data[key] || []).map(&:to_s).include?(term) }
            total_pages = (term_docs.size.to_f / POSTS_PER_PAGE).ceil
            next if total_pages.zero?

            (1..total_pages).each do |page_num|
              paginate(site, collection_name, key, term, term_docs, page_num, total_pages)
            end
          end
        end
      end
      Jekyll.logger.info "Pagination:", "Tag and category pages generation complete."
    end

    private

    def collect_terms(docs, key)
      docs.flat_map { |d| Array(d.data[key] || []) }.map(&:to_s).uniq.compact
    end

    def paginate(site, collection_name, key, term, term_docs, page_num, total_pages)
      start_index = (page_num - 1) * POSTS_PER_PAGE
      page_posts = term_docs[start_index, POSTS_PER_PAGE] || []

      # slugify term
      slug = term.to_s.downcase.strip.gsub(' ', '-').gsub(/[^a-z0-9\-]/, '')

      dir = if page_num == 1
              "#{collection_name}/#{key}/#{slug}"
            else
              "#{collection_name}/#{key}/#{slug}/page#{page_num}"
            end

      name = "index.html"
      Jekyll.logger.info "Creating #{dir}/#{name}"

      begin
        page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
        page.data = {
          'layout' => key.chomp('s'), # 'category' or 'tag'
          key.chomp('s') => term,
          'robots' => 'noindex',
          'paginator' => {
            'page' => page_num,
            'per_page' => POSTS_PER_PAGE,
            'total_pages' => total_pages,
            'total_posts' => term_docs.size,
            'previous_page' => (page_num > 1 ? page_num - 1 : nil),
            'next_page' => (page_num < total_pages ? page_num + 1 : nil),
            'posts' => page_posts
          }
        }
        page.content = ''
        site.pages << page
      rescue StandardError => e
        Jekyll.logger.error "Error creating page for #{collection_name}/#{key}/#{term}: #{e.message}"
        raise
      end
    end
  end
end
