//import all the things
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should(); //*?* difference between expect and should?
// const expect = chai.expect();

const {BlogPost}  = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const url = require('../config');


chai.use(chaiHttp);

// seed the db
function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }
  // this will return a promise
  return BlogPost.insertMany(seedData);
}
// delete the whole db
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('deleting whole db');
    return mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));


  });
  
}



//describe blocks
describe('Blog Posts', function() {

	before(function() {
    return runServer(TEST_DATABASE_URL);
		// return runServer(); // in the first interaction we didn't need to inpput the name of the db. why?
	});

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

	after(function() {
		return closeServer();
	});



describe('GET endpoint', function() {

   it('should list items on GET', function() {

    let res;
    return chai.request(app)
    .get('/posts')
    .then(_res => {

      res = _res;
      res.should.have.status(200);
      res.body.should.have.length.above(1);
      // res.body.should.be.a('array');
      // res.should.forEach(function(post) {
      //   post.should.be.a('object');
      //   post.should.have.all.keys(
      //     'id', 'title', 'content', 'author', 'created');

      // });
      return BlogPost.count();
      // .then(count => {
      //   res.body.should.have.length.of(count);
      // });
  })
  .then(count => {
    res.body.should.have.length(count);
  }); 
  }); 

  it('should return posts with right fields', function () {
      
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function (res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.above(1);

          res.body.forEach(function (post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'title', 'content', 'author', 'created');
          });

          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(post => {
          resPost.title.should.equal(post.title);
          resPost.content.should.equal(post.content);
          resPost.author.should.equal(post.authorName);
        });
    });

}); // end of Get describe

  describe('POST endpoint', function() {
    it('should add a new BlogPost', function() {
      const newPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
        content: faker.lorem.text()
      };



      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then( function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
          res.body.title.should.equal(newPost.title);
          res.body.id.should.not.be.null;
          res.body.author.should.equal(
            `${newPost.author.firstName} ${newPost.author.lastName}`);
          res.body.content.should.equal(newPost.content);
          return BlogPost.findById(res.body.id); //*?* why are this line plus the following 6 lines necessary?
        })
        .then(post => {
          post.title.should.equal(newPost.title);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
          post.content.should.equal(newPost.content);

        }); 

    }); // end of should


  }); // end of describe block




  describe('PUT endpoint', function() {

    it('should update fields you send over', function () {
      const updateData = {
        title: 'yep yep yep',
        content: 'okok okok okok',
        author: {
          firstName: 'Anna',
          lastName: 'Hendrick'
        }
      }; // end of const updatedata

      return BlogPost
        .findOne()
        .then(post => {
          updateData.id = post.id;

          return chai.request(app) // *?* I doin't understand http protocols enough.
            .put(`/posts/${post.id}`) //
            .send(updateData); //
        })
        .then(res => {
          res.should.have.status(204);
          return BlogPost.findById(updateData.id);
        })
        .then(post => {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
          post.author.firstName.should.equal(updateData.author.firstName);
          post.author.lastName.should.equal(updateData.author.lastName);

        });
      });
  }); // end of describe


describe('DELETE endpoint', function() {
  it('should delete a post by id', function() {
    let post;
    return BlogPost 
      .findOne()
      .then(_post => {
        console.log('FROM THE DELETE');
        console.log(_post);
        post = _post;
        return chai.request(app).delete(`/posts/${post._id}`);
      })
      .then(res => {
        console.log('RES');
        console.log(res);
        res.should.have.status(204);
        return BlogPost.findById(post._id);
      })
      .then(_post => {
        console.log('_POST');
        console.log(_post);
        should.not.exist(_post); //*?* why can you start with "should"?
      });

  }); // of it should
}); //end of describe



});


