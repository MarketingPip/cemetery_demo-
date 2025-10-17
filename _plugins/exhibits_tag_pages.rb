# _plugins/exhibits_tag_and_category_pages.rb

# Hook after site reads all content
Jekyll::Hooks.register :site, :post_read do |site|
  next unless site.collections['exhibits']

  exhibits = site.collections['exhibits'].docs

  # --- Generate tag pages ---
  all_tags = exhibits.flat_map { |p| p.data['tags'] || [] }.uniq
  all_tags.each do |tag|
    site.pages << ExhibitsTagPage.new(site, site.source, '', tag)
  end

  # --- Generate category pages ---
  all_categories = exhibits.flat_map { |p| p.data['categories'] || [] }.uniq
  all_categories.each do |category|
    site.pages << ExhibitsCategoryPage.new(site, site.source, '', category)
  end
end

# --- Tag Page ---
class ExhibitsTagPage < Jekyll::Page
  def initialize(site, base, dir, tag)
    @site = site
    @base = base
    @dir  = dir
    @name = 'index.html'
    @url = "/exhibits/tag/#{Jekyll::Utils.slugify(tag)}/"

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

    self.process(@name)

    data.default_proc = proc do |_, key|
      site.frontmatter_defaults.find(File.join(dir, name), type, key)
    end

    Jekyll::Hooks.trigger :pages, :post_init, self
  end
end

# --- Category Page ---
class ExhibitsCategoryPage < Jekyll::Page
  def initialize(site, base, dir, category)
    @site = site
    @base = base
    @dir  = dir
    @name = 'index.html'
    @url = "/exhibits/categories/#{Jekyll::Utils.slugify(category)}/"

    self.read_yaml(File.join(base, '_layouts'), "tag.html")
    self.data['layout'] = 'tag'
    self.data['title'] = "Exhibits in category '#{category}'"
    self.data['tag'] = category
    self.data['pagination'] = {
      'enabled' => true,
      'collection' => 'exhibits',
      'sort_field' => 'date',
      'sort_reverse' => true,
      'tag' => category
    }

    self.process(@name)

    data.default_proc = proc do |_, key|
      site.frontmatter_defaults.find(File.join(dir, name), type, key)
    end

    Jekyll::Hooks.trigger :pages, :post_init, self
  end
end
