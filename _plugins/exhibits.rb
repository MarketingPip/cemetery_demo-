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

  class ExhibitsPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      return unless site.collections['exhibits']

      exhibits = site.collections['exhibits'].docs.sort_by { |doc| doc.date }.reverse
      per_page = site.config['exhibits_per_page'] || 10
      total_pages = (exhibits.size.to_f / per_page).ceil
      template = site.config['exhibits_index_template'] || '_layouts/exhibits_index.html'

      unless File.exist?(File.join(site.source, template))
        Jekyll.logger.warn "Exhibits Pagination: Template #{template} not found."
        return
      end

      (1..total_pages).each do |page_number|
        offset = (page_number - 1) * per_page
        page_exhibits = exhibits.slice(offset, per_page)
        dir = page_number == 1 ? 'exhibits' : "exhibits/page#{page_number}"
        name = 'index.html'

        page = PaginationPage.new(site, site.source, dir, name, template)

        page.data['exhibits'] = page_exhibits
        page.data['paginator'] = {
          'page' => page_number,
          'per_page' => per_page,
          'total_pages' => total_pages,
          'total_exhibits' => exhibits.size,
          'previous_page' => page_number > 1 ? page_number - 1 : nil,
          'next_page' => page_number < total_pages ? page_number + 1 : nil
        }
        page.data['layout'] = File.basename(template, '.*')
        page.data['title'] = "Exhibits"

        site.pages << page
      end
    end
  end
end
