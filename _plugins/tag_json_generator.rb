# _plugins/tag_json_generator.rb
module Jekyll
  class TagJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Build tag => [posts] hash
      tag_map = Hash.new { |hash, key| hash[key] = [] }

      site.posts.docs.each do |post|
        Array(post.data['tags']).each do |tag|
          tag_map[tag] << post
        end
      end

      all_tags_json = []

      tag_map.each do |tag, posts|
        # Prepare the slug (URL-safe tag ID)
        slug = tag.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

        # Collect minimal data per post
        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            categories: post.data['categories'],
            author: post.data['author']
          }
        end

        # Tag-specific JSON endpoint: /api/tags/:slug.json
        tag_json = {
          id: tag,
          count: posts.length,
          posts: post_data
        }.to_json

        tag_path = "api/tags/#{slug}.json"

        page = PageWithoutAFile.new(site, site.source, File.dirname(tag_path), File.basename(tag_path))
        page.content = tag_json
        page.data['layout'] = nil
        page.data['permalink'] = "/#{tag_path}"
        page.output = tag_json
        page.ext = ".json"

        site.pages << page

        # Add to tags index list
        all_tags_json << {
          id: tag,
          slug: slug,
          count: posts.length,
          url: "/api/tags/#{slug}.json"
        }
      end

      # Now generate /api/tags.json
      tags_index_json = all_tags_json.sort_by { |t| t[:id] }.to_json

      index_page = PageWithoutAFile.new(site, site.source, "api", "tags.json")
      index_page.content = tags_index_json
      index_page.data['layout'] = nil
      index_page.data['permalink'] = "/api/tags.json"
      index_page.output = tags_index_json
      index_page.ext = ".json"

      site.pages << index_page
    end
  end
end
