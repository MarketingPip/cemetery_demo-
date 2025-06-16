# paginator.rb
module Jekyll
  class ExhibitsPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Check if exhibits collection exists
      return unless site.collections['exhibits']

      # Get the exhibits collection and sort by date (or other criteria)
      exhibits = site.collections['exhibits'].docs.sort_by { |doc| doc.date }.reverse

      # Configuration for pagination (default to 10 exhibits per page)
      per_page = site.config['exhibits_per_page'] || 10
      total_pages = (exhibits.size.to_f / per_page).ceil

      # Path to the exhibits index template
      template = site.config['exhibits_index_template'] || '_layouts/exhibits_index.html'

      # Ensure the template exists
      unless File.exist?(File.join(site.source, template))
        Jekyll.logger.warn "Exhibits Pagination: Template #{template} not found."
        return
      end

      # Generate paginated pages
      (1..total_pages).each do |page_number|
        # Calculate the slice of exhibits for the current page
        offset = (page_number - 1) * per_page
        page_exhibits = exhibits.slice(offset, per_page)

        # Define the path for the page
        path = page_number == 1 ? '/exhibits/index.html' : "/exhibits/page#{page_number}/index.html"

        # Create a new page for the current pagination
        page = Page.new(site, site.source, File.dirname(path), File.basename(path))

        # Set pagination data
        page.data['exhibits'] = page_exhibits
        page.data['paginator'] = {
          'page' => page_number,
          'per_page' => per_page,
          'total_pages' => total_pages,
          'total_exhibits' => exhibits.size,
          'previous_page' => page_number > 1 ? page_number - 1 : nil,
          'next_page' => page_number < total_pages ? page_number + 1 : nil
        }

        # Set layout to the exhibits index template
        page.data['layout'] = File.basename(template, '.*')
        page.data['title'] = "Exhibits"
        # Read and render the template content
        template_path = File.join(site.source, template)
        template_content = File.read(template_path)
        page.content = template_content

        # Render the page content using Liquid to ensure compatibility
        page.render(site.layouts, site.site_payload)

        # Add the page to the site
        site.pages << page
      end
    end
  end
end
