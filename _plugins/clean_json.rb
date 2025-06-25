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
          clean_json_file(page, site)
        end
      end
    end

    private

    # Method to clean the JSON file by removing extra whitespaces
    def clean_json_file(page, site)
      file_path = File.join(site.source, page.path)

      # Check if the file exists and is readable
      unless File.exist?(file_path) && File.readable?(file_path)
        puts "File does not exist or is not readable: #{file_path}"
        return
      end

      # Read the file content directly from the file system
      begin
        file_content = File.read(file_path)

        # Check if the content is nil or empty
        if file_content.nil? || file_content.empty?
          puts "File is empty: #{file_path}"
          return
        end

        # Render the content if there are Liquid tags in the file
        rendered_content = Jekyll::Renderer.new(site, page).run

        # Strip off YAML front matter if it exists
        json_content = remove_front_matter(rendered_content)

        # Parse the JSON and reformat it to remove excessive whitespace
        parsed_json = JSON.parse(json_content)
        cleaned_json = JSON.pretty_generate(parsed_json, indent: '  ')  # Custom indentation

        # Write the cleaned JSON back to the file
        File.open(file_path, 'w') { |f| f.write(cleaned_json) }
        puts "Cleaned JSON file: #{file_path}"
      rescue JSON::ParserError => e
        puts "Failed to parse JSON in file #{file_path}: #{e.message}"
      rescue StandardError => e
        puts "Error reading or writing file #{file_path}: #{e.message}"
      end
    end

    # Helper method to remove front matter from the file content
    def remove_front_matter(content)
      if content.start_with?('---')
        front_matter_end = content.index('---', 3)
        # Avoid stripping too early; search for the second `---` that marks the end of the front matter
        if front_matter_end
          content[(front_matter_end + 3)..-1].strip
        else
          content.strip
        end
      else
        content.strip
      end
    end
  end
end
