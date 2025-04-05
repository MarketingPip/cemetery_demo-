# Filename: _plugins/generate_tag_pages.rb
module Jekyll
  class GenerateTagPages < Generator
    safe true

    def generate(site)
      # Collect all tags from posts
      all_tags = []
      site.posts.docs.each do |post|
        tags = post.data['tags'] || []
        all_tags += tags
      end

      # Remove duplicate tags
      all_tags = all_tags.uniq

      # Create a tag page for each tag
      all_tags.each do |tag|
        # Define the directory and filename for the tag page
        dir = "blog/#{tag}"
        name = "index.html"

        # Create a new page
        page = Jekyll::Page.new(site, site.source, dir, name)

        # Set the front matter
        page.data = {
          'layout' => 'tag_page',
          'tag' => tag,
          'robots' => 'noindex'
        }

        # Content is optional; layout will handle rendering
        page.content = ''

        # Add the page to the site's pages collection
        site.pages << page
      end
    end
  end
end
