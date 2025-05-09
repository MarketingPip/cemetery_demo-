require 'yaml'

module Jekyll
  class AuthorDataGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      author_data = {}
      author_files = Dir.glob(File.join(site.source, '_authors', '*.{md,markdown}'))

      author_files.each do |file_path|
        begin
          # Use Psych.safe_load with allowed classes to avoid DisallowedClass errors
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

      output_path = File.join(site.source, '_data', 'authors.yml')
      FileUtils.mkdir_p(File.dirname(output_path))
      File.write(output_path, author_data.to_yaml)
    end
  end
end
