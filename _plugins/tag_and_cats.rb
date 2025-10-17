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

  class TagsPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Collect all unique tags from posts
      all_tags = site.posts.docs.flat_map { |p| p.data['tags'] || [] }.uniq
      return if all_tags.empty?

      per_page = site.config['paginate'] || 10
      template =  '_layouts/tag.html'

      unless File.exist?(File.join(site.source, template))
        Jekyll.logger.warn "Tags Pagination: Template #{template} not found."
        return
      end

      all_tags.each do |tag|
        tagged_posts = site.posts.docs.select { |p| (p.data['tags'] || []).include?(tag) }
        tagged_posts.sort_by! { |p| -p.date.to_f }

        total_pages = (tagged_posts.size.to_f / per_page).ceil

        (1..total_pages).each do |page_number|
          offset = (page_number - 1) * per_page
          page_posts = tagged_posts.slice(offset, per_page)
          dir = page_number == 1 ? "blog/tag/#{tag}" : "blog/tag/#{tag}/page#{page_number}"
          name = 'index.html'

          page = PaginationPage.new(site, site.source, dir, name, template)

          page.data['posts'] = page_posts
          page.data['tag'] = tag
          page.data['paginator'] = {
            'page' => page_number,
            'per_page' => per_page,
            'total_pages' => total_pages,
            'total_posts' => tagged_posts.size,
            'previous_page' => page_number > 1 ? page_number - 1 : nil,
            'next_page' => page_number < total_pages ? page_number + 1 : nil
          }
          page.data['layout'] = File.basename(template, '.*')
          page.data['title'] = "Posts tagged with '#{tag}'"

          site.pages << page
        end
      end
    end
  end
end
