Jekyll::Hooks.register :documents, :pre_render do |doc|
  if doc.content
    # Remove all heading tags and other HTML
    cleaned = doc.content.gsub(/<h[1-6][^>]*>.*?<\/h[1-6]>/im, '')
    cleaned = cleaned.gsub(/<\/?[^>]*>/, '') # Remove all remaining HTML tags
    cleaned = cleaned.strip.split(/\s+/)[0..49].join(' ') # Truncate to 50 words
    doc.data['excerpt'] = cleaned
  end
end
