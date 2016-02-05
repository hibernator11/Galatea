'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booklist = mongoose.model('Booklist'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a booklist
 */
exports.create = function (req, res) {
  var booklist = new Booklist(req.body);
  booklist.user = req.user;

  booklist.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booklist);
    }
  });
};

/**
 * Show the current booklist
 */
exports.read = function (req, res) {
  res.json(req.booklist);
};

/**
 * Update a booklist
 */
exports.update = function (req, res) {
  var booklist = req.booklist;

  booklist.title = req.body.title;
  booklist.comments = req.body.comments;
  booklist.tags = req.body.tags;
  booklist.books = req.body.books;
  booklist.visible = req.body.visible;

  booklist.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booklist);
    }
  });
};

/**
 * Delete an booklist
 */
exports.delete = function (req, res) {
  var booklist = req.booklist;

  booklist.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booklist);
    }
  });
};

/**
 * List of Booklists
 */
exports.list = function (req, res) {

  var query = '';
  if(req.user){
    query = {user:req.user};

    Booklist.find(query).sort('-created').populate('user', 'displayName').exec(function (err, booklists) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(booklists);
      }
    });
  }else{
    // if user is not logged in empty result
    res.json({});
  }
};

//query = {books: {$elemMatch: {uuid: req.params.uuid}}};console.log(query);

/**
* Paginate List booklist
**/
exports.booklistPaginate = function(req, res){
 
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var per_page =10;

    var query = '';
    if(req.user){
        query = {user:req.user};

        Booklist.find(query).sort('-created').skip((page-1)*per_page).limit(per_page).populate('user', 'displayName').exec(function(err, booklists) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(booklists);
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};


/**
 * Book middleware
 */
exports.booklistByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Booklist is invalid'
    });
  }

  Booklist.findById(id).populate('user', 'displayName').exec(function (err, booklist) {
    if (err) {
      return next(err);
    } else if (!booklist) {
      return res.status(404).send({
        message: 'No book with that identifier has been found'
      });
    }
    req.booklist = booklist;
    next();
  });
};
