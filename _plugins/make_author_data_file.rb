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

           # Write to _site/data directory for final output
           site_output_path = File.join(site.dest, 'data', 'authors.yml')
           FileUtils.mkdir_p(File.dirname(site_output_path))
           File.write(site_output_path, author_data.to_yaml)
         end
       end
     end
