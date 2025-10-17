# _plugins/exhibits_tag_pages.rb

# Hook after site reads all content
Jekyll::Hooks.register :site, :post_read do |site|
  # Make sure the exhibits collection exists
  next unless site.collections['exhibits']

  # Collect all unique tags from exhibits
  all_tags = site.collections['exhibits'].docs.flat_map { |p| p.data['tags'] || [] }.uniq
  next if all_tags.empty?

  all_tags.each do |tag|
    site.pages << ExhibitsTagPage.new(site, site.source, '', tag)
  end
end

class ExhibitsTagPage < Jekyll::Page
  def initialize(site, base, dir, tag)
    @site = site
    @base = base
    @dir  = dir
    @name = 'index.html'

    # URL structure: /exhibits/tag/<tag>/
    @url = "/exhibits/tag/#{Jekyll::Utils.slugify(tag)}/"

    # Use a specific layout for exhibit tag pages
    self.read_yaml(File.join(base, '_layouts'), "tag.html")
    self.data['layout'] = 'tag'
    self.data['title'] = "Exhibits tagged with '#{tag}'"
    self.data['pagination'] = {
      'enabled' => true,
      'collection' => 'exhibits',
      'sort_field' => 'date',
      'sort_reverse' => true,
      'tag' => tag
    }

    # Needed so Jekyll processes the page
    self.process(@name)

    # Apply front matter defaults if needed
    data.default_proc = proc do |_, key|
      site.frontmatter_defaults.find(File.join(dir, name), type, key)
    end

    # Trigger post_init hook for consistency
    Jekyll::Hooks.trigger :pages, :post_init, self
  end
end
