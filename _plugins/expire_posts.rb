module Jekyll
  class ExpirePosts < Generator
    safe true

    def generate(site)
      site.posts.docs.reject! do |post|
        if post.data['expire_date']
          expire_date = Date.parse(post.data['expire_date'])
          if expire_date < Date.today
            puts "Post '#{post.data['title']}' has expired and will not be rendered."
            true  # Remove expired post from the collection
          else
            false
          end
        else
          false
        end
      end
    end
  end
end
