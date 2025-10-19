module Jekyll
  Hooks.register :site, :post_read do |site|
    site.posts.docs.each do |post|
      cats = post.data['category']

      # Normalize categories to an array
      cats = [cats].flatten.compact if cats

      if cats.nil? || cats.empty? || cats.all? { |c| c.to_s.strip.empty? }
        post.data['category'] = ['uncategorized']
        Jekyll.logger.debug "Uncategorized:", "Set for post #{post.data['title'] || post.basename}"
      end
    end
  end
end
