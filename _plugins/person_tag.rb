module Jekyll
  class AltAuthorPageGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Get the authors collection
      authors = site.collections['authors'].docs

      authors.each do |author|
        # Create a new page for the author
        site.pages << AltAuthorPage.new(site, author)

        # Create another page for the 'all' subdirectory using 'author_all' layout
        site.pages << AltAuthorAllPage.new(site, author)
      end
    end
  end

  class AltAuthorPage < Page
    def initialize(site, author)
      @site = site
      @author = author

      # Define the path for the new page (e.g., /exhibits/authors/author1/)
      author_id = author.data['slug']
      @dir = "exhibits/authors"
      @name = "#{author_id}/index.html"

      # Process the page
      process(@name)

      # Copy front matter from the original author document
      @data = author.data.dup
      @data['layout'] ||= 'author' # Set a specific layout for author pages
      @data['permalink'] = "/exhibits/authors/#{author_id}/"

      # Optional: Store content or leave it empty to rely on the layout
      @content = author.content
    end
  end

  class AltAuthorAllPage < Page
    def initialize(site, author)
      @site = site
      @author = author

      # Define the path for the new page (e.g., /exhibits/authors/author1/all/)
      author_id = author.data['slug']
      @dir = "exhibits/authors/#{author_id}/all"
      @name = "index.html"

      # Process the page
      process(@name)

      # Copy front matter from the original author document and adjust layout
      @data = author.data.dup
      @data['layout'] = 'author_all'  # Use 'author_all' layout
      @data['permalink'] = "/exhibits/authors/#{author_id}/all/"

      # Optional: You can add custom content for this "all" page, or rely on the layout.
      @content = author.content
    end
  end
end
