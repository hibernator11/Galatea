'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Publication = mongoose.model('Publication'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  
/**
 * Create a publication
 */
exports.create = function (req, res) {
    var ObjectId = require('mongoose').Types.ObjectId; 
    
    Publication.aggregate(
      { $match: {'user': new ObjectId(req.user._id)}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, userPublications) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            //console.log('total:' + userPublications[0].total);
            console.log('length:' + userPublications.length);
            
            // if there is no publication or less than 5
            if(userPublications.length === 0 || userPublications[0].total < config.uploads.publicationUpload.maxFilesPerUser){
            
                var options = multer.diskStorage({ destination : config.uploads.publicationUpload.dest + req.user._id ,
                  filename: function (req, file, cb) {
                    cb(null, (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now() + path.extname(file.originalname));
                  }
                });

                var multerUpload= multer({ storage: options,
                                           limits: { fileSize: config.uploads.publicationUpload.limits.fileSize }});
                var upload = multerUpload.single('newPublication');

                var publicationUploadFileFilter = require(path.resolve('./config/lib/multer')).publicationsUploadFileFilter;

                // Filtering to upload only pdf
                upload.fileFilter = publicationUploadFileFilter;

                upload(req, res, function (uploadError) {
                  if(uploadError) {
                    return res.status(400).send({
                      message: 'Se ha producido un error actualizando la publicación. El límite por archivo es de ' + 
                              config.uploads.publicationUpload.limits.fileSize/1000000   + ' MB.'
                    });
                  } else {

                    console.log('create server req.file.filename:' + req.file.filename);
                    var publication = new Publication(req.body);
                    publication.user = req.user;

                    console.log('req.file.mimetype:'+ req.file.mimetype);
                    console.log("file originalName:" + req.file.originalname);

                    publication.url = config.uploads.publicationUpload.dest.substring(1) + req.user._id + '/' + req.file.filename;

                    console.log(publication.url);

                    publication.save(function (err) {
                        if (err) {
                          return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                          });
                        } else {
                          res.json(publication);
                        }
                    });
                  }
                });
            }else{
                return res.status(400).send({
                    message: "Ya ha creado 5 publicaciones. No puede crear más de 5 publicaciones."
                  });
            }
        }
    });
};

/**
 * Show the current publication
 */
exports.read = function (req, res) {
  res.json(req.publication);
};

/**
 * Update a publication
 */
exports.update = function (req, res) {
  var publication = req.publication;

  if(req.publication.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
      publication.title = req.body.title;
      publication.content = req.body.content;
      publication.status = req.body.status;
      publication.tags = req.body.tags;
  }

  publication.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(publication);
    }
  });
};

/**
 * Delete a publication
 */
exports.delete = function (req, res) {
  var publication = req.publication;

  if(publication.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
    publication.remove(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(publication);
      }
    });
  }else{
      return res.status(403).send({
          message: 'No tiene permisos para eliminar la publicación'
      });
  }
};

/**
 * List of Publications
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
    
    var query = {$and: []};
    
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
    
    Publication.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, publications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Publication.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = [{
                 total : count,
                 publications: publications
              }];

              res.json(result);
        }); 
      }
    });
};

/**
* Paginate List publications by user
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
    
    Publication.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName').exec(function (err, publications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Publication.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = [{
                 total : count,
                 publications: publications
              }];

              res.json(result);
        }); 
      }
    });
};

/**
* count new publications
**/
exports.countNewPublications = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Publication.aggregate(
      { $match: {'created': {$gt: d}, 'status': 'public'}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, newPublications) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(newPublications);
        }
    });
};

/**
* count publications
**/
exports.countPublications = function(req, res){
 
    Publication.aggregate(
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, publications) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(publications);
        }
    });
};

/**
* count comments publication
**/
exports.countComments = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Publication.aggregate(
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
* comments publication
**/
exports.getComments = function(req, res){
    var limit = 10;
    
    if(req.params.results){
        limit = req.params.results;
    }
    
    var d = new Date();
    d.setDate(d.getDate()-7);

    Publication.aggregate(
      { $match: { $and: [{'comments.created': {$gt: d}}, 
                         {'status': 'public'}]
                }
      },
      { $project : { _id: 1, title : 1 , comments : 1, user: 1 } },
      { $unwind : "$comments" },
      { $match: {'comments.created': {$gt: d}}},
      { $group : {
          _id: { comment: "$comments", title: "$title", publicationId: "$_id", user: "$user"}
      } },
      { $lookup: {from: 'users', localField: '_id.comment.user', foreignField: '_id', as: 'user_info'} } ,
      { $project : { _id: 1, title : 1 , comments : 1, user: 1, 'user_info.displayName':1, 'user_info.profileImageURL':1 } },
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

/**
* add comment group
**/
exports.addComment = function(req, res){
 
    if(req.user && req.body.message){

        var comment = {
            content: req.body.message,
            user: req.user,
            created: new Date()
        };

        Publication.update({ "_id": req.body.publicationId },
                     {$push: { "comments": comment }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario añadido correctamente.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.removeComment = function(req, res){
 
    if(req.user && req.body.commentId){

        Publication.update({ "_id": req.body.publicationId, "user":req.user },
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

        Publication.update({ "_id": req.body.publicationId },
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
 * Publication middleware
 */
exports.publicationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'La publicación no es correcta'
    });
  }

  Publication.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, publication) {
    if (err) {
      return next(err);
    } else if (!publication) {
      return res.status(404).send({
        message: 'No se ha encontrado ninguna publicación con el identificador recibido'
      });
    } else if (publication.status === "blocked" && (req.user === undefined || req.user === null || req.user.roles.indexOf("admin") <= 0)) {
      return res.status(403).send({
        message: 'La publicación se encuentra bloqueada por el administrador'
      });
    }
    req.publication = publication;
    next();
  });
};
