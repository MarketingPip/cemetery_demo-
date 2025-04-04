module Jekyll
  class AutoDeleteExpiredPosts < Generator
    safe true

    def generate(site)
      # Iterate over all posts in the _posts directory
      site.posts.docs.each do |post|
        # Check if the post has an expire_date
        if post.data['expire_date']
          begin
            # Ensure expire_date is a Date object, even if it's stored as a string
            expire_date = case post.data['expire_date']
                          when String
                            Date.parse(post.data['expire_date'])
                          when Date
                            post.data['expire_date']
                          else
                            nil
                          end

            # If the expire_date is valid and in the past, delete the post
            if expire_date && expire_date < Date.today
              # Remove the post from the collection
              post.data['published'] = false
              site.posts.docs.delete(post)
              puts "Post '#{post.data['title']}' has expired and has been deleted."
            end
          rescue ArgumentError => e
            # Handle invalid date format
            puts "Invalid expire_date format for post '#{post.data['title']}': #{e.message}"
          end
        end
      end
    end
  end
end
