module Jekyll
  #
  # Represents a generated paginated index page.
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
  # Generates paginated pages for exhibits and blog collections by category and tag.
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
        template_path = TEMPLATE_DEFAULTS[type]
        full_template_path = File.join(site.source, template_path)

        unless File.exist?(full_template_path)
          Jekyll.logger.warn "Pagination:", "Template not found for #{type}: #{template_path}"
          next
        end

        # Generate for categories and tags
        generate_for_group(site, type, docs, per_page, template_path, 'categories')
        generate_for_group(site, type, docs, per_page, template_path, 'tags')
      end
    end

    private

    #
    # Generate paginated pages for each category or tag group.
    #
    def generate_for_group(site, type, docs, per_page, template_path, group_key)
      groups = build_groups(docs, group_key)
      return if groups.empty?

      groups.each do |label, group_docs|
        total_pages = (group_docs.size.to_f / per_page).ceil

        (1..total_pages).each do |page_number|
          offset = (page_number - 1) * per_page
          page_items = group_docs.slice(offset, per_page) || []

          dir = base_path(type, group_key, label, page_number)
          name = 'index.html'
          page = PaginationPage.new(site, site.source, dir, name, template_path)

          # Data for Liquid
          page.data[type] = page_items
          page.data['layout'] = File.basename(template_path, '.*')
          page.data['title'] = "#{label.capitalize} #{group_key.singularize.capitalize}"
          page.data['paginator'] = {
            'page' => page_number,
            'per_page' => per_page,
            'total_pages' => total_pages,
            'total_items' => group_docs.size,
            'previous_page' => (page_number > 1 ? page_number - 1 : nil),
            'next_page' => (page_number < total_pages ? page_number + 1 : nil)
          }

          site.pages << page
        end
      end
    end

    #
    # Build hash of { label => [docs] } for categories or tags.
    #
    def build_groups(docs, key)
      groups = {}
      docs.each do |doc|
        values = Array(doc.data[key] || doc.data[key.singularize])
        values.each do |v|
          groups[v] ||= []
          groups[v] << doc
        end
      end
      groups
    end

    #
    # Build URL directory path for paginated pages.
    #
    def base_path(type, group_key, label, page_number)
      path = "#{type}/#{group_key}/#{slugify(label)}"
      path += "/page#{page_number}" if page_number > 1
      path
    end

    #
    # Convert category/tag to URL-friendly slug.
    #
    def slugify(label)
      label.to_s.downcase.strip.gsub(' ', '-').gsub(/[^a-z0-9\-]/, '')
    end
  end
end
