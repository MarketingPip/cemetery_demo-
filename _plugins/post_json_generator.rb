# _plugins/post_json_generator.rb
module Jekyll
  class PostJSONFile < StaticFile
    def write(dest)
      # Don't write file if it already exists (unless modified)
      true
    end
  end

  class PostJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.docs.each do |post|
        json_data = {
          title: post.data['title'],
          date: post.date.to_s,
          url: post.url,
          content: post.content
        }.to_json

        filename = "#{post.data['title'].downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')}.json"
        dir = File.join("api", "posts")

        # Destination path
        full_path = File.join(site.dest, dir)
        FileUtils.mkdir_p(full_path)

        # Register it as a static file so Jekyll knows to include it
        site.static_files << PostJSONFile.new(site, site.dest, dir, filename)
      end
    end
  end
end
