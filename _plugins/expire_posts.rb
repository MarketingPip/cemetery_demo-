module Jekyll
  class ExpirePosts < Generator
    safe true
    
    def generate(site)
      site.posts.docs.each do |post|
        # Check if the post has an expire_date
        if post.data['expire_date']
          expire_date = Date.parse(post.data['expire_date'])
          # If the expire_date is in the past, mark it as unpublished
          if expire_date < Date.today
            post.data['published'] = false
          end
        end
      end
    end
  end
end
