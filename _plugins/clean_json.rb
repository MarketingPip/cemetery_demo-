require 'jekyll'
require 'json'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # Ensure that we only clean files after the site is fully generated
      site.pages.each do |page|
        # Check if the page has the 'clean_json' flag and if it's a JSON file
        if page.data['clean_json'] == true && page.path.end_with?('.json')
          clean_json_file(page)
        end
      end
    end

    private

    # Method to clean the JSON file by removing extra whitespaces
    def clean_json_file(page)
      file_path = File.join(page.site.source, page.path)

      # Read the rendered content (post-Jekyll build, with Liquid processed)
      file_content = page.output

      # Strip off YAML front matter if it exists
      if file_content.start_with?('---')
        front_matter_end = file_content.index('---', 3)
        json_content = file_content[(front_matter_end + 3)..-1].strip
      else
        json_content = file_content.strip
      end

      # Parse the JSON and reformat it to remove excessive whitespace
      begin
        parsed_json = JSON.parse(json_content)
        cleaned_json = JSON.pretty_generate(parsed_json, indent: '  ')  # Custom indentation

        # Write the cleaned JSON back to the file
        File.open(file_path, 'w') { |f| f.write(cleaned_json) }
        puts "Cleaned JSON file: #{file_path}"
      rescue JSON::ParserError => e
        puts "Failed to parse JSON in file #{file_path}: #{e.message}"
      end
    end
  end
end
