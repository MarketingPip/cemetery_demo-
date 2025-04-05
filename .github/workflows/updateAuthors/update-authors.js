import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Directory where your posts and author files are located
const postsDir = path.join(process.cwd(), '_posts');
const authorsDir = path.join(process.cwd(), '_authors'); // This directory holds author .md files

// Function to update the author's file with new post
const updateAuthorFile = (authorName, post) => {
  const authorFilePath = path.join(authorsDir, `${authorName.toLowerCase().replace(/ /g, '-')}.md`);

  if (fs.existsSync(authorFilePath)) {
    const fileContent = fs.readFileSync(authorFilePath, 'utf-8');
    const parsed = matter(fileContent);

    // Ensure `posts` exists
    if (!parsed.data.posts) {
      parsed.data.posts = [];
    }

    parsed.data.posts.push({
      title: post.title,
      url: post.url,
      date: post.date,
      excerpt: post.excerpt
    });

    const newContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(authorFilePath, newContent);
    console.log(`Updated posts for author: ${authorName}`);
  } else {
    console.log(`Author file not found for: ${authorName}`);
  }
};

// Function to scan for new posts
const addPostToAuthor = (postFilePath) => {
  const fileContent = fs.readFileSync(postFilePath, 'utf-8');
  const { data: postData, content } = matter(fileContent);

  // Extract the author name from the post front matter
  const authorName = postData.author;

  if (authorName) {
    console.log(postData);

    const formattedDate = new Date(postData.date).toISOString().split('T')[0].split('-').join('/');
    const slug = postData.title.toLowerCase().replace(/ /g, '-');

    const post = {
      title: postData.title,
      url: `/blog/${formattedDate}/${slug}`,
      date: postData.date,
      excerpt: postData.excerpt || '' // Optional
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
