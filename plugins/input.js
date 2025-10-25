// blog-template-helper.js - Plugin to add custom form fields to blog post editor
export const plugin = {
  name: "Blog Template Helper",
  version: "1.0.0",
  description: "Adds custom template fields to the blog post editor for common post types",
  
  init(context) {
    // Create custom fields section
    const customFieldsSection = document.createElement('div');
    customFieldsSection.id = 'custom-fields-section';
    customFieldsSection.className = 'space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg';
    customFieldsSection.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-purple-900">📋 Template Helper</h3>
        <button id="toggle-custom-fields" class="text-sm text-purple-700 hover:text-purple-900">
          Hide ▲
        </button>
      </div>
      <div id="custom-fields-content" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
          <select id="post-type-select" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">-- Select Template --</option>
            <option value="tutorial">📚 Tutorial</option>
            <option value="review">⭐ Review</option>
            <option value="news">📰 News Article</option>
            <option value="howto">🔧 How-To Guide</option>
            <option value="listicle">📝 Listicle</option>
            <option value="interview">🎤 Interview</option>
            <option value="case-study">💼 Case Study</option>
          </select>
        </div>

        <!-- Tutorial Template Fields -->
        <div id="tutorial-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
            <select id="tutorial-difficulty" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
            <input type="number" id="tutorial-time" placeholder="30" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
            <input type="text" id="tutorial-prereqs" placeholder="Basic knowledge of JavaScript" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>

        <!-- Review Template Fields -->
        <div id="review-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product/Service Name</label>
            <input type="text" id="review-product" placeholder="Product name" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
            <input type="number" id="review-rating" min="1" max="5" step="0.5" placeholder="4.5" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pros (comma-separated)</label>
            <input type="text" id="review-pros" placeholder="Easy to use, Great design, Fast performance" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cons (comma-separated)</label>
            <input type="text" id="review-cons" placeholder="Expensive, Limited features" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>

        <!-- News Article Fields -->
        <div id="news-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">News Source</label>
            <input type="text" id="news-source" placeholder="Source name" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" id="news-location" placeholder="City, Country" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="news-breaking" class="mr-2">
            <label class="text-sm font-medium text-gray-700">Breaking News</label>
          </div>
        </div>

        <!-- How-To Guide Fields -->
        <div id="howto-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Steps</label>
            <input type="number" id="howto-steps" placeholder="5" min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tools/Materials Needed</label>
            <input type="text" id="howto-tools" placeholder="Screwdriver, Hammer, Nails" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>

        <!-- Listicle Fields -->
        <div id="listicle-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Items</label>
            <input type="number" id="listicle-count" placeholder="10" min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">List Topic</label>
            <input type="text" id="listicle-topic" placeholder="Best productivity apps" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>

        <!-- Interview Fields -->
        <div id="interview-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Interviewee Name</label>
            <input type="text" id="interview-name" placeholder="Jane Smith" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Interviewee Title/Position</label>
            <input type="text" id="interview-title" placeholder="CEO at TechCorp" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
            <input type="date" id="interview-date" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>

        <!-- Case Study Fields -->
        <div id="case-study-fields" class="hidden space-y-3 pl-4 border-l-4 border-purple-300">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company/Client Name</label>
            <input type="text" id="case-study-client" placeholder="Acme Corporation" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input type="text" id="case-study-industry" placeholder="E-commerce" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Challenge/Problem</label>
            <textarea id="case-study-challenge" rows="2" placeholder="What problem was solved?" class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Results/Outcome</label>
            <textarea id="case-study-results" rows="2" placeholder="What were the results?" class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
        </div>

        <button id="insert-template-btn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition duration-200">
          ✨ Insert Template into Post
        </button>
      </div>
    `;

    // Insert after the tags field in the editor
    const tagsField = context.elements.tags.parentElement.parentElement;
    tagsField.parentNode.insertBefore(customFieldsSection, tagsField.nextSibling);

    // Template generators
    const templates = {
      tutorial: () => {
        const difficulty = document.getElementById('tutorial-difficulty').value;
        const time = document.getElementById('tutorial-time').value;
        const prereqs = document.getElementById('tutorial-prereqs').value;

        let content = `## Tutorial Overview\n\n`;
        if (difficulty) content += `**Difficulty:** ${difficulty}\n`;
        if (time) content += `**Estimated Time:** ${time} minutes\n`;
        if (prereqs) content += `**Prerequisites:** ${prereqs}\n`;
        
        content += `\n## What You'll Learn\n\n- \n- \n- \n\n`;
        content += `## Step 1: Getting Started\n\n`;
        content += `Write your first step here...\n\n`;
        content += `## Step 2: \n\n`;
        content += `Continue with your tutorial...\n\n`;
        content += `## Conclusion\n\n`;
        content += `Wrap up your tutorial and provide next steps...\n`;
        
        return content;
      },

      review: () => {
        const product = document.getElementById('review-product').value;
        const rating = document.getElementById('review-rating').value;
        const pros = document.getElementById('review-pros').value;
        const cons = document.getElementById('review-cons').value;

        let content = `## Review: ${product || '[Product Name]'}\n\n`;
        if (rating) content += `**Overall Rating:** ⭐ ${rating}/5\n\n`;
        
        content += `## Overview\n\n`;
        content += `Brief introduction to the product/service...\n\n`;
        
        if (pros) {
          content += `## Pros\n\n`;
          pros.split(',').forEach(pro => {
            content += `- ✅ ${pro.trim()}\n`;
          });
          content += `\n`;
        }
        
        if (cons) {
          content += `## Cons\n\n`;
          cons.split(',').forEach(con => {
            content += `- ❌ ${con.trim()}\n`;
          });
          content += `\n`;
        }
        
        content += `## Features\n\n`;
        content += `Describe key features...\n\n`;
        content += `## Final Verdict\n\n`;
        content += `Your conclusion and recommendation...\n`;
        
        return content;
      },

      news: () => {
        const source = document.getElementById('news-source').value;
        const location = document.getElementById('news-location').value;
        const breaking = document.getElementById('news-breaking').checked;

        let content = breaking ? `## 🚨 BREAKING NEWS\n\n` : `## News Report\n\n`;
        
        if (location) content += `**Location:** ${location}\n`;
        if (source) content += `**Source:** ${source}\n`;
        content += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
        
        content += `### Headline Summary\n\n`;
        content += `Write a brief summary of the news story...\n\n`;
        content += `### Details\n\n`;
        content += `Provide detailed information about the event...\n\n`;
        content += `### Impact\n\n`;
        content += `Discuss the implications and impact...\n\n`;
        content += `### Updates\n\n`;
        content += `Any additional updates or developments...\n`;
        
        return content;
      },

      howto: () => {
        const steps = parseInt(document.getElementById('howto-steps').value) || 5;
        const tools = document.getElementById('howto-tools').value;

        let content = `## How to [Task Name]\n\n`;
        
        if (tools) {
          content += `### Tools/Materials Needed\n\n`;
          tools.split(',').forEach(tool => {
            content += `- ${tool.trim()}\n`;
          });
          content += `\n`;
        }
        
        content += `### Instructions\n\n`;
        
        for (let i = 1; i <= steps; i++) {
          content += `#### Step ${i}: [Step Title]\n\n`;
          content += `Describe this step in detail...\n\n`;
        }
        
        content += `### Tips & Tricks\n\n`;
        content += `- Add helpful tips here\n`;
        content += `- Include common mistakes to avoid\n\n`;
        content += `### Conclusion\n\n`;
        content += `Wrap up with final thoughts...\n`;
        
        return content;
      },

      listicle: () => {
        const count = parseInt(document.getElementById('listicle-count').value) || 10;
        const topic = document.getElementById('listicle-topic').value;

        let content = `## ${count} ${topic || '[Topic]'}\n\n`;
        content += `Introduction to the list...\n\n`;
        
        for (let i = 1; i <= count; i++) {
          content += `### ${i}. [Item Title]\n\n`;
          content += `Description of this item...\n\n`;
        }
        
        content += `## Conclusion\n\n`;
        content += `Summarize the list...\n`;
        
        return content;
      },

      interview: () => {
        const name = document.getElementById('interview-name').value;
        const title = document.getElementById('interview-title').value;
        const date = document.getElementById('interview-date').value;

        let content = `## Interview with ${name || '[Name]'}\n\n`;
        if (title) content += `*${title}*\n\n`;
        if (date) content += `**Interview Date:** ${date}\n\n`;
        
        content += `### Introduction\n\n`;
        content += `Brief introduction to the interviewee and context...\n\n`;
        content += `### Interview\n\n`;
        content += `**Q: [Question 1]**\n\n`;
        content += `A: [Answer]\n\n`;
        content += `**Q: [Question 2]**\n\n`;
        content += `A: [Answer]\n\n`;
        content += `**Q: [Question 3]**\n\n`;
        content += `A: [Answer]\n\n`;
        content += `### Key Takeaways\n\n`;
        content += `- Key point 1\n`;
        content += `- Key point 2\n`;
        content += `- Key point 3\n`;
        
        return content;
      },

      'case-study': () => {
        const client = document.getElementById('case-study-client').value;
        const industry = document.getElementById('case-study-industry').value;
        const challenge = document.getElementById('case-study-challenge').value;
        const results = document.getElementById('case-study-results').value;

        let content = `## Case Study: ${client || '[Client Name]'}\n\n`;
        if (industry) content += `**Industry:** ${industry}\n\n`;
        
        content += `### Executive Summary\n\n`;
        content += `Brief overview of the project...\n\n`;
        
        content += `### The Challenge\n\n`;
        content += challenge || `Describe the problem or challenge...\n\n`;
        content += `\n\n### Our Solution\n\n`;
        content += `Explain the approach and solution implemented...\n\n`;
        
        content += `### Implementation\n\n`;
        content += `Detail the implementation process...\n\n`;
        
        content += `### Results\n\n`;
        content += results || `Describe the outcomes and metrics...\n\n`;
        content += `\n\n### Key Metrics\n\n`;
        content += `- Metric 1: [Value]\n`;
        content += `- Metric 2: [Value]\n`;
        content += `- Metric 3: [Value]\n\n`;
        
        content += `### Conclusion\n\n`;
        content += `Final thoughts and lessons learned...\n`;
        
        return content;
      }
    };

    // Event handlers
    setTimeout(() => {
      const postTypeSelect = document.getElementById('post-type-select');
      const insertBtn = document.getElementById('insert-template-btn');
      const toggleBtn = document.getElementById('toggle-custom-fields');

      // Show/hide template-specific fields
      postTypeSelect.addEventListener('change', () => {
        // Hide all template fields
        document.querySelectorAll('[id$="-fields"]').forEach(el => {
          el.classList.add('hidden');
        });

        // Show selected template fields
        const selectedType = postTypeSelect.value;
        if (selectedType) {
          const fieldsDiv = document.getElementById(`${selectedType}-fields`);
          if (fieldsDiv) {
            fieldsDiv.classList.remove('hidden');
          }
        }
      });

      // Insert template into content
      insertBtn.addEventListener('click', () => {
        const selectedType = postTypeSelect.value;
        if (!selectedType) {
          context.showAlert('Please select a post type first', 'warning');
          return;
        }

        const template = templates[selectedType];
        if (template) {
          const generatedContent = template();
          const currentContent = context.elements.content.value;
          
          // Append or replace
          if (currentContent.trim()) {
            if (confirm('Content already exists. Append template to existing content?')) {
              context.elements.content.value = currentContent + '\n\n' + generatedContent;
            }
          } else {
            context.elements.content.value = generatedContent;
          }
          
          context.showAlert('Template inserted successfully!', 'success');
          
          // Auto-add category based on template type
          const currentCategories = context.elements.categories.value;
          const categoryMap = {
            'tutorial': 'tutorials',
            'review': 'reviews',
            'news': 'news',
            'howto': 'guides',
            'listicle': 'lists',
            'interview': 'interviews',
            'case-study': 'case-studies'
          };
          
          const suggestedCategory = categoryMap[selectedType];
          if (suggestedCategory && !currentCategories.includes(suggestedCategory)) {
            const newCategories = currentCategories ? `${currentCategories}, ${suggestedCategory}` : suggestedCategory;
            context.elements.categories.value = newCategories;
          }
        }
      });

      // Toggle visibility
      toggleBtn.addEventListener('click', () => {
        const content = document.getElementById('custom-fields-content');
        const isHidden = content.classList.contains('hidden');
        
        if (isHidden) {
          content.classList.remove('hidden');
          toggleBtn.textContent = 'Hide ▲';
        } else {
          content.classList.add('hidden');
          toggleBtn.textContent = 'Show ▼';
        }
      });
    }, 500);

    context.showAlert('Blog Template Helper loaded! Use the template fields in the post editor.', 'success');
  },

  action: {
    label: "📋 Open Template Helper",
    handler(context) {
      context.switchTab('create');
      setTimeout(() => {
        document.getElementById('custom-fields-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }
};
