# _plugins/tag_json_generator.rb
module Jekyll
  class TagJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Get all unique tags from posts
      all_tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.uniq

      all_tags.each do |tag|
        # Get posts with this tag
        tagged_posts = site.posts.docs.select do |post|
          (post.data['tags'] || []).include?(tag)
        end

        # Build JSON data
        json = {
          id: tag,
          posts: tagged_posts.map do |post|
            {
              title: post.data['title'],
              date: post.date.to_s,
              url: post.url,
              excerpt: post.data['excerpt'] || post.content[0..100],
              categories: post.data['categories'],
              author: post.data['author']
            }
          end
        }.to_json

        # Create safe slug for filename
        slug = tag.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
        path = "api/tags/#{slug}.json"

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
