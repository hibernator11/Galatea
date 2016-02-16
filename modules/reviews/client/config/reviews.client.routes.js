'use strict';

// Setting up route
angular.module('reviews').config(['$stateProvider',
  function ($stateProvider) {
    // reviews state routing
    $stateProvider
      .state('reviews', {
        abstract: true,
        url: '/reviews',
        template: '<ui-view/>'
      })
      .state('reviews.list', {
        url: '',
        templateUrl: 'modules/reviews/client/views/list-reviews.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.search', {
        url: '/search',
        templateUrl: 'modules/reviews/client/views/pagination-reviews.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.uuid', {
        url: '/uuid/:uuid',
        templateUrl: 'modules/reviews/client/views/list-reviews-uuid.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.create', {
        url: '/create',
        templateUrl: 'modules/reviews/client/views/create-review.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.view', {
        url: '/:reviewId',
        templateUrl: 'modules/reviews/client/views/view-review.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.edit', {
        url: '/:reviewId/edit',
        templateUrl: 'modules/reviews/client/views/edit-review.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
