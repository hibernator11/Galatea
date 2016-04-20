'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum : ['draft','public','blocked'],
    default: 'draft',
    required: 'El campo estado no puede ser nulo'
  },  
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo título no puede ser nulo',
    index: true
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
    },
    status: {
        type: String,
        enum : ['hidden','public','private'],
        default: 'public',
        required: 'El campo status no puede ser nulo'
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
    index: true
  },
  mediaType: {
    type: String,
    index: true
  },
  language: {
    type: String,
  },
  authors: {
    type: String,
    index: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Review', ReviewSchema);
