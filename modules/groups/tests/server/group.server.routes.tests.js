'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Group = mongoose.model('Group'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, group;

/**
 * Book routes tests
 */
describe('Group CRUD tests', function () {

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

    // Save a user to the test db and create new group
    user.save(function () {
      group = {
        title: 'Group Title',
        content: 'Group Content'
      };

      done();
    });
  });

  it('should be able to save an group if logged in', function (done) {
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

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Get a list of groups
            agent.get('/api/groups')
              .end(function (groupsGetErr, groupsGetRes) {
                // Handle group save error
                if (groupsGetErr) {
                  return done(groupsGetErr);
                }

                // Get groups list
                var groups = groupsGetRes.body;

                // Set assertions
                (groups[0].user._id).should.equal(userId);
                (groups[0].title).should.match('Group Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an group if not logged in', function (done) {
    agent.post('/api/groups')
      .send(group)
      .expect(403)
      .end(function (groupSaveErr, groupSaveRes) {
        // Call the assertion callback
        done(groupSaveErr);
      });
  });

  it('should not be able to save an group if no title is provided', function (done) {
    // Invalidate title field
    group.title = '';

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
        agent.post('/api/groups')
          .send(group)
          .expect(400)
          .end(function (groupSaveErr, groupSaveRes) {
            // Set message assertion
            (groupSaveRes.body.message).should.match('Title cannot be blank');

            // Handle book save error
            done(groupSaveErr);
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
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle book save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Update group title
            group.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing group
            agent.put('/api/groups/' + groupSaveRes.body._id)
              .send(group)
              .expect(200)
              .end(function (groupUpdateErr, groupUpdateRes) {
                // Handle book update error
                if (groupUpdateErr) {
                  return done(groupUpdateErr);
                }

                // Set assertions
                (groupUpdateRes.body._id).should.equal(groupSaveRes.body._id);
                (groupUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of groups if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Request books
      request(app).get('/api/groups')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single group if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      request(app).get('/api/groups/' + groupObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', group.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single group with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/groups/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Group is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single group which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent group
    request(app).get('/api/groups/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No group with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an group if signed in', function (done) {
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
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Delete an existing group
            agent.delete('/api/groups/' + groupSaveRes.body._id)
              .send(group)
              .expect(200)
              .end(function (groupDeleteErr, groupDeleteRes) {
                // Handle group error error
                if (groupDeleteErr) {
                  return done(groupDeleteErr);
                }

                // Set assertions
                (groupDeleteRes.body._id).should.equal(groupSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an group if not signed in', function (done) {
    // Set group user
    group.user = user;

    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Try deleting book
      request(app).delete('/api/groups/' + groupObj._id)
        .expect(403)
        .end(function (groupDeleteErr, groupDeleteRes) {
          // Set message assertion
          (groupDeleteRes.body.message).should.match('User is not authorized');

          // Handle book error error
          done(groupDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Group.remove().exec(done);
    });
  });
});
