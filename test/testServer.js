//import all the things
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should(); //*?* difference between expect and should?
const expect = chai.expect();

const {BlogPost}  = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// seed the db
function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i=1; 1<=10; i++) {
    seedData.push(generateBlogPostData());
  }
  //this returns a promise
  return BlogPost.insertMant(seedData);

}

function generateBlogPostData() {
  return {
    title: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.name.paragraph(),

  }
}

// delete the whole db
function tearDownDb() {
  console.warn('deleting whole db');
  return mongoose.connection.dropDatabase();
}



//describe blocks
describe('Blog Posts', function() {

	before(function() {
    return runServer(TEST_DATABASE_URL);
		// return runServer(); // in the first interaction we didn't need to inpput the name of the db. why?
	});

  beforeEach(function() {
    return seedBlogPostData();
  })

  afterEach(function() {
    return tearDownDb();
  })

	after(function() {
		return closeServer();
	});

  describe('GET endpoint' function() {

   it('should list items on GET', function() {

    let res;
    return chai.request(app)
    .get('/posts')
    .then(_res => {

      res = _res;
      res.should.have.status(200);
      res.body.should.have.length.of.at.least(1);
      res.body.should.be.a('array');
      res.should.forEach(function(post) {
        post.should.be.a('object');
        post.should.have.all.keys(
          'id', 'title', 'content', 'author', 'created');
      });
      return BlogPost.count();
      .then(count => {
        res.body.should.have.length.of(count);
      });
  }); 
  });
 });

  describe('POST endpoint', function() {
    it('should add a new restaurant', function() {
      const newPost = generateBlogPostData();
      let BlogPost;
      return chai.request(app);
        .post('/posts')
        .send(newPost)
        .then( res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.author).to.equal(newPost.author);
          return BlogPost.findByID(res.body.id); //*?* why are this line plus the following 6 lines necessary?
        });
        .then(post => {
          post.title.should.equal(newPost.title);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
          post.content.should.equal(newPost.concent);

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
        post = _post;
        return chai.request(app).delete(`/posts/${post.id}`);
      })
      .then(res => {
        res.should.have.status.(204);
        return BlogPost.findByID(post.id);
      })
      .then(_post => {
        should.not.exist(_post); //*?* why can you start with "should"?
      });

  }); // of it should
}); //end of describe


});