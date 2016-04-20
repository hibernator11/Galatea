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
    enum : ['draft','public','blocked'],
    default: 'draft',
    required: 'El campo estado no puede ser nulo'
  },
  type: {
    type: String,
    enum : ['obra','autor','lista','tema'],
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
    required: 'El campo nombre no puede ser nulo',
    index: true
  },
  themeName: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  authorName: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  title: {
    type: String,
    default: '',
    trim: true,
    index: true
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
    language: String,
    authors: String,
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
    },
    status: {
        type: String,
        enum : ['hidden','public','private'],
        default: 'public',
        required: 'El campo status no puede ser nulo'
    },
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  members: [{
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
      enum : ['invitado','pendiente','activo','inactivo'],
      default: 'pendiente',
      required: 'El campo estado no puede ser nulo'
      },
  }],
});

mongoose.model('Group', GroupSchema);
