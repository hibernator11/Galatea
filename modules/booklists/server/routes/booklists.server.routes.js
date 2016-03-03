'use strict';

/**
 * Module dependencies.
 */
var booklistsPolicy = require('../policies/booklists.server.policy'),
  booklists = require('../controllers/booklists.server.controller');

module.exports = function (app) {
  // Booklists collection routes
  app.route('/api/booklists').all(booklistsPolicy.isAllowed)
    .get(booklists.list)
    .post(booklists.create);
    
  // Booklists add comment
  app.route('/api/booklists/addComment').all(booklistsPolicy.isAllowed)
    .post(booklists.addComment);

  // Single booklist routes
  app.route('/api/booklists/:booklistId').all(booklistsPolicy.isAllowed)
    .get(booklists.read)
    .put(booklists.update)
    .delete(booklists.delete);
    
  // Finish by binding the booklist middleware
  app.param('booklistId', booklists.booklistByID);
};
