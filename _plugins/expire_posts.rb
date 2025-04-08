# Filename: _plugins/expire_and_redirect.rb
module Jekyll
  class ExpirePosts < Generator
    safe true
    priority :high

    def generate(site)
      site.posts.docs.reject! do |post|
        expired = false

        # Handle expiration logic
        if post.data['expire_date']
          begin
            expire_date = case post.data['expire_date']
                          when String then Date.parse(post.data['expire_date'])
                          when Date then post.data['expire_date']
                          else nil
                          end

            if expire_date && expire_date < Date.today
              post.data['published'] = false
              expired = true
              puts "Post '#{post.data['title']}' has expired and will not be rendered."

              # If also has redirect-to, create a redirect page
              if post.data['redirect-to']
                url = post.data['redirect-to']
                path = post.url.sub(%r{^/}, '') # Remove leading slash
                dir = File.dirname(path)
                name = File.basename(path)
                name += ".html" unless name.end_with?(".html")

                page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
                page.content = <<~HTML
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta http-equiv="refresh" content="0; url=#{url}">
                    <script>location.href="#{url}"</script>
                    <title>Redirecting...</title>
                  </head>
                  <body>
                    <p>Redirecting to <a href="#{url}">#{url}</a></p>
                  </body>
                  </html>
                HTML
                page.data = {
                  'layout' => nil,
                  'sitemap' => false,
                  'robots' => 'noindex'
                }

                site.pages << page
                puts "Redirect page created for '#{post.data['title']}' -> #{url}"
              end
            end
          rescue ArgumentError => e
            puts "Invalid expire_date format for post '#{post.data['title']}': #{e.message}"
          end
        end

        expired
      end
    end
  end
end
