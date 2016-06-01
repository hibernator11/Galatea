'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  express = require('express'),
  morgan = require('morgan'),
  logger = require('./logger'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  favicon = require('serve-favicon'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  flash = require('connect-flash'),
  consolidate = require('consolidate'),
  mongoose = require('mongoose'),
  path = require('path');
  
  

  
/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  if (config.secure && config.secure.ssl === true) {
    app.locals.secure = config.secure.ssl;
  }
  app.locals.keywords = config.app.keywords;
  app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
  app.locals.facebookAppId = config.facebook.clientID;
  app.locals.jsFiles = config.files.client.js;
  app.locals.cssFiles = config.files.client.css;
  app.locals.livereload = config.livereload;
  app.locals.logo = config.logo;
  app.locals.favicon = config.favicon;
  
    // This code happens just after app.locals variables are set.
    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        
        // Let's check user-agents to see if this is a social bot. If so, let's serve a different layout to populate the og data so it looks pretty when sharing.
        if( req.headers['user-agent'] === 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' ||
            req.headers['user-agent'] === 'facebookexternalhit/1.0 (+http://www.facebook.com/externalhit_uatext.php)' ||
            req.headers['user-agent'] === 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)' ||
            req.headers['user-agent'] === 'facebookexternalhit/1.0 (+https://www.facebook.com/externalhit_uatext.php)' ||
            req.headers['user-agent'] === 'visionutils/0.2' ||
            req.headers['user-agent'] === 'Twitterbot/1.0' ||
            req.headers['user-agent'] === 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1 +http://www.linkedin.com)' ||
            req.headers['user-agent'] === 'Mozilla/5.0 (Windows NT 6.1; rv:6.0) Gecko/20110814 Firefox/6.0 Google (+https://developers.google.com/+/web/snippet/)' ||
            req.headers['user-agent'] === 'Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)') {

            var urlArray = req.url.substr(1).split('/');
            var module = urlArray[0];
            var id = urlArray[1];
            
            if('reviews' === module){  
                
                var Review = mongoose.model('Review');
                Review.findById(id).populate('user', 'displayName').exec(function(err, review) {
                    if(err) {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    } else if (review !== null) {
                        
                        var uuidPath = review.uuid.replace(/-/g, '').match(/.{1,3}/g).join("/"); 
                        // Found link. Populate data.
                        res.status(200).render('modules/core/server/views/social-layout', {

                            socialUrl: req.protocol + '://' + req.headers.host + req.url,
                            socialTitle: review.title,
                            socialDescription: 'Reseña realizada en Galatea por ' + review.user.displayName,
                            socialImageUrl: "http://media.cervantesvirtual.com/s3/BVMC_OBRAS/" + uuidPath + "/portada/Cover.jpg",
                            socialType: 'article'
                        });
                    } else {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    }
                });    
            }
            else if('groups' === module){  
                
                var Group = mongoose.model('Group');
                var ObjectId = require('mongoose').Types.ObjectId; 
                
                Group.findOne({ _id: new ObjectId(id) }, function(err, group) {
                    if(err) {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    } else if (group !== null) {
                        
                        // Found link. Populate data.
                        res.status(200).render('modules/core/server/views/social-layout', {

                            // Now we update layout variables with DB info.
                            socialUrl: req.protocol + '://' + req.headers.host + req.url,
                            socialTitle: group.name,
                            socialDescription: 'Grupo creado en Galatea por ' + group.user.displayName,
                            //socialImageUrl: req.protocol + '://' + req.headers.host + '/modules/core/client/img/brand/fondo_bvmc_social_gris_rojo.png',
                            socialType: 'website'
                        });
                    } else {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    }
                });    
            }
            else if('booklists' === module){  
                
                var Booklist = mongoose.model('Booklist');
                var ObjectId = require('mongoose').Types.ObjectId; 
                
                Booklist.findOne({ _id: new ObjectId(id) }, function(err, booklist) {
                    if(err) {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    } else if (booklist !== null) {
                        
                        // Found link. Populate data.
                        res.status(200).render('modules/core/server/views/social-layout', {

                            // Now we update layout variables with DB info.
                            socialUrl: req.protocol + '://' + req.headers.host + req.url,
                            socialTitle: booklist.title,
                            socialDescription: 'Lista de obras creado en Galatea por ' + booklist.user.displayName,
                            //socialImageUrl: req.protocol + '://' + req.headers.host + '/modules/core/client/img/brand/fondo_bvmc_social_gris_rojo.png',
                            socialType: 'website'
                        });
                    } else {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    }
                });    
            }
            else if('publications' === module){  
                
                var Publication = mongoose.model('Publication');
                var ObjectId = require('mongoose').Types.ObjectId; 
                
                Publication.findOne({ _id: new ObjectId(id) }, function(err, publication) {
                    if(err) {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    } else if (publication !== null) {
                        
                        // Found link. Populate data.
                        res.status(200).render('modules/core/server/views/social-layout', {

                            // Now we update layout variables with DB info.
                            socialUrl: req.protocol + '://' + req.headers.host + req.url,
                            socialTitle: publication.title,
                            socialDescription: 'Publicación creada en Galatea por ' + publication.user.displayName,
                            //socialImageUrl: req.protocol + '://' + req.headers.host + '/modules/core/client/img/brand/fondo_bvmc_social_gris_rojo.png',
                            socialType: 'book'
                        });
                    } else {
                        res.locals.url = req.protocol + '://' + req.headers.host;
                        next();
                    }
                });    
            }
        } else {
            res.locals.url = req.protocol + '://' + req.headers.host;
            next();
        }
    });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Initialize favicon middleware
  app.use(favicon(app.locals.favicon));

  // Enable logger (morgan)
  app.use(morgan(logger.getFormat(), logger.getOptions()));

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // Add the cookie parser and flash middleware
  app.use(cookieParser());
  app.use(flash());
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
  // Set swig as the template engine
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'server.view.html');
  app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app, db) {
  // Express MongoDB session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      secure: config.sessionCookie.secure && config.secure.ssl
    },
    key: config.sessionKey,
    store: new MongoStore({
      mongooseConnection: db.connection,
      collection: config.sessionCollection
    })
  }));
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app, db) {
  config.files.server.configs.forEach(function (configPath) {
    require(path.resolve(configPath))(app, db);
  });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
  // Use helmet to secure Express headers
  var SIX_MONTHS = 15778476000;
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function (app) {
  // Setting the app router and static folder
  app.use('/', express.static(path.resolve('./public')));

  // Globbing static routing
  config.folders.client.forEach(function (staticPath) {
    app.use(staticPath, express.static(path.resolve('./' + staticPath)));
  });
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
  // Globbing policy files
  config.files.server.policies.forEach(function (policyPath) {
    require(path.resolve(policyPath)).invokeRolesPolicies();
  });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
  // Globbing routing files
  config.files.server.routes.forEach(function (routePath) {
    require(path.resolve(routePath))(app);
  });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
  app.use(function (err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Redirect to error page
    res.redirect('/server-error');
  });
};

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = function (app, db) {
  // Load the Socket.io configuration
  var server = require('./socket.io')(app, db);

  // Return server object
  return server;
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
  // Initialize express app
  var app = express();

  // Initialize local variables
  this.initLocalVariables(app);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express view engine
  this.initViewEngine(app);
  
  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules static client routes, before session!
  this.initModulesClientRoutes(app);

  // Initialize Express session
  this.initSession(app, db);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize modules server authorization policies
  this.initModulesServerPolicies(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);
  
  // Configure Socket.io
  app = this.configureSocketIO(app, db);
  
  return app;
};
