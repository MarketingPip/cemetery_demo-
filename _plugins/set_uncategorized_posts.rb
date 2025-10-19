# _plugins/set_uncategorized_hook.rb
Jekyll::Hooks.register :site, :post_read do |site|
  # Ensure the 'posts' collection exists
  next unless site.posts && site.posts.docs

  site.posts.docs.each do |post|
    if post.data['categories'].nil? || post.data['categories'].empty?
      post.data['categories'] = ['uncategorized']
      Jekyll.logger.info "SetUncategorized:", "Post '#{post.data['title']}' had no categories — set to 'uncategorized'."
    end
  end
end
