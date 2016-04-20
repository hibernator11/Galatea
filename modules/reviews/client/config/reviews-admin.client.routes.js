'use strict';

// Setting up route
angular.module('reviews.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.reviews', {
        url: '/reviews',
        templateUrl: 'modules/core/client/views/admin/reviews/dashboard.reviews.client.view.html',
        controller: 'ReviewListController'
      })
      .state('admin.review', {
        url: '/reviews/:reviewId',
        templateUrl: 'modules/core/client/views/admin/reviews/dashboard.view-review.client.view.html',
        controller: 'ReviewAdminController',
        resolve: {
          reviewResolve: ['$stateParams', 'Reviews', function ($stateParams, Reviews) {
            return Reviews.get({
              reviewId: $stateParams.reviewId
            });
          }]
        }
      })
      .state('admin.review-edit', {
        url: '/reviews/:reviewId/edit',
        templateUrl: 'modules/core/client/views/admin/reviews/dashboard.edit-review.client.view.html',
        controller: 'ReviewAdminController',
        resolve: {
          reviewResolve: ['$stateParams', 'Reviews', function ($stateParams, Reviews) {
            return Reviews.get({
              reviewId: $stateParams.reviewId
            });
          }]
        }
      });
  }
]);
