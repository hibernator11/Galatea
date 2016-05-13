'use strict';

/**
 * Module dependencies.
 */
var publicationsPolicy = require('../policies/publications.server.policy'),
  publications = require('../controllers/publications.server.controller');

module.exports = function (app) {
  // Publications collection routes
  app.route('/api/publications').all(publicationsPolicy.isAllowed)
    .get(publications.list)
    .post(publications.create);
    
  // Publications news count
  app.route('/api/publications/news/count').all(publicationsPolicy.isAllowed)
     .get(publications.countNewPublications);
     
  // Publications count
  app.route('/api/publications/count')
    .get(publicationsPolicy.isAllowed, publications.countPublications);   
     
  // Publications comments paginate
  app.route('/api/comments/publications/results/:results').all(publicationsPolicy.isAllowed)
     .get(publications.getComments);
     
  // Publications comments total
  app.route('/api/comments/publications').all(publicationsPolicy.isAllowed)
     .get(publications.countComments);   

  // Publications by user paginate
  app.route('/api/publications/user').all(publicationsPolicy.isAllowed)
     .get(publications.listByUser);
     
  // Publications add comment
  app.route('/api/publications/addRating').all(publicationsPolicy.isAllowed)
    .post(publications.addRating);

  // Publications add comment
  app.route('/api/publications/addComment').all(publicationsPolicy.isAllowed)
    .post(publications.addComment);
  app.route('/api/publications/removeComment').all(publicationsPolicy.isAllowed)
     .post(publications.removeComment);

  // Single publication routes
  app.route('/api/publications/:publicationId').all(publicationsPolicy.isAllowed)
    .get(publications.read)
    .put(publications.update)
    .delete(publications.delete);
    
  // Finish by binding the publication middleware
  app.param('publicationId', publications.publicationByID);
};
