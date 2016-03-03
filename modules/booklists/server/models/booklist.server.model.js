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
  description: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum : ['draft','public'],
    default: 'draft',
    required: 'El campo estado no puede ser nulo'
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
    language: String,
    authors: String
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  ratings: [{
    rate: Number,
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    content: String,
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
      type: Date,
      default: Date.now
    },
    status: {
        type: String,
        enum : ['hidden','public','private'],
        default: 'public',
        required: 'El campo status no puede ser nulo'
    },
  }],
});

mongoose.model('Booklist', BooklistSchema);
