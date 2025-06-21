require 'jekyll'

module Jekyll
  class CleanJsonWhitespace < Jekyll::Generator
    priority :low

    def generate(site)
      # Check if clean_json is true in the config file
      return unless site.config['clean_json']

      # Find all JSON files in the site
      json_files = Dir.glob(File.join(site.source, '**', '*.json'))

      # Iterate through each JSON file and clean the whitespace
      json_files.each do |file_path|
        clean_json_file(file_path)
      end
    end

    private

    # This method will clean up whitespace in the given JSON file
    def clean_json_file(file_path)
      # Read the content of the JSON file
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
