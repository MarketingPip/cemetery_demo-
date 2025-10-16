module Jekyll
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

  class CategoryTagPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      collections_to_paginate = {
        'exhibits' => site.collections['exhibits'],
        'blog' => site.collections['posts'] || site.collections['blog']
      }.compact

      collections_to_paginate.each do |type, collection|
        docs = collection.docs.sort_by { |doc| doc.date || Time.at(0) }.reverse

        paginate_group(site, docs, type, 'categories')
        paginate_group(site, docs, type, 'tag')
      end
    end

    private

    def paginate_group(site, docs, type, key)
      is_category = key == 'categories'
      label = is_category ? 'category' : 'tag'
      # template = site.config["#{type}_index_template"] || "_layouts/#{type}_index.html"
      template = "_layouts/tag.html"
      per_page = site.config['paginate'] || 10

      unless File.exist?(File.join(site.source, template))
        Jekyll.logger.warn "Pagination: Template #{template} not found."
        return
      end

      # Group docs by category or tag
      grouped = docs.group_by do |doc|
        items = doc.data[key] || []
        items = [items] unless items.is_a?(Array)
        items.map { |i| i.strip.downcase }
      end

      grouped.each do |group_keys, docs_in_group|
        group_keys.each do |group_key|
          pages = (docs_in_group.size.to_f / per_page).ceil

          (1..pages).each do |page_number|
            offset = (page_number - 1) * per_page
            paged_docs = docs_in_group.slice(offset, per_page)
            base_path = "#{type}/#{label}/#{group_key}"
            dir = page_number == 1 ? base_path : "#{base_path}/page#{page_number}"
            name = 'index.html'

            page = PaginationPage.new(site, site.source, dir, name, template)

            page.data[type] = paged_docs
            page.data['paginator'] = {
              'page' => page_number,
              'per_page' => per_page,
              'total_pages' => pages,
              'total_items' => docs_in_group.size,
              'previous_page' => page_number > 1 ? page_number - 1 : nil,
              'next_page' => page_number < pages ? page_number + 1 : nil
            }
            page.data['layout'] = key
            page.data['title'] = "#{type.capitalize} - #{label.capitalize}: #{group_key.capitalize}"
            page.data[label] = group_key

            site.pages << page
          end
        end
      end
    end
  end
end
