# Filename: _plugins/compile_tags.rb
require 'fileutils'

Jekyll::Hooks.register :posts, :post_write do
  # Directory to save tag pages
  TAG_DIR = '_tag'  # Folder for tag pages

  # Ensure the tag directory exists
  FileUtils.mkdir_p(TAG_DIR) unless File.exists?(TAG_DIR)

  # Collect all tags from posts
  all_tags = []
  Jekyll.site.posts.docs.each do |post|
    tags = post.data['tags'] || []
    all_tags += tags
  end

  # Remove duplicate tags
  all_tags = all_tags.uniq

  # Create a tag page for each tag
  all_tags.each do |tag|
    tag_file_path = File.join(TAG_DIR, "#{tag}.md")
    
    # Only create the tag page if it doesn't exist already
    unless File.exist?(tag_file_path)
      # Write the tag page with front matter
      File.open(tag_file_path, 'w') do |f|
        f.write("---\n")
        f.write("layout: tagpage\n")
        f.write("tag: #{tag}\n")
        f.write("robots: noindex\n")
        f.write("---\n\n")
        f.write("This is the tag page for `#{tag}`.\n")
      end
    end
  end
end
