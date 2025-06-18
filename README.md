# Jekyll Blog with Multi-Author Support

This is a Jekyll-based blog template that supports multiple authors. Each author has a dedicated author page and can be associated with multiple blog posts. Additionally, the site provides functionality to convert CSV data to JSON format for easier integration.

## Features

- **Multi-Author Support**: Easily add multiple authors with dedicated pages.
- **CSV to JSON Conversion**: Convert a CSV file to JSON to integrate external data.
- **Post Assignment to Authors**: Assign authors to blog posts by referencing their author file.

## Example Usage

### CSV to JSON Conversion

This template comes with a utility to convert a CSV file into a JSON format. To use it, place your CSV file in the `./assets` folder and define the paths for input and output.

```javascript
const inputFilePath = './assets/cemetery_data.csv'; // Replace with your actual CSV file path
const outputFilePath = './assets/cemetery_data.json'; // Replace with your desired output JSON file path
````

### Adding Authors

To create a new author, create a markdown file inside the `_authors` directory. Here's an example of an author file:

#### `_authors/jane-doe.md`

```yaml
---
layout: author
author: jane-doe
name: Jane Doe
role: Historical Preservation Specialist
bio: >-
  Jane is an expert in heritage conservation and has contributed extensively to
  local history projects.
image: /images/authors/jane_doe.jpg
social:
  facebook: 'https://facebook.com/jane_doe'
  twitter: 'https://twitter.com/jane_doe'
  linkedin: 'https://linkedin.com/in/jane_doe'
---
```

* **author**: The unique identifier for the author (used in blog posts).
* **name**: Full name of the author.
* **role**: The author's role or title.
* **bio**: A brief biography of the author.
* **image**: URL path to the author's image.
* **social**: Social media profiles for the author.

#### Important Notes:

* No duplicate author names should exist. The `author` field (e.g., `jane-doe`) must be unique.

### Assigning Authors to Blog Posts

To assign an author to a blog post, simply reference their unique `author` identifier in the post's front matter. Here’s an example of a blog post:

#### `_posts/2025-03-15-test.md`

```yaml
---
layout: post
title: "test"
author: "jane-doe"
date: 2025-03-15 22:39:53
hero_image: "/path/to/hero-image.jpg"
author_image: "/path/to/author-image.jpg"
image: "/path/to/post-image.jpg"
image_caption: "A recently uncovered photograph of a pioneer family, circa 1850s."
---
Hey guys!-
```

* **author**: The author identifier (e.g., `"jane-doe"`). This should match the `author` field in the author markdown file.
* **hero\_image**: Optional image for the blog post's hero section.
* **author\_image**: Optional image for the author's section within the post.
* **image**: Optional image for the blog post.
* **image\_caption**: Optional caption for the post image.

### File Structure

Your project should have the following basic file structure:

```
my-jekyll-site/
├── _authors/
│   ├── jane-doe.md
│   ├── john-doe.md
├── _posts/
│   ├── 2025-03-15-test.md
│   ├── 2025-03-16-example.md
├── assets/
│   ├── cemetery_data.csv
│   └── cemetery_data.json
├── _config.yml
└── index.md
```

### How to Set Up

1. **Install Jekyll**:
   Follow the installation instructions from the [official Jekyll website](https://jekyllrb.com/docs/installation/).

2. **Run the Jekyll Server**:
   To run your site locally, navigate to your project folder in the terminal and execute:

   ```bash
   bundle exec jekyll serve
   ```

   This will start a local server at `http://localhost:4000` where you can view your site.

3. **Convert CSV to JSON**:
   To convert your CSV file to JSON, you can create a custom script or use a library. The file paths in the example usage above (`inputFilePath` and `outputFilePath`) should point to your CSV and JSON files respectively.

## Contributing

Feel free to open an issue or submit a pull request if you'd like to contribute to this template.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

```md
---
layout: default  # Uses the default layout
title: "About Us"
permalink: /about-us/  # The page will be available at /about-us/
date: 2025-04-03 10:00:00
author: "John Doe"
tags: [company, history]
categories: [About Us]
image: /assets/images/about-us-image.jpg
excerpt: "Learn more about our company and team."
published: true
sitemap: true
comments: true
robots: noindex, nofollow  # Don't let search engines index this page
redirect_from: /old-about-us/  # Redirect old URL to the new one
---

```
 
 
