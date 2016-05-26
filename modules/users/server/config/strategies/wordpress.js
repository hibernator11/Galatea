'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  WordpressStrategy = require('passport-wordpress-oauth-server').Strategy,

  users = require('../../controllers/users.server.controller');

module.exports = function (config) {
  
    passport.use(new WordpressStrategy({
        clientID: config.wordpress.clientID,
        clientSecret: config.wordpress.clientSecret,
        wordpressUrl: config.wordpress.wordpressUrl,
        callbackURL: config.wordpress.callbackURL,
        passReqToCallback: true
      },
      function(req, accessToken, refreshToken, profile, done) {
        var providerData = profile._json;
        providerData.accessToken = accessToken;
        providerData.refreshToken = refreshToken;
        providerData.id = profile.id;
        
        var json = JSON.parse(profile._raw);

        // Create the user OAuth profile
        var providerUserProfile = {
          firstName: json.user_nicename,
          //lastName: profile.name.familyName,
          displayName: profile.displayName,
          //email: profile.emails ? profile.emails[0].value : undefined,
          email: json.user_email,
          username: json.user_login,
          profileImageURL: (json.picture) ? json.picture : undefined,
          provider: profile.provider,
          providerIdentifierField: 'id',
          providerData: providerData
        };

        // Save the user OAuth profile
        users.saveOAuthUserProfile(req, providerUserProfile, done); 
      }
    ));
};
