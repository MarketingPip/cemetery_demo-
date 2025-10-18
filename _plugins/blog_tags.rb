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

# --- Generate paginated category and tag index pages for the 'blog' collection ---
Jekyll::Hooks.register :site, :post_read do |site|
  collection = site.collections['posts']
  next unless collection

  posts = collection.docs.sort_by { |doc| doc.date }.reverse
  per_page = site.config['paginate'] || 10
  template = '_layouts/tag.html'

  unless File.exist?(File.join(site.source, template))
    Jekyll.logger.warn "Blog Pagination: Template #{template} not found."
    next
  end

  # ===========================================================
  # 1️⃣ Collect all categories and tags with counts
  # ===========================================================
  category_counts = Hash.new(0)
  tag_counts = Hash.new(0)

  posts.each do |doc|
    (doc.data['categories'] || []).each { |c| category_counts[c] += 1 }
    (doc.data['tags'] || []).each { |t| tag_counts[t] += 1 }
  end

  all_categories = category_counts.keys.sort
  all_tags = tag_counts.keys.sort

  # ===========================================================
  # 2️⃣ /blog/categories/ — paginated list of all categories
  # ===========================================================
  total_category_pages = (all_categories.size.to_f / per_page).ceil

  (1..total_category_pages).each do |page_number|
    offset = (page_number - 1) * per_page
    page_categories = all_categories.slice(offset, per_page)

    dir = page_number == 1 ? "blog/categories" : "blog/categories/page#{page_number}"

    page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
    cat_template = '_layouts/category_index.html'
    page.data['categories'] = page_categories.map { |c| { 'name' => c, 'count' => category_counts[c] } }
    page.data['title'] = "All Blog Categories"
    page.data['paginator'] = {
      'page' => page_number,
      'per_page' => per_page,
      'total_pages' => total_category_pages,
      'total_categories' => all_categories.size,
      'previous_page' => page_number > 1 ? page_number - 1 : nil,
      'next_page' => page_number < total_category_pages ? page_number + 1 : nil
    }
    page.data['layout'] = File.basename(cat_template, '.*')

    Jekyll::Hooks.trigger :pages, :post_init, page
    site.pages << page
  end

  # ===========================================================
  # 3️⃣ /blog/categories/<category>/ — paginated posts by category
  # ===========================================================
  all_categories.each do |category|
    categorized_posts = posts.select { |doc| (doc.data['categories'] || []).include?(category) }
    total_pages = (categorized_posts.size.to_f / per_page).ceil

    (1..total_pages).each do |page_number|
      offset = (page_number - 1) * per_page
      page_posts = categorized_posts.slice(offset, per_page)
      dir = page_number == 1 ?
        "blog/categories/#{Jekyll::Utils.slugify(category)}" :
        "blog/categories/#{Jekyll::Utils.slugify(category)}/page#{page_number}"

      page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
      page.data['category'] = { 'name' => category, 'count' => category_counts[category] }
      page.data['posts'] = page_posts
      category_template = '_layouts/category.html'
      page.data['title'] = "Posts in category '#{category}'"
      page.data['paginator'] = {
        'page' => page_number,
        'per_page' => per_page,
        'total_pages' => total_pages,
        'total_posts' => categorized_posts.size,
        'previous_page' => page_number > 1 ? page_number - 1 : nil,
        'next_page' => page_number < total_pages ? page_number + 1 : nil
      }
      page.data['layout'] = File.basename(category_template, '.*')

      Jekyll::Hooks.trigger :pages, :post_init, page
      site.pages << page
    end
  end

  # ===========================================================
  # 4️⃣ /blog/tags/ — paginated list of all tags
  # ===========================================================
  total_tag_pages = (all_tags.size.to_f / per_page).ceil

  (1..total_tag_pages).each do |page_number|
    offset = (page_number - 1) * per_page
    page_tags = all_tags.slice(offset, per_page)

    dir = page_number == 1 ? "blog/tags" : "blog/tags/page#{page_number}"

    page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
    tag_template = '_layouts/tag_index.html'
    page.data['tags'] = page_tags.map { |t| { 'name' => t, 'count' => tag_counts[t] } }
    page.data['title'] = "All Blog Tags"
    page.data['paginator'] = {
      'page' => page_number,
      'per_page' => per_page,
      'total_pages' => total_tag_pages,
      'total_tags' => all_tags.size,
      'previous_page' => page_number > 1 ? page_number - 1 : nil,
      'next_page' => page_number < total_tag_pages ? page_number + 1 : nil
    }
    page.data['layout'] = File.basename(tag_template, '.*')

    Jekyll::Hooks.trigger :pages, :post_init, page
    site.pages << page
  end

  # ===========================================================
  # 5️⃣ /blog/tags/<tag>/ — paginated posts by tag
  # ===========================================================
  all_tags.each do |tag|
    tagged_posts = posts.select { |doc| (doc.data['tags'] || []).include?(tag) }
    total_pages = (tagged_posts.size.to_f / per_page).ceil

    (1..total_pages).each do |page_number|
      offset = (page_number - 1) * per_page
      page_posts = tagged_posts.slice(offset, per_page)
      dir = page_number == 1 ?
        "blog/tags/#{Jekyll::Utils.slugify(tag)}" :
        "blog/tags/#{Jekyll::Utils.slugify(tag)}/page#{page_number}"

      page = Jekyll::PaginationPage.new(site, site.source, dir, 'index.html', template)
      page.data['tag'] = { 'name' => tag, 'count' => tag_counts[tag] }
      page.data['posts'] = page_posts
      page.data['title'] = "Posts tagged with '#{tag}'"
      page.data['paginator'] = {
        'page' => page_number,
        'per_page' => per_page,
        'total_pages' => total_pages,
        'total_posts' => tagged_posts.size,
        'previous_page' => page_number > 1 ? page_number - 1 : nil,
        'next_page' => page_number < total_pages ? page_number + 1 : nil
      }
      page.data['layout'] = File.basename(template, '.*')

      Jekyll::Hooks.trigger :pages, :post_init, page
      site.pages << page
    end
  end
end
