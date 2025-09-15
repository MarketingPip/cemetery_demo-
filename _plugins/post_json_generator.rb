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

        # Write the file
        File.write(filename, json)
      end
    end
  end
end
