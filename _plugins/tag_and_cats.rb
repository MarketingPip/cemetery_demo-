module Jekyll
  #
  # Represents a generated paginated page based on a layout template.
  #
  class PaginationPage < Page
    def initialize(site, base, dir, name, template_path)
      @site = site
      @base = base
      @dir  = dir
      @name = name

      process(name)
      read_yaml(File.dirname(template_path), File.basename(template_path))
    end
  end

  #
  # Generates paginated pages for both exhibits and blog collections,
  # grouped by category and tag.
  #
  class AdvancedPaginationGenerator < Generator
    safe true
    priority :high

    COLLECTIONS = %w[exhibits blog].freeze
    TEMPLATE_DEFAULTS = {
      'exhibits' => '_layouts/tag.html',
      'blog' => '_layouts/tag.html'
    }.freeze

    def generate(site)
      COLLECTIONS.each do |type|
        collection = site.collections[type]
        next unless collection

        docs = collection.docs.sort_by { |doc| doc.date || Time.at(0) }.reverse
        next if docs.empty?

        per_page = site.config['paginate'] || 10
        template_path = site.config["#{type}_index_template"] || TEMPLATE_DEFAULTS[type]
        full_template_path = File.join(site.source, template_path)

        unless File.exist?(full_template_path)
          Jekyll.logger.warn "Pagination:", "Template not found for #{type}: #{template_path}"
          next
        end

        # Collect unique categories and tags from all docs
        categories = collect_terms(docs, 'categories')
        tags       = collect_terms(docs, 'tags')

        generate_grouped_pages(site, type, 'categories', categories, docs, per_page, full_template_path)
        generate_grouped_pages(site, type, 'tag', tags, docs, per_page, full_template_path)
      end
    end

    private

    #
    # Collects unique category or tag terms from all docs.
    #
    def collect_terms(docs, key)
      all_terms = []
      docs.each do |doc|
        values = Array(doc.data[key] || doc.data[key.chomp('s')])
        all_terms.concat(values.map(&:to_s))
      end
      all_terms.uniq.compact.reject(&:empty?)
    end

    #
    # Generates paginated pages for each term (category/tag)
    #
    def generate_grouped_pages(site, type, group_key, terms, docs, per_page, template_path)
      singular = group_key.end_with?('s') ? group_key.chomp('s') : group_key

      terms.each do |term|
        term_docs = docs.select do |doc|
          values = Array(doc.data[group_key] || doc.data[singular])
          values.map(&:to_s).include?(term)
        end

        total_pages = (term_docs.size.to_f / per_page).ceil
        next if total_pages.zero?

        (1..total_pages).each do |page_number|
          offset = (page_number - 1) * per_page
          paged_docs = term_docs.slice(offset, per_page)

          dir = page_number == 1 ?
            "#{type}/#{group_key}/#{slugify(term)}" :
            "#{type}/#{group_key}/#{slugify(term)}/page#{page_number}"

          page = PaginationPage.new(site, site.source, dir, 'index.html', template_path)
          page.data[type] = paged_docs
          page.data['layout'] = File.basename(template_path, '.*')
          page.data['title'] = "#{type.capitalize} #{group_key.capitalize}: #{term.capitalize}"
          page.data[singular] = term
          page.data['robots'] = 'noindex'
          page.data['paginator'] = {
            'page' => page_number,
            'per_page' => per_page,
            'total_pages' => total_pages,
            'total_items' => term_docs.size,
            'previous_page' => (page_number > 1 ? page_number - 1 : nil),
            'next_page' => (page_number < total_pages ? page_number + 1 : nil)
          }

          site.pages << page
          Jekyll.logger.info "Pagination:", "Generated /#{dir}/index.html (#{type} - #{group_key}: #{term}, page #{page_number})"
        end
      end
    end

    #
    # Converts text to a URL-friendly slug.
    #
    def slugify(text)
      text.to_s.downcase.strip.gsub(' ', '-').gsub(/[^a-z0-9\-]/, '')
    end
  end
end
