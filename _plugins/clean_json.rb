require 'jekyll'
require 'json'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # Iterate through each file in the site source
      site.pages.each do |page|
        # Check if the current page has the clean_json flag set to true
        if page.extname == '.json' && page.data['clean_json'] == true
          clean_json_file(page)
        end
      end
    end

    private

    # This method cleans the JSON file by removing excessive whitespace
    def clean_json_file(page)
      file_path = File.join(page.site.source, page.path)

      # Ensure the file is a JSON file and exists
      if File.exist?(file_path) && file_path.end_with?('.json')
        json_content = File.read(file_path)

        # Parse JSON and then re-encode it to remove excessive whitespace
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
end
