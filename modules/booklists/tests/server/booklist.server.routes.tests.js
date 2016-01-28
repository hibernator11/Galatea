'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Booklist = mongoose.model('Booklist'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, booklist;

/**
 * Book routes tests
 */
describe('Booklist CRUD tests', function () {

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

    // Save a user to the test db and create new booklist
    user.save(function () {
      booklist = {
        title: 'Booklist Title',
        content: 'Booklist Content'
      };

      done();
    });
  });

  it('should be able to save an booklist if logged in', function (done) {
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

        // Save a new booklist
        agent.post('/api/booklists')
          .send(booklist)
          .expect(200)
          .end(function (booklistSaveErr, booklistSaveRes) {
            // Handle booklist save error
            if (booklistSaveErr) {
              return done(booklistSaveErr);
            }

            // Get a list of booklists
            agent.get('/api/booklists')
              .end(function (booklistsGetErr, booklistsGetRes) {
                // Handle booklist save error
                if (booklistsGetErr) {
                  return done(booklistsGetErr);
                }

                // Get booklists list
                var booklists = booklistsGetRes.body;

                // Set assertions
                (booklists[0].user._id).should.equal(userId);
                (booklists[0].title).should.match('Booklist Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an booklist if not logged in', function (done) {
    agent.post('/api/booklists')
      .send(booklist)
      .expect(403)
      .end(function (booklistSaveErr, booklistSaveRes) {
        // Call the assertion callback
        done(booklistSaveErr);
      });
  });

  it('should not be able to save an booklist if no title is provided', function (done) {
    // Invalidate title field
    booklist.title = '';

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
        agent.post('/api/booklists')
          .send(booklist)
          .expect(400)
          .end(function (booklistSaveErr, booklistSaveRes) {
            // Set message assertion
            (booklistSaveRes.body.message).should.match('Title cannot be blank');

            // Handle book save error
            done(booklistSaveErr);
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
        agent.post('/api/booklists')
          .send(booklist)
          .expect(200)
          .end(function (booklistSaveErr, booklistSaveRes) {
            // Handle book save error
            if (booklistSaveErr) {
              return done(booklistSaveErr);
            }

            // Update booklist title
            booklist.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing booklist
            agent.put('/api/booklists/' + booklistSaveRes.body._id)
              .send(booklist)
              .expect(200)
              .end(function (booklistUpdateErr, booklistUpdateRes) {
                // Handle book update error
                if (booklistUpdateErr) {
                  return done(booklistUpdateErr);
                }

                // Set assertions
                (booklistUpdateRes.body._id).should.equal(booklistSaveRes.body._id);
                (booklistUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of booklists if not signed in', function (done) {
    // Create new book model instance
    var booklistObj = new Booklist(booklist);

    // Save the booklist
    booklistObj.save(function () {
      // Request books
      request(app).get('/api/booklists')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single booklist if not signed in', function (done) {
    // Create new booklist model instance
    var booklistObj = new Booklist(booklist);

    // Save the booklist
    booklistObj.save(function () {
      request(app).get('/api/booklists/' + booklistObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', booklist.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single booklist with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/booklists/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Booklist is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single booklist which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent booklist
    request(app).get('/api/booklists/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No booklist with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an booklist if signed in', function (done) {
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
        agent.post('/api/booklists')
          .send(booklist)
          .expect(200)
          .end(function (booklistSaveErr, booklistSaveRes) {
            // Handle booklist save error
            if (booklistSaveErr) {
              return done(booklistSaveErr);
            }

            // Delete an existing booklist
            agent.delete('/api/booklists/' + booklistSaveRes.body._id)
              .send(booklist)
              .expect(200)
              .end(function (booklistDeleteErr, booklistDeleteRes) {
                // Handle booklist error error
                if (booklistDeleteErr) {
                  return done(booklistDeleteErr);
                }

                // Set assertions
                (booklistDeleteRes.body._id).should.equal(booklistSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an booklist if not signed in', function (done) {
    // Set booklist user
    booklist.user = user;

    // Create new booklist model instance
    var booklistObj = new Booklist(booklist);

    // Save the booklist
    booklistObj.save(function () {
      // Try deleting book
      request(app).delete('/api/booklists/' + booklistObj._id)
        .expect(403)
        .end(function (booklistDeleteErr, booklistDeleteRes) {
          // Set message assertion
          (booklistDeleteRes.body.message).should.match('User is not authorized');

          // Handle book error error
          done(booklistDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Booklist.remove().exec(done);
    });
  });
});
