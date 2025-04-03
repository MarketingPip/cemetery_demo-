module Jekyll
  class ExpirePages < Generator
    safe true

    def generate(site)
      site.pages.each do |page|
        # Check if the page has an expire_date
        if page.data['expire_date']
          expire_date = Date.parse(page.data['expire_date'])

          # If the expire_date is in the past, set published: false
          if expire_date < Date.today
            page.data['published'] = false
            puts "Page '#{page.data['title']}' has expired and will not be rendered."
          end
        end
      end

      site.posts.docs.each do |post|
        # Check if the post has an expire_date
        if post.data['expire_date']
          expire_date = Date.parse(post.data['expire_date'])

          # If the expire_date is in the past, set published: false
          if expire_date < Date.today
            post.data['published'] = false
            puts "Post '#{post.data['title']}' has expired and will not be rendered."
          end
        end
      end
    end
  end
end
