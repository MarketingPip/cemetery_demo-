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
end

# --- Hook to generate exhibits category + tag pagination only ---
Jekyll::Hooks.register :site, :post_read do |site|
  next unless site.collections['exhibits']

  exhibits = site.collections['exhibits'].docs.sort_by { |doc| doc.date }.reverse
  per_page = site.config['paginate'] || 10
  template = '_layouts/tag.html'

  unless File.exist?(File.join(site.source, template))
    Jekyll.logger.warn "Exhibits Pagination:", "Template #{template} not found."
    next
  end

  # --- 1️⃣ Category pagination ---
  all_categories = exhibits.flat_map { |doc| doc.data['categories'] || [] }.uniq
  all_categories.each do |category|
    categorized = exhibits.select { |doc| (doc.data['categories'] || []).include?(category) }
    next if categorized.empty?

    total_pages = (categorized.size.to_f / per_page).ceil
    (1..total_pages).each do |page_number|
      offset = (page_number - 1) * per_page
      page_exhibits = categorized.slice(offset, per_page)
      dir = page_number == 1 ?
              "exhibits/categories/#{Jekyll::Utils.slugify(category)}" :
              "exhibits/categories/#{Jekyll::Utils.slugify(category)}/page#{page_number}"

      page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
      page.data['category'] = category
      page.data['paginator'] = {
        'page' => page_number,
        'per_page' => per_page,
        'total_pages' => total_pages,
        'total_exhibits' => categorized.size,
        'previous_page' => page_number > 1 ? page_number - 1 : nil,
        'next_page' => page_number < total_pages ? page_number + 1 : nil,
        'posts' => page_exhibits
      }
      page.data['layout'] = File.basename(template, '.*')
      page.data['title'] = "Exhibits in category '#{category}'"

      Jekyll::Hooks.trigger :pages, :post_init, page
      site.pages << page
    end
  end

  # --- 2️⃣ Tag pagination ---
  all_tags = exhibits.flat_map { |doc| doc.data['tags'] || [] }.uniq
  all_tags.each do |tag|
    tagged = exhibits.select { |doc| (doc.data['tags'] || []).include?(tag) }
    next if tagged.empty?

    total_pages = (tagged.size.to_f / per_page).ceil
    (1..total_pages).each do |page_number|
      offset = (page_number - 1) * per_page
      page_exhibits = tagged.slice(offset, per_page)
      dir = page_number == 1 ?
              "exhibits/tag/#{Jekyll::Utils.slugify(tag)}" :
              "exhibits/tag/#{Jekyll::Utils.slugify(tag)}/page#{page_number}"

      page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
      page.data['exhibits'] = page_exhibits
      page.data['tag'] = tag
      page.data['paginator'] = {
        'page' => page_number,
        'per_page' => per_page,
        'total_pages' => total_pages,
        'total_exhibits' => tagged.size,
        'previous_page' => page_number > 1 ? page_number - 1 : nil,
        'next_page' => page_number < total_pages ? page_number + 1 : nil,
        'posts' => page_exhibits
      }
      page.data['layout'] = File.basename(template, '.*')
      page.data['title'] = "Exhibits tagged with '#{tag}'"

      Jekyll::Hooks.trigger :pages, :post_init, page
      site.pages << page
    end
  end
end
