# _plugins/post_json_generator.rb
module Jekyll
  class PostJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      all_posts_data = []

      site.posts.docs.each do |post|
        slug = post.data['slug'] || post.slug
        json_path = "api/posts/#{slug}.json"

        post_data = {
          id: slug,
          title: post.data['title'],
          date: post.date.to_s,
          url: post.url,
          content: post.content,
          excerpt: post.data['excerpt'] || post.content[0..100],
          categories: post.data['categories'],
          tags: post.data['tags'],
          author: post.data['author']
        }

        # Create /api/posts/:slug.json
        page = PageWithoutAFile.new(site, site.source, File.dirname(json_path), File.basename(json_path))
        page.content = post_data.to_json
        page.data['layout'] = nil
        page.data['permalink'] = "/#{json_path}"
        page.output = page.content
        page.ext = ".json"

        site.pages << page

        # Add to index array (exclude full content)
        all_posts_data << post_data.reject { |k| k == :content }
      end

      # Generate /api/posts.json (all posts, no pagination)
      index_json = all_posts_data.sort_by { |p| p[:date] }.reverse.to_json

      index_page = PageWithoutAFile.new(site, site.source, "api", "posts.json")
      index_page.content = index_json
      index_page.data['layout'] = nil
      index_page.data['permalink'] = "/api/posts.json"
      index_page.output = index_json
      index_page.ext = ".json"

      site.pages << index_page
    end
  end
end
