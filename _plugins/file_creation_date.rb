# _plugins/file_creation_date.rb
module Jekyll
  module FileCreationDate
    # Create a custom filter to get the creation date
    def file_creation_date(input)
      file_path = File.join(Dir.pwd, input)  # Get the full file path
      return File.birthtime(file_path) rescue nil  # Return the creation date, or nil if it fails
    end
  end
end

# Register the filter with Jekyll
Liquid::Template.registerFilter(Jekyll::FileCreationDate)
