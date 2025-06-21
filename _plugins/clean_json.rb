require 'jekyll'
require 'json'
require 'yaml'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # Find all JSON files in the site
      json_files = Dir.glob(File.join(site.source, '**', '*.json'))

      # Iterate through each JSON file and clean the whitespace if 'clean_json' flag in front matter is true
      json_files.each do |file_path|
        clean_json_file(file_path, site)
      end
    end

    private

    # This method will clean up whitespace in the given JSON file
    def clean_json_file(file_path, site)
      # Read the content of the JSON file
      file_content = File.read(file_path)

      # Extract the front matter (YAML block)
      front_matter, json_content = file_content.split("\n---\n", 2)

      # Parse the front matter
      begin
        front_matter_data = YAML.safe_load(front_matter)

        # Ensure front_matter_data is a hash
        if front_matter_data.is_a?(Hash) && front_matter_data['clean_json'] == true
          # Remove the 'clean_json' field from front matter
          front_matter_data.delete('clean_json')

          # Rebuild the front matter without the clean_json flag
          cleaned_front_matter = front_matter_data.to_yaml(:line_width => -1).sub(/\A---\n/, '---\n')

          # Parse JSON content
          begin
            parsed_json = JSON.parse(json_content)
            
            # Clean up whitespace and re-encode the JSON
            cleaned_json = JSON.pretty_generate(parsed_json, indent: '  ')  # Custom indentation

            # Combine the cleaned front matter and cleaned JSON content
            cleaned_file_content = "#{cleaned_front_matter}---\n#{cleaned_json}"

            # Write the cleaned content back to the file
            File.open(file_path, 'w') { |f| f.write(cleaned_file_content) }
            puts "Cleaned JSON file: #{file_path}"
          rescue JSON::ParserError => e
            puts "Failed to parse JSON in file #{file_path}: #{e.message}"
          end
        else
          puts "Skipping file (no clean_json flag or not true): #{file_path}"
        end
      rescue => e
        puts "Error processing file #{file_path}: #{e.message}"
      end
    end
  end
end
