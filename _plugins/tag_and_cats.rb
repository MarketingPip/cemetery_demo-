module Jekyll
  # Represents a paginated page
  class PaginationPage < Page
    def initialize(site, base, dir, name, template_path)
      @site = site
      @base = base
      @dir  = dir
      @name = name

      process(name)
      read_yaml(File.join(site.source, File.dirname(template_path)), File.basename(template_path))
    end
  end

  # Generates paginated category and tag pages for exhibits and blog posts
  class CategoryTagPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      collections_to_paginate = {
        "exhibits" => site.collections["exhibits"],
        "blog"     => site.collections["posts"]
      }.compact

      collections_to_paginate.each do |type, collection|
        docs = collection.docs.sort_by { |doc| doc.date || Time.at(0) }.reverse
        paginate_group(site, docs, type, "categories")
        paginate_group(site, docs, type, "tag")
      end
    end

    private

    def paginate_group(site, docs, type, key)
      is_category = key == "categories"
      label = is_category ? "category" : "tag"
      template = "_layouts/tag.html"
      per_page = site.config["paginate"] || 10

      template_path = File.join(site.source, template)
      unless File.exist?(template_path)
        Jekyll.logger.warn "Pagination:", "Template #{template} not found."
        return
      end

      # Group documents by category or tag
      grouped = Hash.new { |h, k| h[k] = [] }
      docs.each do |doc|
        items = doc.data[key] || []
        items = [items] unless items.is_a?(Array)
        items.map(&:strip).map(&:downcase).each { |item| grouped[item] << doc }
      end

      grouped.each do |group_key, docs_in_group|
        slug = group_key.strip.downcase.gsub(/\s+/, "-").gsub(/[^a-z0-9\-]/, "")
        pages = (docs_in_group.size.to_f / per_page).ceil

        (1..pages).each do |page_number|
          offset = (page_number - 1) * per_page
          paged_docs = docs_in_group.slice(offset, per_page)
          dir = page_number == 1 ? "#{type}/#{label}/#{slug}" : "#{type}/#{label}/#{slug}/page#{page_number}"

          page = PaginationPage.new(site, site.source, dir, "index.html", template_path)

          page.data[type] = paged_docs
          page.data["paginator"] = {
            "page"          => page_number,
            "per_page"      => per_page,
            "total_pages"   => pages,
            "total_items"   => docs_in_group.size,
            "previous_page" => page_number > 1 ? page_number - 1 : nil,
            "next_page"     => page_number < pages ? page_number + 1 : nil
          }

          page.data["layout"] = File.basename(template, ".*")
          page.data["title"]  = "#{type.capitalize} #{label.capitalize}: #{group_key.capitalize}"
          page.data[label]    = group_key

          Jekyll.logger.info "Pagination:", "Wrote /#{dir}/index.html"
          site.pages << page
        end
      end
    end
  end
end
