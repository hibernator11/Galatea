'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Booklist Schema
 */
var BooklistSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo título no puede ser nulo'
  },
  comments: {
    type: String,
    default: '',
    trim: true
  },
  visible: {
    type: Boolean,
    default: '',
    trim: true
  },
  tags: [{
    name: String,
    identifierSubject: String,
  }],
  books: [{
    title: String,
    identifierWork: String,
    comments: String,
    uuid: String,
    slug: String,
    reproduction: String,
    mediaType: String,
    language: String
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Booklist', BooklistSchema);
