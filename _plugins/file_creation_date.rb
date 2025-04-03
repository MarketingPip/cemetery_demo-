# _plugins/file_creation_date.rb

module Jekyll
  class Post
    def file_creation_date
      # Get the absolute path of the file
      file_path = File.join(Jekyll.sites[0].source, self.path)

      # Ensure the file exists and retrieve its creation time
      if File.exist?(file_path)
        timestamp = File.ctime(file_path)  # Use ctime (creation time)
        timestamp.strftime('%a, %d %b %Y %H:%M:%S +0000')  # Format it to RFC-822
      else
        "Sat, 01 Jan 2000 00:00:00 +0000"  # Default in case of error
      end
    end
  end
end
