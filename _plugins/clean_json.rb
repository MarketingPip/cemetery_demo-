require 'jekyll'
require 'json'
require 'yaml'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # Hook into post_write event to run after the files are rendered but before they are written
      Jekyll::Hooks.register :site, :post_write do |site|
        clean_json_files(site)
      end
    end

    # Method to find and clean JSON files that have 'clean_json: true' in their front matter
    def clean_json_files(site)
      # Find all files in the generated site folder (including JSON files)
      site.pages.each do |page|
        # We only care about pages that have .json extension and have clean_json flag in the front matter
        if page.extname == '.json' && page.data['clean_json'] == true
          clean_json_content(page)
        end
      end
    end

    # This method will clean up whitespace in the JSON content
    def clean_json_content(page)
      # Read the current content of the page (JSON with front matter)
      file_content = page.content

      # Extract front matter and JSON content
      front_matter, json_content = file_content.split("\n---\n", 2)

      # Parse the front matter
      begin
        front_matter_data = YAML.safe_load(front_matter)

        # Ensure front_matter_data is a hash and the 'clean_json' flag is true
        if front_matter_data.is_a?(Hash) && front_matter_data['clean_json'] == true
          # Remove the 'clean_json' field from front matter
          front_matter_data.delete('clean_json')

          # Rebuild the front matter without the clean_json flag
          cleaned_front_matter = front_matter_data.to_yaml(:line_width => -1).sub(/\A---\n/, '---\n')

          # Clean and format the JSON content
          cleaned_json_content = clean_json_string(json_content)

          # Combine the cleaned front matter and cleaned JSON content
          cleaned_file_content = "#{cleaned_front_matter}---\n#{cleaned_json_content}"

          # Save the cleaned content back to the page's content
          page.content = cleaned_file_content

          puts "Cleaned JSON content in file: #{page.url}"
        else
          puts "Skipping file (no clean_json flag or not true): #{page.url}"
        end
      rescue => e
        puts "Error processing file #{page.url}: #{e.message}"
      end
    end

    # This method will clean up JSON content and escape any special characters
    def clean_json_string(json_content)
      # Try to parse the JSON to check for validity
      begin
        parsed_json = JSON.parse(json_content.strip)
        # If valid, reformat and return the cleaned content
        return JSON.pretty_generate(parsed_json, indent: '  ')
      rescue JSON::ParserError => e
        puts "Failed to parse JSON content: #{e.message}"
        return json_content.strip  # Return the original content if parsing fails
      end
    end
  end
end
