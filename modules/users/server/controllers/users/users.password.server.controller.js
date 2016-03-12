'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {
      if (req.body.username) {
        User.findOne({
          username: req.body.username.toLowerCase()
        }, '-salt -password', function (err, user) {
          if (!user) {
            return res.status(400).send({
              message: 'No se ha encontrado la cuenta'
            });
          } else if (user.provider !== 'local') {
            return res.status(400).send({
              message: 'Parece que iniciaste la sesión con tu cuenta de ' + user.provider
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function (err) {
              done(err, token, user);
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'El campo de usuario no puede estar en blanco'
        });
      }
    },
    function (token, user, done) {

      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: httpTransport + req.headers.host + '/api/auth/reset/' + token
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {

      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Restablecimiento de contraseña',
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'Un email se ha enviado con las instrucciones a seguir.'
          });
        } else {
          return res.status(400).send({
            message: 'Se ha producido un error al enviar el correo'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      return res.redirect('/password/reset/invalid');
    }

    res.redirect('/password/reset/' + req.params.token);
  });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  async.waterfall([

    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!err && user) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                req.login(user, function (err) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    // Remove sensitive data before return authenticated user
                    user.password = undefined;
                    user.salt = undefined;

                    res.json(user);

                    done(err, user);
                  }
                });
              }
            });
          } else {
            return res.status(400).send({
              message: 'Las contraseñas no coinciden'
            });
          }
        } else {
          return res.status(400).send({
            message: 'Password reset token es inválido o ha expirado.'
          });
        }
      });
    },
    function (user, done) {
      res.render('modules/users/server/templates/reset-password-confirm-email', {
        name: user.displayName,
        appName: config.app.title
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Tu contraseña se ha actualizado correctamente',
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function (err, user) {
        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              user.save(function (err) {
                if (err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'Contraseña actualizada correctamente'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(400).send({
                message: 'Las contraseñas no coinciden'
              });
            }
          } else {
            res.status(400).send({
              message: 'La contraseña actual es incorrecta'
            });
          }
        } else {
          res.status(400).send({
            message: 'El usuario no se ha encontrado'
          });
        }
      });
    } else {
      res.status(400).send({
        message: 'Por favor introduzca una nueva contraseña'
      });
    }
  } else {
    res.status(400).send({
      message: 'El usuario no ha realizado login'
    });
  }
};

/**
 * Send review mail (send review POST)
 */
exports.sendReviewEmail = function (req, res, next) {
  async.waterfall([
    // Get form data
    function (done) {
        if (req.user){
            var email = req.body.email;
            var subject = req.body.subject;
            var message = req.body.message;
            var url = req.body.url;
            
            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
              httpTransport = 'https://';
            }
            res.render(path.resolve('modules/users/server/templates/send-review-email'), {
              name: req.user.displayName,
              message: message,
              appName: config.app.title,
              url: httpTransport + req.headers.host + url
            }, function (err, emailHTML) {
              done(err, emailHTML, email, subject);
            });   
        } else {
            return res.status(400).send({
              message: 'Debes registrarte para poder enviar el correo.'
            });
        }
    },
    
    // If valid email, send reset email using service
    function (emailHTML, email, subject, done) {

      var mailOptions = {
        to: email,
        from: config.mailer.from,
        subject: subject,
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'Un email se ha enviado con las instrucciones a seguir.'
          });
        } else {
          return res.status(400).send({
            message: 'Se ha producido un error al enviar el correo'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};


/**
 * Send booklist mail (send review POST)
 */
exports.sendBooklistEmail = function (req, res, next) {
  async.waterfall([
    // Get form data
    function (done) {
        if (req.user){
            var email = req.body.email;
            var subject = req.body.subject;
            var message = req.body.message;
            var url = req.body.url;
            
            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
              httpTransport = 'https://';
            }
            res.render(path.resolve('modules/users/server/templates/send-booklist-email'), {
              name: req.user.displayName,
              message: message,
              appName: config.app.title,
              url: httpTransport + req.headers.host + url
            }, function (err, emailHTML) {
              done(err, emailHTML, email, subject);
            });   
        } else {
            return res.status(400).send({
              message: 'Debes registrarte para poder enviar el correo.'
            });
        }
    },
    
    // If valid email, send reset email using service
    function (emailHTML, email, subject, done) {

      var mailOptions = {
        to: email,
        from: config.mailer.from,
        subject: subject,
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'Un email se ha enviado con las instrucciones a seguir.'
          });
        } else {
          return res.status(400).send({
            message: 'Se ha producido un error al enviar el correo'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};


/**
 * Send group mail (send review POST)
 */
exports.sendGroupEmail = function (req, res, next) {
  async.waterfall([
    // Get form data
    function (done) {
        if (req.user){
            var email = req.body.email;
            var subject = req.body.subject;
            var message = req.body.message;
            var url = req.body.url;
            
            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
              httpTransport = 'https://';
            }
            res.render(path.resolve('modules/users/server/templates/send-group-email'), {
              name: req.user.displayName,
              message: message,
              appName: config.app.title,
              url: httpTransport + req.headers.host + url
            }, function (err, emailHTML) {
              done(err, emailHTML, email, subject);
            });   
        } else {
            return res.status(400).send({
              message: 'Debes registrarte para poder enviar el correo.'
            });
        }
    },
    
    // If valid email, send reset email using service
    function (emailHTML, email, subject, done) {

      var mailOptions = {
        to: email,
        from: config.mailer.from,
        subject: subject,
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'Un email se ha enviado con las instrucciones a seguir.'
          });
        } else {
          return res.status(400).send({
            message: 'Se ha producido un error al enviar el correo'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Send generic mail (send review POST)
 */
exports.sendEmail = function (req, res, next) {
  async.waterfall([
    // Get form data
    function (done) {
        if (req.user){
            
            User.findOne({
                _id: req.body.toUserId
              }, function (err, toUser) {
                if (!toUser) {
                  return res.status(400).send({
                    message: 'No se ha encontrado el usuario'
                  });
                } else {
                    var email = toUser.email;
                    var subject = req.body.subject;
                    var message = req.body.message;
                    var url = req.body.url;

                    var httpTransport = 'http://';
                    if (config.secure && config.secure.ssl === true) {
                      httpTransport = 'https://';
                    }
                    res.render(path.resolve('modules/users/server/templates/send-email'), {
                      toName: toUser.displayName,
                      message: message,
                      appName: config.app.title,
                      url: httpTransport + req.headers.host + url
                    }, function (err, emailHTML) {
                      done(err, emailHTML, email, subject);
                    });
                }
            });
        } else {
            return res.status(400).send({
              message: 'Debes registrarte para poder enviar el correo.'
            });
        }
    },
    
    // If valid email, send reset email using service
    function (emailHTML, email, subject, done) {

      var mailOptions = {
        to: email,
        from: config.mailer.from,
        subject: subject,
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'Un email se ha enviado con las instrucciones a seguir.'
          });
        } else {
          return res.status(400).send({
            message: 'Se ha producido un error al enviar el correo'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};