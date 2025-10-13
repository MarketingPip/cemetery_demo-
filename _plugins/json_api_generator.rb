# _plugins/json_api_generator.rb
require 'json'

module Jekyll
  class JSONAPIGenerator < Generator
    safe true
    priority :low

    def generate(site)
      config = site.config['json_api'] || {}

      generate_posts(site)      if config.fetch('posts', true)
      generate_authors(site)    if config.fetch('authors', true)
      generate_categories(site) if config.fetch('categories', true)
      generate_tags(site)       if config.fetch('tags', true)
    end

    private

    # ---------------------------------
    # POSTS
    # ---------------------------------
    def generate_posts(site)
      all_posts_data = []

      site.posts.docs.each do |post|
        slug = post.data['slug'] || post.slug
        json_path = "api/posts/#{slug}"

        post_data = {
          id: slug,
          title: post.data['title'],
          date: post.date.to_s,
          url: post.url,
          content: post.content,
          excerpt: post.data['excerpt'] || post.content[0..100],
          categories: post.data['categories'],
          tags: post.data['tags'],
          author: post.data['author']
        }

        create_json_page(site, json_path, post_data.to_json)

        all_posts_data << post_data.reject { |k| k == :content }
      end

      index_json = all_posts_data.sort_by { |p| p[:date] }.reverse.to_json
      create_json_page(site, "api/posts", index_json)
    end

    # ---------------------------------
    # AUTHORS
    # ---------------------------------
    def generate_authors(site)
      authors_collection = site.collections['authors']
      return unless authors_collection

      all_authors_json = []

      authors_collection.docs.each do |author_doc|
        author_id = author_doc.basename_without_ext
        author_data = author_doc.data

        posts = site.posts.docs.select { |post| post.data['author'] == author_id }

        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            categories: post.data['categories'],
            tags: post.data['tags']
          }
        end

        author_json = {
          id: author_id,
          name: author_data['name'] || author_data['title'],
          bio: author_data['bio'],
          website: author_data['website'],
          count: posts.length,
          posts: post_data
        }.to_json

        path = "api/authors/#{author_id}"
        create_json_page(site, path, author_json)

        all_authors_json << {
          id: author_id,
          name: author_data['name'] || author_data['title'],
          bio: author_data['bio'],
          website: author_data['website'],
          count: posts.length,
          url: "/api/authors/#{author_id}"
        }
      end

      index_json = all_authors_json.sort_by { |a| a[:name].to_s.downcase }.to_json
      create_json_page(site, "api/authors", index_json)
    end

    # ---------------------------------
    # CATEGORIES
    # ---------------------------------
    def generate_categories(site)
      category_map = Hash.new { |hash, key| hash[key] = [] }

      site.posts.docs.each do |post|
        Array(post.data['categories']).each do |category|
          category_map[category] << post
        end
      end

      all_categories_json = []

      category_map.each do |category, posts|
        slug = category.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            tags: post.data['tags'],
            author: post.data['author']
          }
        end

        category_json = {
          id: category,
          count: posts.length,
          posts: post_data
        }.to_json

        path = "api/categories/#{slug}"
        create_json_page(site, path, category_json)

        all_categories_json << {
          id: category,
          slug: slug,
          count: posts.length,
          url: "/api/categories/#{slug}"
        }
      end

      index_json = all_categories_json.sort_by { |c| c[:id].downcase }.to_json
      create_json_page(site, "api/categories", index_json)
    end

    # ---------------------------------
    # TAGS
    # ---------------------------------
    def generate_tags(site)
      tag_map = Hash.new { |hash, key| hash[key] = [] }

      site.posts.docs.each do |post|
        Array(post.data['tags']).each do |tag|
          tag_map[tag] << post
        end
      end

      all_tags_json = []

      tag_map.each do |tag, posts|
        slug = tag.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

        post_data = posts.map do |post|
          {
            title: post.data['title'],
            date: post.date.to_s,
            url: post.url,
            excerpt: post.data['excerpt'] || post.content[0..100],
            categories: post.data['categories'],
            author: post.data['author']
          }
        end

        tag_json = {
          id: tag,
          count: posts.length,
          posts: post_data
        }.to_json

        path = "api/tags/#{slug}"
        create_json_page(site, path, tag_json)

        all_tags_json << {
          id: tag,
          slug: slug,
          count: posts.length,
          url: "/api/tags/#{slug}"
        }
      end

      tags_index_json = all_tags_json.sort_by { |t| t[:id] }.to_json
      create_json_page(site, "api/tags", tags_index_json)
    end

    # ---------------------------------
    # Utility method
    # ---------------------------------
    def create_json_page(site, path, json_content)
      dir = File.dirname(path)
      filename = File.basename(path)

      page = PageWithoutAFile.new(site, site.source, dir, filename)
      page.content = json_content
      page.data['layout'] = nil
      page.data['permalink'] = "/#{path}"
      page.output = json_content
      page.ext = ".json"

      site.pages << page
    end
  end
end
