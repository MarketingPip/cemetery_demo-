module Jekyll
  class SetUncategorized < Generator
    safe true
    priority :low # ensure it runs after other generators

    def generate(site)
      site.posts.docs.each do |post|
        categories = post.data['categories']

        # Normalize categories to an array
        categories = [categories].flatten.compact if categories

        # If categories are nil, empty, or blank, set to ['uncategorized']
        if categories.nil? || categories.empty? || categories.all? { |c| c.to_s.strip.empty? }
          post.data['categories'] = ['uncategorized']
          puts "📌 Post '#{post.data['title'] || post.basename}' set to category 'uncategorized'."
        end
      end
    end
  end
end
