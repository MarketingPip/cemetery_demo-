# _plugins/category_json_generator.rb
module Jekyll
  class CategoryJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Hash: category => [posts]
      category_map = Hash.new { |hash, key| hash[key] = [] }

      # Collect all categories and their posts
      site.posts.docs.each do |post|
        Array(post.data['categories']).each do |category|
          category_map[category] << post
        end
      end

      all_categories_json = []

      category_map.each do |category, posts|
        slug = category.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            tags: post.data['tags'],
            author: post.data['author']
          }
        end

        # Category JSON file: /api/categories/:slug.json
        category_json = {
          id: category,
          count: posts.length,
          posts: post_data
        }.to_json

        path = "api/categories/#{slug}.json"

        page = PageWithoutAFile.new(site, site.source, File.dirname(path), File.basename(path))
        page.content = category_json
        page.data['layout'] = nil
        page.data['permalink'] = "/#{path}"
        page.output = category_json
        page.ext = ".json"

        site.pages << page

        # Add to /api/categories.json list
        all_categories_json << {
          id: category,
          slug: slug,
          count: posts.length,
          url: "/api/categories/#{slug}.json"
        }
      end

      # Create the index: /api/categories.json
      index_json = all_categories_json.sort_by { |c| c[:id].downcase }.to_json

      index_page = PageWithoutAFile.new(site, site.source, "api", "categories.json")
      index_page.content = index_json
      index_page.data['layout'] = nil
      index_page.data['permalink'] = "/api/categories.json"
      index_page.output = index_json
      index_page.ext = ".json"

      site.pages << index_page
    end
  end
end
