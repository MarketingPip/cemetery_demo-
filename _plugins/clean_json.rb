require 'jekyll'
require 'json'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      site.pages.each do |page|
        if page.data['clean_json'] == true && page.path.end_with?('.json')
          clean_json_content(page, site)
        end
      end
    end

    private

    def clean_json_content(page, site)
      begin
        # Render the page's content to process Liquid tags
        rendered_content = Jekyll::Renderer.new(site, page).run

        # Parse the rendered content as JSON
        parsed_json = JSON.parse(rendered_content)

        # Reformat the JSON with consistent formatting
        cleaned_json = JSON.pretty_generate(parsed_json, indent: '  ')

        # Update the page's content with the cleaned JSON
        page.content = cleaned_json

        puts "Cleaned JSON for page: #{page.path}"
      rescue JSON::ParserError => e
        puts "Failed to parse JSON for page #{page.path}: #{e.message}"
      rescue StandardError => e
        puts "Error processing page #{page.path}: #{e.message}"
      end
    end
  end
end
