# _plugins/file_modified_date.rb
module Jekyll
  module FileModifiedDate
    def file_modified_date(input)
      file_path = File.join(Dir.pwd, input)  # Get the full file path
      return File.mtime(file_path) rescue nil  # Return the modification date
    end
  end
end
