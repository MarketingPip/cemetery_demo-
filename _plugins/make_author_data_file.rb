require 'yaml'
require 'fileutils'

module Jekyll
  class AuthorDataGenerator < Generator
    safe true
    priority :high # Run early in the build process

    def generate(site)
      author_data = {}
      author_files = Dir.glob(File.join(site.source, '_authors', '*.{md,markdown}'))

      author_files.each do |file_path|
        begin
          front_matter = YAML.safe_load(File.read(file_path), permitted_classes: [String, Hash, Array])
          next unless front_matter && front_matter['author']

          author_id = front_matter['author']
          author_data[author_id] = {
            'name' => front_matter['name'],
            'role' => front_matter['role'],
            'image' => front_matter['image'],
            'social' => front_matter['social'] || {
              'facebook' => '#',
              'twitter' => '#',
              'linkedin' => '#'
            }
          }
        rescue Psych::DisallowedClass, Psych::SyntaxError => e
          Jekyll.logger.warn "Skipping author file #{file_path}: #{e.message}"
          next
        end
      end

      # Write to source _data directory for template access
      source_output_path = File.join(site.source, '_data', 'authors.yml')
      FileUtils.mkdir_p(File.dirname(source_output_path))
      File.write(source_output_path, author_data.to_yaml)

      # Register _data/authors.yml as a static file to be copied to _site/data/authors.yml
      site.static_files << AuthorStaticFile.new(
        site,
        site.source,
        '_data',
        'authors.yml',
        'data/authors.yml'
      )
    end
  end

  # Custom StaticFile class to copy _data/authors.yml to _site/data/authors.yml
  class AuthorStaticFile < StaticFile
    def initialize(site, base, dir, name, destination)
      super(site, base, dir, name)
      @relative_path = File.join(dir, name)
      @destination_path = destination
    end

    # Override destination to place the file in _site/data/authors.yml
    def destination(dest)
      File.join(dest, @destination_path)
    end
  end
end
