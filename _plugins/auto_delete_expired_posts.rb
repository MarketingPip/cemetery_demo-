module Jekyll
  class AutoDeleteExpiredPosts < Generator
    safe true

    def generate(site)
      # Iterate over all posts in the _posts directory
      site.posts.docs.each do |post|
        # Check if the post has an expire_date
        if post.data['expire_date']
          expire_date = Date.parse(post.data['expire_date'])

          # If the expire_date is in the past, delete the post from the site
          if expire_date < Date.today
            # Remove the post from the collection
            site.posts.docs.delete(post)
            puts "Post '#{post.data['title']}' has expired and has been deleted."
          end
        end
      end
    end
  end
end
