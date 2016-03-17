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
  
  if(req.booklist.user.id === req.user.id){
    booklist.title = req.body.title;
    booklist.description = req.body.description;
    booklist.tags = req.body.tags;
    booklist.books = req.body.books;
    booklist.status = req.body.status;
  }

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
  if(req.query.status){ 
    query = { status:'public' };
  }
  else if(req.user){
    query = { user:req.user };
  }
    
  var page = 1;
  if(req.query.page){
    page = req.query.page;
  }
  var per_page =10;
  
  Booklist.find(query).sort('-created').
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName').exec(function (err, booklists) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
          
                Booklist.find(query)
                .distinct('_id')
                .count(function (err, count) {
                  var result = [{
                    total : count,
                    booklists: booklists
                  }];

                  res.json(result);
                }); 
              }
            });
};

exports.addComment = function(req, res){
 
  if(req.user && req.body.message){

    var comment = {
      content: req.body.message,
      user: req.user
    };

    Booklist.update({ '_id': req.body.booklistId },
                     { $push: { 'comments': comment } }).exec(function(err, numAffected) {
                       if (err) {
                         return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                         });
                       } else {
                         res.json({ message: 'Comentario añadido correctamente' });
                       }
                     });
  }else{
    // if user is not logged in empty result
    res.json({});
  }
};

exports.addRating = function(req, res){
 
  if(req.user && req.body.rate){

    var rating = {
      rate: req.body.rate,
      user: req.user
    };

    Booklist.update({ "_id": req.body.booklistId },
                     {$push: { "ratings": rating }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Valoración añadida correctamente.'});
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
  
   /*var d = new Date();
   d.setDate(d.getDate()-7);
   
   console.log('d:' + d);
  
   Booklist.aggregate([
    { $match: {_id: mongoose.Types.ObjectId(id)}},
    { $project: {
        comments: {$filter: {
            input: "$comments",
            as: 'comment',
            cond: {$lt: ['$$comment.created', new Date(new Date().setDate(new Date().getDate()-7))]}
        }}
    }}
]).exec(function (err, result) {
    if (err) {
      return next(err);
    } else if (!result) {
      return res.status(404).send({
        message: 'No book with that identifier has been found'
      });
    }
    console.log('result:' + result[0]._id);*/
    
    Booklist.findById(id).populate('user', 'displayName')
                       .populate('comments.user', 'displayName profileImageURL')
                       .exec(function (err, booklist) {
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

  /*Booklist.findById(id).populate('user', 'displayName')
                       .populate('comments.user', 'displayName profileImageURL')
                       .exec(function (err, booklist) {
    if (err) {
      return next(err);
    } else if (!booklist) {
      return res.status(404).send({
        message: 'No book with that identifier has been found'
      });
    }
    req.booklist = booklist;
    next();
  });*/
};
