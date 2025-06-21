require 'jekyll'
require 'json'
require 'yaml'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # This method will be called during the build process, but we will process files later.
    end

    # Hook that runs after Jekyll renders all files
    Jekyll::Hooks.register :site, :post_render do |site|
      # Find all JSON files in the generated site folder
      json_files = Dir.glob(File.join(site.dest, '**', '*.json'))

      # Iterate through each JSON file and clean the whitespace if 'clean_json' flag is true
      json_files.each do |file_path|
        clean_json_file(file_path, site)
      end
    end

    private

    # This method will clean up whitespace in the given JSON file
    def clean_json_file(file_path, site)
      # Read the content of the JSON file
      file_content = File.read(file_path)

      # Extract the front matter (YAML block) and JSON content
      front_matter, json_content = file_content.split("\n---\n", 2)

      # Parse the front matter
      begin
        front_matter_data = YAML.safe_load(front_matter)

        # Ensure front_matter_data is a hash and the 'clean_json' flag is true
        if front_matter_data.is_a?(Hash) && front_matter_data['clean_json'] == true
          # Remove the 'clean_json' field from front matter (so it's not saved back to the file)
          front_matter_data.delete('clean_json')

          # Rebuild the front matter without the clean_json flag
          cleaned_front_matter = front_matter_data.to_yaml(:line_width => -1).sub(/\A---\n/, '---\n')

          # Clean and escape the JSON content
          cleaned_json_content = clean_json_content(json_content)

          # Combine the cleaned front matter and cleaned JSON content
          cleaned_file_content = "#{cleaned_front_matter}---\n#{cleaned_json_content}"

          # Write the cleaned content back to the file
          File.open(file_path, 'w') { |f| f.write(cleaned_file_content) }
          puts "Cleaned JSON file: #{file_path}"
        else
          puts "Skipping file (no clean_json flag or not true): #{file_path}"
        end
      rescue => e
        puts "Error processing file #{file_path}: #{e.message}"
      end
    end

    # This method will clean up JSON content and escape any special characters
    def clean_json_content(json_content)
      # Remove any unnecessary whitespace or problematic characters (like `%`)
      cleaned_content = json_content.strip

      # Try to parse the JSON to check for validity
      begin
        parsed_json = JSON.parse(cleaned_content)
        # If valid, reformat and return the cleaned content
        return JSON.pretty_generate(parsed_json, indent: '  ')
      rescue JSON::ParserError => e
        puts "Failed to parse JSON content: #{e.message}"
        return cleaned_content  # Return the original content if parsing fails
      end
    end
  end
end
