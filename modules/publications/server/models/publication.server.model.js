'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Publication Schema
 */
var PublicationSchema = new Schema({
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
  url: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo url no puede ser nulo'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'El campo contenido no puede ser nulo'
  },
  tags: [{
    name: String,
    identifierSubject: String,
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
  }
});

mongoose.model('Publication', PublicationSchema);
