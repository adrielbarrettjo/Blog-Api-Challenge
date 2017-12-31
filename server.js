//settings + import all the things
'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //*?* >> this configures it to use ES6 promises 


const { DATABASE_URL, PORT } = require('./config');
const { BlogPost } = require('./models');

const app = express();

// const blogPostsRouter = require('./blogPostsRouter');

app.use(morgan('common'));
app.use(bodyParser.json());
// app.use('./blog-posts', blogPostsRouter);

//////////////////////////////////////////////////
//			 Get, Post, Put, Delete				//
//////////////////////////////////////////////////
app.get('/posts', (req, res) => {
	BlogPost
	.find()
	.then(posts => {
		res.json(
			posts.serialize()
		);
	})
	.catch(
		err => {
		console.error(err);
		res.status(500).json({ error: 'something is wrong with the internal server'})
	});
});

app.get('/posts/:id', (req, res) => {
	BlogPost
	.findById(req.params.id)
	.then(posts => res.json(posts.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'internal server error'})
	});
});

app.post('/posts', (req, res) => {
	const requiredField = ['title', 'content', 'author', 'created' ];
	for (let i=0; i<requiredField.length; i++) {
		const field = requiredField[i];
		if (!(field in req.body)) {
			const message = 'Missing \`${field}\` in request body'
			console.error(message);
			return res.status(400).send(message);
		}
	}

	BlogPost
	.create({
		title:  req.body.title,
		content: req.body.content,
		author: req.body.author,
		created: req.body.created})
	.then(
		post => res.status(201).json(post.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'internal server error'});
	});
});

app.put('/posts/:id', (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) { //*?*
		
		res.status(400).json({
			error: 'request path id and request body id values must match'
		});
		// const message = (
		// 	`Request path id (${req.params.id}) and request body id ` +
		// 	`(${req.body.id}) must match`);
		// console.error(message);
		// return res.status(400).json({message: message});
		// 	}
	} 

	const toUpdate = {}; //*?*
	const updateableFields = ['title', 'content', 'author', 'created']; //*?*

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost
	.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true}) // *?* why the {new: true}?
	.then(post => res.status(204).end())
	.catch(err => res.status(500).json({message: 'internal server error'}))
});


app.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});



// add let server, run server, and close server
let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) { //*?* why do there need to be inputs now?
	// const port = process.env.PORT || 8080;
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, { useMongoClient: true}, err => {
			if (err) {
				return reject(err); //*?* how does this work?
			}

		server = app.listen(port, () => {
			console.log(`Your app is listening on port ${port}`);
			resolve (server);

		})

		.on('error', err => {
			mongoose.disconnect(); //*?* why is this needed in addition to the close server?
			// it seems like it's because the connection is within the runserver, so it needs to 
			reject(err)
		});
	});
  });
}

function closeServer() {
	return mongoose.disconnect().then(() => { //*?* same question as above: what is the purpose of this line
	return new Promise((resolve, reject) => {
		console.log('closing server');
		server.close(err => {
			if (err) {
				return reject(err);
				// VS.
				// reject(err);
				// return;
			}
			resolve();
		});
	});
	});
}





if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

//*?* why is the below code no longer needed? // it seems like it's been
// integrated into the rest of the code, but why is it different now? / how
// is that related to mongoose?

// app.listen(process.env.PORT || 8080, () => {
//   console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
// });

// Use Express router and modularize routes to /blog-posts.



