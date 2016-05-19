'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  WordpressStrategy = require('passport-oauth2-complete-for-wordpress').Strategy,
  users = require('../../controllers/users.server.controller');

module.exports = function (config) {console.log('viene a strategy wordpress');
  // Use wordpress strategy
  passport.use(new WordpressStrategy({
    clientID: config.wordpress.clientID,
    clientSecret: config.wordpress.clientSecret,
    callbackURL: config.wordpress.callbackURL,
    wordpressUrl: 'http://bvmcresearch.cervantesvirtual.com',
    passReqToCallback: true
  },
  //function(accessToken, refreshToken, profile, done) {
  function (req, token, tokenSecret, profile, done) {
    // Set the provider data and include tokens
    console.log('viene a strategy wordpress:'+ profile);
    var providerData = profile._json;
    providerData.token = token;
    providerData.tokenSecret = tokenSecret;

    // Create the user OAuth profile
    var displayName = profile.displayName.trim();
    var iSpace = displayName.indexOf(' '); // index of the whitespace following the firstName
    var firstName = iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
    var lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';

    var providerUserProfile = {
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      username: profile.username,
      profileImageURL: profile.photos[0].value.replace('normal', 'bigger'),
      provider: 'wordpress',
      providerIdentifierField: 'id_str',
      providerData: providerData
    };

    // Save the user OAuth profile
    users.saveOAuthUserProfile(req, providerUserProfile, done);
  }));
};
