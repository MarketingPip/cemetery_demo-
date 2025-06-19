module Jekyll
  class AltAuthorPageGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Get the authors collection
      authors = site.collections['authors'].docs

      authors.each do |author|
        # Check if the author should generate a tutorial page
          # Create a new page for the tutorials path
          site.pages << AltAuthorPage.new(site, author)
      end
    end
  end

  class AltAuthorPage < Page
    def initialize(site, author)
      @site = site
      @author = author

      # Define the path for the new page (e.g., /tutorials/authors/author1/)
      author_id = author.data['slug']
      @dir = "exhibits/authors"
      @name = "#{author_id}/index.html"

      # Process the page
      process(@name)

      # Copy front matter from the original author document
      @data = author.data.dup
      @data['layout'] ||= 'author' # Set a specific layout for tutorial pages
      @data['permalink'] = "/exhibits/authors/#{author_id}/"

      # Optional: Store content or leave it empty to rely on the layout
      @content = author.content
    end
  end
end
