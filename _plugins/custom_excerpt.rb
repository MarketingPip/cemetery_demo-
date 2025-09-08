# _plugins/custom_excerpt.rb

Jekyll::Hooks.register :documents, :post_render do |doc|
  # Only process documents that have Markdown content
  next unless doc.respond_to?(:content) && doc.content && doc.output

  rendered = doc.content.dup

  # Remove fenced code blocks: <pre><code>...</code></pre>
  rendered.gsub!(/<pre><code>.*?<\/code><\/pre>/im, '')

  # Remove inline code blocks: <code>...</code>
  rendered.gsub!(/<code>.*?<\/code>/im, '')

  # Remove heading tags: <h1> to <h6>
  rendered.gsub!(/<h[1-6][^>]*>.*?<\/h[1-6]>/im, '')

  # Remove all remaining HTML tags
  rendered.gsub!(/<\/?[^>]*>/, '')

  # Normalize whitespace and truncate to 50 words
  words = rendered.strip.split(/\s+/)
  cleaned_excerpt = words[0..49].join(' ')
  cleaned_excerpt += '...' if words.size > 50

  # Assign cleaned excerpt
  doc.data['excerpt'] = cleaned_excerpt
end
