module Jekyll
  module RegexMatch
    def regex_match(input, pattern)
      !!(input =~ Regexp.new(pattern))
    end
  end
end

Liquid::Template.register_filter(Jekyll::RegexMatch)

=begin
Example Usage;
{% if content | regex_match: '<person-info(\s+[^>]*)?>' %}
  <!-- do something -->
{% endif %}
=end
