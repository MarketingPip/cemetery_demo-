# Defining a Jekyll generator plugin to process author files and create a data file
module Jekyll
  class AuthorDataGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      # Initializing an empty hash to store author data
      author_data = {}

      # Finding all files in the _authors directory
      author_files = Dir.glob(File.join(site.source, '_authors', '*.{md,markdown}'))

      author_files.each do |file_path|
        # Reading the front matter of each author file
        front_matter = YAML.load_file(file_path)
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
      end

      # Writing the author data to _data/authors.yml
      output_path = File.join(site.source, '_data', 'authors.yml')
      FileUtils.mkdir_p(File.dirname(output_path))
      File.write(output_path, author_data.to_yaml)
    end
  end
end
