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
    enum : ['draft','public'],
    default: 'draft',
    required: 'El campo estado no puede ser nulo'
  },
  type: {
    type: String,
    enum : ['obra','autor','lista','general'],
    default: 'general',
    required: 'El campo tipo de grupo no puede ser nulo'
  },
  source: {
    type: String,
    default: '',
    trim: true
  },
  uuid: {
    type: String,
    default: '',
    trim: true
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo nombre no puede ser nulo'
  },
  authorName: {
    type: String,
    default: '',
    trim: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  reproduction: {
    type: String,
    default: '',
    trim: true
  },
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
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo descripción no puede ser nulo'
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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  followers: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
      type: Date,
      default: Date.now
    }
  }],
});

mongoose.model('Group', GroupSchema);