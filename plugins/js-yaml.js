// First, require the js-yaml library
import yaml from "https://esm.sh/js-yaml";
/**
 * Converts a JSON object into YAML front matter format.
 * @param {Object} jsonObject - The JSON object to convert.
 * @returns {string} - The JSON object as a properly formatted front matter string.
 */
function jsonToFrontMatter(jsonObject) {
  try {
    // Convert JSON to YAML format
    const yamlContent = yaml.dump(jsonObject);
    
    // Wrap the YAML content in front matter delimiters
    const frontMatter = `---\n${yamlContent}---\n`;

    return frontMatter;
  } catch (e) {
    console.error("Error converting JSON to front matter:", e);
    return '';
  }
}

// Example usage:

const jsonObject = {
  "title": "My Awesome Blog Post",
  "date": "2025-10-26",
  "layout": "post",
  "categories": ["Tech", "JavaScript"],
  "tags": ["npm", "js-yaml"],
  "excerpt": "This is an excerpt of my awesome blog post!",
  "published": true
};

const frontMatterString = jsonToFrontMatter(jsonObject);

console.log(frontMatterString);
