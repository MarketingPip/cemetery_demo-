require 'yaml'
require 'fileutils'

module Jekyll
  class AuthorDataGenerator < Generator
    safe true
    priority :high

    def generate(site)
      Jekyll.logger.info "AuthorDataGenerator: Starting generation"
      author_data = {}
      author_files = Dir.glob(File.join(site.source, '_authors', '*.{md,markdown}'))
      Jekyll.logger.info "AuthorDataGenerator: Found #{author_files.length} author files"

      author_files.each do |file_path|
        Jekyll.logger.info "AuthorDataGenerator: Processing #{file_path}"
        begin
          front_matter = YAML.safe_load(File.read(file_path), permitted_classes: [String, Hash, Array])
          if front_matter && front_matter['author']
            author_id = front_matter['author']
            Jekyll.logger.info "AuthorDataGenerator: Found author ID '#{author_id}'"
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
          else
            Jekyll.logger.warn "AuthorDataGenerator: No 'author' key in #{file_path}"
          end
        rescue Psych::DisallowedClass, Psych::SyntaxError => e
          Jekyll.logger.warn "AuthorDataGenerator: Skipping #{file_path}: #{e.message}"
        end
      end

      source_output_path = File.join(site.source, '_data', 'authors.yml')
      FileUtils.mkdir_p(File.dirname(source_output_path))
      File.write(source_output_path, author_data.to_yaml)
      Jekyll.logger.info "AuthorDataGenerator: Wrote authors.yml to #{source_output_path}"
    end
  end
end

# Hook to copy _data/authors.yml to _site/data/authors.yml after build
Jekyll::Hooks.register :site, :post_write do |site|
  source_path = File.join(site.source, '_data', 'authors.yml')
  dest_path = File.join(site.dest, 'data', 'authors.yml')
  if File.exist?(source_path)
    FileUtils.mkdir_p(File.dirname(dest_path))
    FileUtils.cp(source_path, dest_path)
    Jekyll.logger.info "AuthorDataGenerator: Copied #{source_path} to #{dest_path}"
  else
    Jekyll.logger.warn "AuthorDataGenerator: Source file #{source_path} not found"
  end
end
