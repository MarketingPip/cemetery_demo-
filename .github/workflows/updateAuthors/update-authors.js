import fs from 'fs';
import path from 'path';
import yamlFront from 'yaml-front-matter';

// Directory where your posts and author files are located
const postsDir = path.join(process.cwd(), '_posts');
const authorsDir = path.join(process.cwd(), '_authors'); // This directory holds author .md files

// Function to update the author's file with new post
const updateAuthorFile = (authorName, post) => {
  const authorFilePath = path.join(authorsDir, `${authorName.toLowerCase().replace(/ /g, '-')}.md`);

  if (fs.existsSync(authorFilePath)) {
    // Read the existing author's file
    const authorData = yamlFront.loadFront(fs.readFileSync(authorFilePath, 'utf-8'));

    // Check if the 'posts' array exists, if not, initialize it
    if (!authorData.posts) {
      authorData.posts = [];
    }

    // Add the new post to the author's posts
    authorData.posts.push({
      title: post.title,
      url: post.url,
      date: post.date,
      excerpt: post.excerpt // Add excerpt as well (optional)
    });

    // Write the updated author file back
    fs.writeFileSync(authorFilePath, yamlFront.stringify(authorData));
    console.log(`Updated posts for author: ${authorName}`);
  } else {
    console.log(`Author file not found for: ${authorName}`);
  }
};

// Function to scan for new posts
const addPostToAuthor = (postFilePath) => {
  const postData = yamlFront.loadFront(fs.readFileSync(postFilePath, 'utf-8'));

  // Extract the author name from the post front matter
  const authorName = postData.author;

  if (authorName) {
    console.log(postData);
    const post = {
      title: postData.title,
      url: `/blog/${postData.title.toLowerCase().replace(/ /g, '-')}`,
      date: postData.date,
      excerpt: postData.excerpt // Optionally add the excerpt
    };

    // Update the author's file with the new post
    updateAuthorFile(authorName, post);
  } else {
    console.log(`No author found for post: ${postFilePath}`);
  }
};

// Function to process all posts in the _posts directory
const processAllPosts = () => {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('Error reading the _posts directory:', err);
      return;
    }

    // Filter out non-md files and process each post
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    markdownFiles.forEach(file => {
      const postFilePath = path.join(postsDir, file);
      addPostToAuthor(postFilePath);
    });
  });
};

// Run the script
processAllPosts();
