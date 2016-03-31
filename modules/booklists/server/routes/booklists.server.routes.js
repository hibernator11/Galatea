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
    
  // Booklists comments paginate
  app.route('/api/booklists/comments/').all(booklistsPolicy.isAllowed)
     .get(booklists.getComments);
     
  // Booklists comments total
  app.route('/api/booklists/comments/total').all(booklistsPolicy.isAllowed)
     .get(booklists.countComments);  
    
  // Booklists add comment
  app.route('/api/booklists/addComment').all(booklistsPolicy.isAllowed)
    .post(booklists.addComment);
  app.route('/api/booklists/removeComment').all(booklistsPolicy.isAllowed)
     .post(booklists.removeComment);    
    
  // Booklists add rating
  app.route('/api/booklists/addRating').all(booklistsPolicy.isAllowed)
    .post(booklists.addRating);

  // Single booklist routes
  app.route('/api/booklists/:booklistId').all(booklistsPolicy.isAllowed)
    .get(booklists.read)
    .put(booklists.update)
    .delete(booklists.delete);
    
  // Finish by binding the booklist middleware
  app.param('booklistId', booklists.booklistByID);
};
