module Jekyll
  class SetUncategorized < Generator
    safe true

    def generate(site)
      # Iterate over the posts in the site
      site.posts.docs.each do |post|
        # If the post doesn't have categories or if it's an empty array
        if post.data['categories'].nil? || post.data['categories'].empty?
          # Set the category to 'uncategorized'
          post.data['categories'] = ['uncategorized']
          puts "Post '#{post.data['title']}' has no categories. Setting to 'uncategorized'."
        end
      end
    end
  end
end
