# _plugins/author_json_generator.rb
module Jekyll
  class AuthorJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      authors_collection = site.collections['authors']
      return unless authors_collection

      all_authors_json = []

      authors_collection.docs.each do |author_doc|
        author_id = author_doc.basename_without_ext
        author_data = author_doc.data

        posts = site.posts.docs.select do |post|
          post.data['author'] == author_id
        end

        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            categories: post.data['categories'],
            tags: post.data['tags']
          }
        end

        # Create full author JSON
        author_json = {
          id: author_id,
          name: author_data['name'] || author_data['title'],
          bio: author_data['bio'],
          website: author_data['website'],
          count: posts.length,
          posts: post_data
        }.to_json

        # File path: /api/authors/:id.json
        path = "api/authors/#{author_id}.json"

        page = PageWithoutAFile.new(site, site.source, File.dirname(path), File.basename(path))
        page.content = author_json
        page.data['layout'] = nil
        page.data['permalink'] = "/#{path}"
        page.output = author_json
        page.ext = ".json"

        site.pages << page

        # Add summary to /api/authors.json
        all_authors_json << {
          id: author_id,
          name: author_data['name'] || author_data['title'],
          bio: author_data['bio'],
          website: author_data['website'],
          count: posts.length,
          url: "/api/authors/#{author_id}.json"
        }
      end

      # Generate /api/authors.json
      index_json = all_authors_json.sort_by { |a| a[:name].to_s.downcase }.to_json

      index_page = PageWithoutAFile.new(site, site.source, "api", "authors.json")
      index_page.content = index_json
      index_page.data['layout'] = nil
      index_page.data['permalink'] = "/api/authors.json"
      index_page.output = index_json
      index_page.ext = ".json"

      site.pages << index_page
    end
  end
end
