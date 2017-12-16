// Use Express router and modularize routes to /blog-posts.

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

// GET and POST requests should go to /blog-posts.

router.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get());
});

router.post('/blog-posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \'${field}\' in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const {title, content, author, publishDate} = req.body;
  const item = BlogPosts.create(title, content, author, publishDate);
  res.status(201).json(item);
})

// DELETE and PUT requests should go to /blog-posts/:id.

router.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.id}\``);
  res.status(204).end();
});


router.put('/blog-posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const mesage = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }

  console.log(`Updating blog post \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    ingredients: req.params.ingredients
  });
  res.status(204).end();
})


// Add a couple of blog posts on server load so you'll automatically have some data to look at when the server starts.

function lorem() {
  return 'abcd';
}


BlogPosts.create(
  '10 things -- you won\'t believe #4', lorem(), 'Billy Bob');
BlogPosts.create(
  'Lions and tigers and bears oh my', lorem(), 'Lefty Lil');

module.exports = router;
