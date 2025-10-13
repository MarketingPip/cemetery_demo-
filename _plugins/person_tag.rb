module Jekyll
  class AltAuthorPageGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Get the authors collection
      authors = site.collections['authors'].docs

      authors.each do |author|
        # Create a new page for the author using Jekyll::PageWithoutAFile
        site.pages << AltAuthorPage.new(site, author)

        # Create another page for the 'all' subdirectory using 'author_all' layout
        site.pages << AltAuthorAllPage.new(site, author)
      end
    end
  end

  class AltAuthorPage
    def initialize(site, author)
      @site = site
      @author = author

      # Define the path for the new page (e.g., /exhibits/authors/author1/)
      author_id = author.data['slug']
      @dir = "exhibits/authors"
      @name = "#{author_id}/index.html"

      # Create the new page using Jekyll::PageWithoutAFile
      page = Jekyll::PageWithoutAFile.new(site, site.source, @dir, @name)

      # Merge the original author data with any additional data
      page.data = author.data.merge({
        'layout' => 'author',  # Layout for the author page
        'permalink' => "/exhibits/authors/#{author_id}/"
      })

      # Optionally, add more dynamic data for the page here
      page.content = author.content

      # Add the page to the site
      site.pages << page
    end
  end

  class AltAuthorAllPage
    def initialize(site, author)
      @site = site
      @author = author

      # Define the path for the "all" page (e.g., /authors/author1/all/)
      author_id = author.data['slug']
      @dir = "authors/#{author_id}/all"
      @name = "index.html"  # Ensure the page is named 'index.html'

      # Create the new page using Jekyll::PageWithoutAFile
      page = Jekyll::PageWithoutAFile.new(site, site.source, @dir, @name)

      # Merge the original author data with any additional data
      page.data = author.data.merge({
        'layout' => 'author_all',  # Layout for the 'all' page
        'title' => author.data['name'],  # Layout for the 'all' page
        'permalink' => "/authors/#{author_id}/all/"
      })

      # Optionally, add more dynamic data for the "all" page
      page.content = author.content

      # Add the page to the site
      site.pages << page
    end
  end
end
