module Jekyll
  class ExpirePosts < Generator
    safe true
    priority :low # Set priority to low so it runs earlier

    def generate(site)
      # Iterate over the posts in the site and reject expired ones
      site.posts.docs.reject! do |post|
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

            # If expire_date is valid and in the past, remove the post from the collection
            if expire_date && expire_date < Date.today
              post.data['published'] = false
              puts "Post '#{post.data['title']}' has expired and will not be rendered."
              true  # Remove expired post from the collection
            else
              false
            end
          rescue ArgumentError => e
            puts "Invalid expire_date format for post '#{post.data['title']}': #{e.message}"
            false
          end
        else
          false
        end
      end
    end
  end
end
