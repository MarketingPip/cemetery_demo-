# _plugins/author_json_generator.rb
module Jekyll
  class AuthorJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Get all authors from _data/authors.yml
      authors = site.data['authors'] || {}

      authors.each do |author_id, author_data|
        # Find all posts by this author
        posts = site.posts.docs.select do |post|
          post.data['author'] == author_id
        end

        # Prepare author JSON structure
        json = {
          id: author_id,
          name: author_data['name'],
          bio: author_data['bio'],
          website: author_data['website'],
          posts: posts.map do |post|
            {
              title: post.data['title'],
              date: post.date.to_s,
              url: post.url,
              excerpt: post.data['excerpt'] || post.content[0..100]
            }
          end
        }.to_json

        # Create the virtual page
        path = "api/authors/#{author_id}.json"
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
