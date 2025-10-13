module Jekyll
  class AltAuthorPageGenerator < Generator
    safe true
    priority :high

    def generate(site)
      authors = site.collections['authors'].docs

      authors.each do |author|
        site.pages << AltAuthorPage.new(site, author)
        site.pages << AltAuthorAllPage.new(site, author)
      end
    end
  end

  class AltAuthorPage < Page
    def initialize(site, author)
      @site = site
      @base = site.source
      author_id = author.data['slug']
      @dir = "exhibits/authors"
      @name = "#{author_id}/index.html"

      process(@name)

      # Copy front matter from the author file
      @data = author.data.dup
      @data['layout'] ||= 'author'
      @data['permalink'] = "/exhibits/authors/#{author_id}/"
      @data['title'] ||= author.data['name']
      @content = author.content

      # Add posts written by this author
      @data['posts'] = site.posts.docs.select do |post|
        post.data['author'] == author_id
      end
    end
  end

  class AltAuthorAllPage < Page
    def initialize(site, author)
      @site = site
      @base = site.source
      author_id = author.data['slug']
      @dir = "authors/#{author_id}/all"
      @name = "index.html"

      process(@name)

      @data = author.data.dup
      @data['layout'] = 'author_all'
      @data['permalink'] = "/authors/#{author_id}/all/"
      @data['title'] = author.data['name']
      @content = author.content

      # Add posts written by this author
      @data['posts'] = site.posts.docs.select do |post|
        post.data['author'] == author_id
      end
    end
  end
end
