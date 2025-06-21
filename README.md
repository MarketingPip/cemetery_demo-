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
expire_date: 2025-03-15
hero_image: "/path/to/hero-image.jpg"
author_image: "/path/to/author-image.jpg"
image: "/path/to/post-image.jpg"
image_caption: "A recently uncovered photograph of a pioneer family, circa 1850s."
redirect-to: /deleted
---
Hey guys!-
```

* **author**: Required: The author identifier (e.g., `"jane-doe"`). This should exactly match the filename of the corresponding author markdown file in the `_authors` directory.
* **hero\_image**: Optional image for the blog post's hero section.
* **image**: Optional image for the blog post.
* **image\_caption**: Optional caption for the post image.
* **expire\_date**: *(Optional)* The date when the post should expire or be archived.
* **redirect\_to**: *(Optional)* A URL or path to which this post should redirect if accessed. **Note**: Expired posts will automatically be redirected to `"/deleted"`

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


### Add a Book

Create a markdown file in the `_books` directory with the following structure:

#### `_books/a-great-book.md`

```yaml
---
layout: review
title: "Illustrated Historical Atlas of the County of Huron, Ont."
author: "H. Belden & Co."
year:  1879
pdfFile: https://archive.org/download/McGillLibrary-rbsc_county-atlas-maps-huron-ontario_elfG1148H8H31879-22413/rbsc_county-atlas-maps-huron-ontario_elfG1148H8H31879.pdf
olid: "OL23514979M"
---
*Illustrated Historical Atlas of the County of Huron, Ont.* by H. Belden & Co. offers a rich visual and historical record of the County of Huron, Ontario, showcasing maps, illustrations, and detailed descriptions of the region’s geography, settlements, and prominent citizens. Published in the 19th century, this atlas serves as a valuable resource for historians, genealogists, and researchers interested in the development and history of Huron County.
```

### Explanation:

* **layout**: This specifies the layout for this page. In this case, it's set to `review`, which will render it as a review page.

* **title**: The title of the book you’re reviewing.

* **author**: The name of the book’s author.

* **year**: The year the book was published.

* **cover**: The path to the book cover image. You can either:

  * Use a self-hosted cover by placing the image in the `/assets/covers` directory and specifying its filename.
  * Or, use an Open Library URL by including either the Open Library ID (`olid`) or ISBN number.


* **pdfFile**: The URL to PDF file, if hosted locally put the PDF file into `resources\books`.
---

### Optional: Using Open Library API for Cover Image

If you prefer using Open Library's covers, you can search the book on Open Library, grab its `olid` or `isbn`, and use it like this:

#### Example with Open Library ID:

```yaml
olid: "7243520-L"  # Use the book's Open Library ID
```

#### Example with ISBN:

```yaml
isbn: "9780156439619-L"  # Use the ISBN for the book
```

---

### Example Book File Structure

If you're organizing multiple books, you can create the markdown files inside a `_books` folder like this:

```
/_books
  /a-great-book.md
  /another-book.md
  /yet-another-book.md
```

By adding files like this, you can list books on your site dynamically, pull in the metadata (such as status, title, and dates), and render them using a template or layout that handles these front matter variables.


### How to Add a Sponsor to the Website

To add a new sponsor, follow these steps to add their information to the appropriate category in the `_data/sponsors.yml` file.

---

### **1. Locate the Sponsors File**

All sponsor data is stored in the `/_data/sponsors.yml` file. If you’re adding a new sponsor, open this file in a text editor.

---

### **2. Determine the Category**

There are three categories of sponsors: **Heritage**, **Community**, and **Friend**. Each category has different types of sponsors with different levels of involvement.

* **Heritage Sponsors**: These are key contributors to preserving historical landmarks and legacy projects.
* **Community Sponsors**: These are local businesses or organizations helping preserve the community's history.
* **Friend Sponsors**: These are smaller contributors who support in various ways.

---

### **3. Add Sponsor Details**

Each sponsor entry includes the following properties:

* **name**: The name of the sponsor.
* **logo**: The filename of the logo image, stored in the `/assets/images/` directory.
* **description**: A short description of the sponsor’s involvement or contribution.
* **since**: The year the sponsor started their involvement.
* **sponsor\_endDate**: The end date of the sponsorship (if applicable). If the sponsorship has no end date or is ongoing, leave this blank.

### **4. Add a New Sponsor**

Add the new sponsor’s information under the correct category in the YAML file. Below is the template to follow.

```yaml
heritage:
  - name: "Heritage Community Bank"
    logo: "heritage-bank-logo.png"
    description: "Supporting local heritage preservation since 1952. Proud to help maintain Crediton's historical legacy for future generations."
    since: 2020
    sponsor_endDate: 2025-12-12
  - name: "Crediton Memorial Company"
    logo: "memorial-co-logo.png"
    description: "Family-owned memorial specialists dedicated to honoring memories with dignity and craftsmanship for over 75 years."
    since: 2019

community:
  - name: "Johnson & Associates Law"
    logo: "law-firm-logo.png"
    description: "Providing legal services to families and preserving important community records."
    since: 2021
  - name: "Green Thumb Garden Center"
    logo: "garden-center-logo.png"
    description: "Supplying plants and landscaping expertise to maintain beautiful cemetery grounds."
    since: 2022
  - name: "Digital Heritage Solutions"
    logo: "tech-solutions-logo.png"
    description: "Technology partner supporting our digital archives and online presence."
    since: 2023

friend:
  - name: "Main Street Café"
    logo: "cafe-logo.png"
    description: ""
    since: 2023
  - name: "Petals & Blooms"
    logo: "florist-logo.png"
    description: ""
    since: 2022
  - name: "Town Hardware"
    logo: "hardware-logo.png"
    description: ""
    since: 2024
  - name: "Chapter & Verse"
    logo: "bookstore-logo.png"
    description: ""
    since: 2024
```

### **5. Save the File**

After adding the sponsor details, save the changes to the `sponsors.yml` file.

---

### **6. Upload Sponsor's Logo**

Make sure the sponsor's logo image is uploaded to the `/assets/images/` directory. The image file should be referenced by its filename, e.g., `"heritage-bank-logo.png"`.

---

### **7. Refresh the Website**

Once the sponsor information is added and the file is saved, refresh the website or redeploy if necessary. The new sponsor will appear on the appropriate sponsor section of the site.

---

### **Important Notes**

* If the sponsor's **end date** has passed, it will not be displayed in the "Current Sponsors" section but rather in the "Past Sponsors" section.
* If the **description** field is left empty, the site may show a blank space or omit that text.
* Ensure the **logo** is properly sized and formatted for web use (JPEG, PNG, or SVG are recommended).

---

### **Removing a Sponsor**

To remove a sponsor, simply delete their entry from the appropriate section in the `sponsors.yml` file and ensure their logo file is also removed from the `/assets/images/` directory if no longer needed.


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
 
 
