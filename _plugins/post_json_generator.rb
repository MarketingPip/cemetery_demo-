# _plugins/post_json_generator.rb
module Jekyll
  class PostJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.docs.each do |post|
        # Generate the output path like "api/posts/my-title.json"
        slug = post.data['slug'] || post.slug
        json_path = "api/posts/#{slug}.json"

        # Create a virtual page
        page = PageWithoutAFile.new(site, site.source, File.dirname(json_path), File.basename(json_path))
        page.content = {
          title: post.data['title'],
          date: post.date.to_s,
          url: post.url,
          content: post.content
        }.to_json

        page.data['layout'] = nil  # no layout
        page.data['permalink'] = "/#{json_path}"  # full URL
        page.output = page.content
        page.ext = ".json"

        site.pages << page
      end
    end
  end
end
