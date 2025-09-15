# _plugins/category_json_generator.rb
module Jekyll
  class CategoryJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Get all unique categories used in posts
      all_categories = site.posts.docs.flat_map { |post| post.data['categories'] || [] }.uniq

      all_categories.each do |category|
        # Get all posts in this category
        posts = site.posts.docs.select do |post|
          (post.data['categories'] || []).include?(category)
        end

        # Build the JSON data
        json = {
          id: category,
          posts: posts.map do |post|
            {
              title: post.data['title'],
              date: post.date.to_s,
              url: post.url,
              excerpt: post.data['excerpt'] || post.content[0..100],
              author: post.data['author']
            }
          end
        }.to_json

        # File path: /api/categories/{category}.json
        slug = category.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
        path = "api/categories/#{slug}.json"

        # Create virtual page
        page = PageWithoutAFile.new(site, site.source, File.dirname(path), File.basename(path))
        page.content = json
        page.data['layout'] = nil
        page.data['permalink'] = "/#{path}"
        page.output = json
        page.ext = ".json"

        site.pages << page
      end
    end
  end
end
