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
  
  if(req.booklist.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
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

  if(booklist.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
    booklist.remove(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(booklist);
      }
    });
  }else{
      return res.status(403).send({
          message: 'No tiene permisos para borra la lista'
      });
  }
};

/**
 * List of Booklists
 */
exports.list = function (req, res) {

    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page = 15;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=100){
        per_page = parseInt(req.query.itemsPerPage);
    }
    
    var query =  {$and: []};
    
    query.$and.push({
        status: { $ne: "blocked" }}
    );
    
    if(req.query.text){
        query.$and.push({
            $text : { $search : req.query.text }} 
        );
    }
    if(req.query.status){
        query.$and.push({
            status: 'public'} // public/draft
        );
    }
    
    var order = '-created';
    if(req.query.order && req.query.order === 'asc'){
        order = '+created';
    }
    
    Booklist.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, booklists) {
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

/**
* Paginate List booklists by user
**/
exports.listByUser = function(req, res){
 
var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page = 15;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=100){
        per_page = parseInt(req.query.itemsPerPage);
    }
    
    var query = {$and: []};
    query.$and.push({
        user: req.user}
    );
    
    query.$and.push({
        status: { $ne: "blocked" }}
    );
    
    if(req.query.text){
        query.$and.push({
            $text : { $search : req.query.text }} 
        );
    }
    if(req.query.status){
        query.$and.push({
            status: req.query.status} // public/draft
        );
    }
    
    var order = '-created';
    if(req.query.order && req.query.order === 'asc'){
        order = '+created';
    }
    
    Booklist.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, booklists) {
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

/**
* count new booklists
**/
exports.countNewBooklists = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Booklist.aggregate(
      { $match: {'created': {$gt: d}, 'status': 'public'}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, newBooklists) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(newBooklists);
        }
    });
};

/**
* count comments Booklist
**/
exports.countComments = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Booklist.aggregate(
      { $match: {'comments.created': {$gt: d}}},
      { $unwind : "$comments" },
      { $match: {'comments.created': {$gt: d}}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, totalComments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(totalComments);
        }
    });
};

/**
* comments Booklist
**/
exports.getComments = function(req, res){
 
    var limit = 10;
    
    if(req.params.results){
        limit = req.params.results;
    }
    var d = new Date();
    d.setDate(d.getDate()-7);

    Booklist.aggregate(
      { $match: {'comments.created': {$gt: d}}},
      { $project : { _id: 1, title : 1 , comments : 1 } },
      { $unwind : "$comments" },
      { $match: {'comments.created': {$gt: d}}},
      { $group : {
          _id: { comment: "$comments", title: "$title", booklistId: "$_id"}
      } },
      //{ $lookup: {from: 'users', localField: 'user', foreignField: 'id', as: 'user_info'} } ,
      { $sort : { '_id.comment.created' : -1 } },
      { $limit : limit*1 })
    .exec(function(err, comments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comments);
        }
    });
};

exports.addComment = function(req, res){
 
  if(req.user && req.body.message){

    var comment = {
      content: req.body.message,
      user: req.user,
      created: new Date()
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

exports.removeComment = function(req, res){
 
    if(req.user && req.body.commentId){

        Booklist.update({ "_id": req.body.booklistId, "user":req.user },
                     {$pull: { "comments": {'_id': req.body.commentId} }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario eliminado correctamente.'});
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
            message: 'La lista de obras no es correcta'
        });
    }
  
    Booklist.findById(id).populate('user', 'displayName profileImageURL')
                       .populate('comments.user', 'displayName profileImageURL')
                       .exec(function (err, booklist) {
    if (err) {
      return next(err);
    } else if (!booklist) {
      return res.status(404).send({
        message: 'No se ha encontrado ninguna lsita de obras con el identificador recibido'
      });
    } else if (booklist.status === 'blocked' && (req.user === undefined || req.user === null || req.user.roles.indexOf("admin") <= 0)) {
        
      return res.status(403).send({
        message: 'La lista de obras se encuentra bloqueada por el administrador'
      });
    }
    req.booklist = booklist;

    next();
   });
};
