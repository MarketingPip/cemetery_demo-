module Jekyll
  class ExpirePosts < Generator
    safe true

    Jekyll::Hooks.register :site, :pre_render do |site|
      # Ensure expired posts are handled before rendering pages
      site.posts.docs.reject! do |post|
        if post.data['expire_date']
          begin
            expire_date = case post.data['expire_date']
                          when String
                            Date.parse(post.data['expire_date'])
                          when Date
                            post.data['expire_date']
                          else
                            nil
                          end
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
