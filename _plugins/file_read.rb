# _plugins/file_read_plugin.rb
module Jekyll
  class FileReadTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @file_path = text.strip
    end

    def render(context)
      # Check if the file exists
      file_path = File.join(Dir.pwd, @file_path)

      if File.exist?(file_path)
        # Read the content of the file
        content = File.read(file_path)

        # Return the content or process it as needed (e.g., escape HTML)
        content
      else
        "Error: File not found."
      end
    end
  end
end

# Register the tag with Jekyll
Liquid::Template.register_tag('file_read', Jekyll::FileReadTag)
