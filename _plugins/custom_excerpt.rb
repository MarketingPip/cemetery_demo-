# _plugins/custom_excerpt.rb
Jekyll::Hooks.register :documents, :post_render do |doc|
  # Only process if the document has raw content (i.e., not static pages)
  next unless doc.respond_to?(:content) && doc.content && doc.output

  # Remove <h1>–<h6> headings from the rendered HTML
  cleaned = doc.content.gsub(/<h[1-6][^>]*>.*?<\/h[1-6]>/im, '')

  # Strip any remaining HTML tags
  cleaned = cleaned.gsub(/<\/?[^>]*>/, '')

  # Truncate to 50 words
  words = cleaned.strip.split(/\s+/)
  cleaned_excerpt = words[0..49].join(' ')
  cleaned_excerpt += '...' if words.size > 50

  # Assign to `excerpt`
  doc.data['excerpt'] = cleaned_excerpt
end
