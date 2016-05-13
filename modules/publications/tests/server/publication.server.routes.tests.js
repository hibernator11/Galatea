'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Publication = mongoose.model('Publication'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, publication;

/**
 * Book routes tests
 */
describe('Publication CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new publication
    user.save(function () {
      publication = {
        title: 'Publication Title',
        content: 'Publication Content'
      };

      done();
    });
  });

  it('should be able to save an publication if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new publication
        agent.post('/api/publications')
          .send(publication)
          .expect(200)
          .end(function (publicationSaveErr, publicationSaveRes) {
            // Handle publication save error
            if (publicationSaveErr) {
              return done(publicationSaveErr);
            }

            // Get a list of publications
            agent.get('/api/publications')
              .end(function (publicationsGetErr, publicationsGetRes) {
                // Handle publication save error
                if (publicationsGetErr) {
                  return done(publicationsGetErr);
                }

                // Get publications list
                var publications = publicationsGetRes.body;

                // Set assertions
                (publications[0].user._id).should.equal(userId);
                (publications[0].title).should.match('Publication Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an publication if not logged in', function (done) {
    agent.post('/api/publications')
      .send(publication)
      .expect(403)
      .end(function (publicationSaveErr, publicationSaveRes) {
        // Call the assertion callback
        done(publicationSaveErr);
      });
  });

  it('should not be able to save an publication if no title is provided', function (done) {
    // Invalidate title field
    publication.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new book
        agent.post('/api/publications')
          .send(publication)
          .expect(400)
          .end(function (publicationSaveErr, publicationSaveRes) {
            // Set message assertion
            (publicationSaveRes.body.message).should.match('Title cannot be blank');

            // Handle book save error
            done(publicationSaveErr);
          });
      });
  });

  it('should be able to update an book if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new book
        agent.post('/api/publications')
          .send(publication)
          .expect(200)
          .end(function (publicationSaveErr, publicationSaveRes) {
            // Handle book save error
            if (publicationSaveErr) {
              return done(publicationSaveErr);
            }

            // Update publication title
            publication.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing publication
            agent.put('/api/publications/' + publicationSaveRes.body._id)
              .send(publication)
              .expect(200)
              .end(function (publicationUpdateErr, publicationUpdateRes) {
                // Handle book update error
                if (publicationUpdateErr) {
                  return done(publicationUpdateErr);
                }

                // Set assertions
                (publicationUpdateRes.body._id).should.equal(publicationSaveRes.body._id);
                (publicationUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of publications if not signed in', function (done) {
    // Create new book model instance
    var publicationObj = new Publication(publication);

    // Save the publication
    publicationObj.save(function () {
      // Request books
      request(app).get('/api/publications')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single publication if not signed in', function (done) {
    // Create new publication model instance
    var publicationObj = new Publication(publication);

    // Save the publication
    publicationObj.save(function () {
      request(app).get('/api/publications/' + publicationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', publication.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single publication with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/publications/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Publication is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single publication which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent publication
    request(app).get('/api/publications/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No publication with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an publication if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new book
        agent.post('/api/publications')
          .send(publication)
          .expect(200)
          .end(function (publicationSaveErr, publicationSaveRes) {
            // Handle publication save error
            if (publicationSaveErr) {
              return done(publicationSaveErr);
            }

            // Delete an existing publication
            agent.delete('/api/publications/' + publicationSaveRes.body._id)
              .send(publication)
              .expect(200)
              .end(function (publicationDeleteErr, publicationDeleteRes) {
                // Handle publication error error
                if (publicationDeleteErr) {
                  return done(publicationDeleteErr);
                }

                // Set assertions
                (publicationDeleteRes.body._id).should.equal(publicationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an publication if not signed in', function (done) {
    // Set publication user
    publication.user = user;

    // Create new publication model instance
    var publicationObj = new Publication(publication);

    // Save the publication
    publicationObj.save(function () {
      // Try deleting book
      request(app).delete('/api/publications/' + publicationObj._id)
        .expect(403)
        .end(function (publicationDeleteErr, publicationDeleteRes) {
          // Set message assertion
          (publicationDeleteRes.body.message).should.match('User is not authorized');

          // Handle book error error
          done(publicationDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Publication.remove().exec(done);
    });
  });
});
