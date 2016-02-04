'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'draft',
    trim: true,
    required: 'El campo estado no puede ser nulo'
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo título no puede ser nulo'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo contenido no puede ser nulo'
  },
  comments: [{
    content: String,
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
      type: Date,
      default: Date.now
    }
  }],
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
  identifierWork: {
    type: String,
  },
  uuid: {
    type: String,
  },
  slug: {
    type: String,
  },
  reproduction:{
    type: String,
  },
  mediaType: {
    type: String,
  },
  language: {
    type: String,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Group', GroupSchema);
