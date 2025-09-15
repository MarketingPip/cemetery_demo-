# _plugins/author_json_generator.rb
module Jekyll
  class AuthorJSONGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Use authors collection instead of data file
      authors_collection = site.collections['authors']
      return unless authors_collection

      authors_collection.docs.each do |author_doc|
        author_id = author_doc.basename_without_ext

        # Get author front matter
        author_data = author_doc.data

        # Find all posts by this author
        posts = site.posts.docs.select do |post|
          post.data['author'] == author_id
        end

        # Create JSON object
        json = {
          id: author_id,
          name: author_data['name'] || author_data['title'],
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

        # Virtual page path
        path = "api/authors/#{author_id}.json"

        # Create the virtual page
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
