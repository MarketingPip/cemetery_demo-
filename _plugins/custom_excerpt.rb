# _plugins/custom_excerpt.rb
Jekyll::Hooks.register :documents, :post_render do |doc|
  if doc.output
    # Remove all heading tags (h1–h6)
    cleaned = doc.output.gsub(/<h[1-6][^>]*>.*?<\/h[1-6]>/im, '')

    # Remove all remaining HTML tags
    cleaned = cleaned.gsub(/<\/?[^>]*>/, '')

    # Normalize whitespace and truncate to 50 words
    cleaned = cleaned.strip.split(/\s+/)[0..49].join(' ')

    # Save cleaned excerpt
    doc.data['excerpt'] = cleaned
  end
end
