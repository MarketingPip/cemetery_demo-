# _plugins/file_creation_date.rb

module Jekyll
  class Post
    def file_creation_date
      file_path = File.join(Jekyll.sites[0].source, self.path)

      if File.exist?(file_path)
        timestamp = File.ctime(file_path)
        timestamp.strftime('%a, %d %b %Y %H:%M:%S +0000')
      else
        "Sat, 01 Jan 2000 00:00:00 +0000"
      end
    end
  end
end

# Register the method as a Liquid filter
module Jekyll
  module FileCreationDateFilter
    def file_creation_date(post)
      post.file_creation_date
    end
  end
end

# Register the filter with Jekyll
Liquid::Template.registerFilter(Jekyll::FileCreationDateFilter)
