module Jekyll
  class PersonTag < Liquid::Tag
    def initialize(tag_name, id, tokens)
      super
      # Capture the ID passed in the tag (i.e. "92" from {{ person 92 }})
      @id = id.strip
    end

    def render(context)
      # Construct the file path for the person JSON
      file_path = File.join(Dir.pwd, "assets", "people", "{@id}.json")

      # Check if the file exists
      if File.exist?(file_path)
        # Read the file content
        json_content = File.read(file_path)
        # Parse the JSON content
        data = JSON.parse(json_content)
        
        # You can then format or display the data as needed.
        # For example, we return the name of the person from the JSON data.
        return data["name"] # Assuming JSON has a "name" key
      else
        # If the file does not exist, return an error message or empty string
        return "Person not found"
      end
    end
  end
end

# Register the tag so that Liquid can use it
Liquid::Template.register_tag('person', Jekyll::PersonTag)
