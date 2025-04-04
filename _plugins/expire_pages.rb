module Jekyll
  class ExpirePages < Generator
    safe true

    def generate(site)
      # Iterate over all pages in the site
      site.pages.each do |page|
        # Check if the page has an expire_date
        if page.data['expire_date']
          begin
            # Ensure expire_date is a Date object, even if it's stored as a string
            expire_date = case page.data['expire_date']
                          when String
                            Date.parse(page.data['expire_date'])
                          when Date
                            page.data['expire_date']
                          else
                            nil
                          end

            # If the expire_date is valid and in the past, set published: false
            if expire_date && expire_date < Date.today
              page.data['published'] = false
              puts "Page '#{page.data['title']}' has expired and will not be rendered."
            end
          rescue ArgumentError => e
            # Handle invalid date format
            puts "Invalid expire_date format for page '#{page.data['title']}': #{e.message}"
          end
        end
      end

      # Iterate over all posts in the site
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

            # If the expire_date is valid and in the past, set published: false
            if expire_date && expire_date < Date.today
              post.data['published'] = false
              puts "Post '#{post.data['title']}' has expired and will not be rendered."
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
