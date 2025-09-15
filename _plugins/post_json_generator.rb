module Jekyll
  class PostJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.docs.each do |post|
        json = {
          title: post.data['title'],
          date: post.date,
          url: post.url,
          content: post.content
        }.to_json

        # Path to write the JSON file
        filename = File.join(site.dest, "api", "posts", "#{post.data['title'].downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')}.json")

        # Make directories if needed
        FileUtils.mkdir_p(File.dirname(filename))
        # Register it as a static file so Jekyll knows to include it
        site.static_files << PostJSONFile.new(site, site.dest, dir, filename)
      end
    end
  end
end
