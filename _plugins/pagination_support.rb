require 'jekyll'
require 'jekyll-paginate'

module Jekyll
  class CustomPaginationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Iterate over each collection defined in the site config
      site.config['collections']&.each do |collection_name, collection_config|
        next unless collection_config['pagination'] && collection_config['pagination']['enabled']

        # Get pagination settings
        paginate = collection_config['pagination']['per_page'] || 5
        paginate_path = collection_config['pagination']['paginate_path'] || "/#{collection_name}/page:num/"
        index_file = collection_config['pagination']['index_file'] || 'index.html'

        # Get the collection
        collection = site.collections[collection_name].docs
        total_items = collection.size
        total_pages = (total_items.to_f / paginate).ceil

        # Process each page
        (1..total_pages).each do |page_number|
          # Prepare paginator data
          paginator = {
            'page' => page_number,
            'per_page' => paginate,
            'posts' => [], # For compatibility with existing templates
            'total_posts' => total_items,
            'total_pages' => total_pages,
            'previous_page' => page_number > 1 ? page_number - 1 : nil,
            'next_page' => page_number < total_pages ? page_number + 1 : nil
          }

          # Calculate items for the current page
          start_index = (page_number - 1) * paginate
          end_index = start_index + paginate - 1
          paginator['items'] = collection[start_index..end_index] || []

          # For compatibility with post-based templates
          paginator['posts'] = paginator['items']

          # Determine output path
          if page_number == 1
            output_path = File.join(collection_name, index_file)
          else
            output_path = File.join(collection_name, paginate_path.sub(':num', page_number.to_s), index_file)
          end

          # Create a new page
          page = CustomPaginationPage.new(site, site.source, output_path, index_file, paginator, collection_name)
          site.pages << page
        end
      end
    end
  end

  class CustomPaginationPage < Page
    def initialize(site, base, path, template, paginator, collection_name)
      @site = site
      @base = base
      @dir = File.dirname(path)
      @name = File.basename(path)

      process(@name)
      read_yaml(File.join(base, '_layouts'), template)

      data['paginator'] = paginator
      data['collection'] = collection_name

      # Set layout if specified in collection config
      if site.config['collections'][collection_name]['pagination']['layout']
        data['layout'] = site.config['collections'][collection_name]['pagination']['layout']
      end
    end
  end
end
