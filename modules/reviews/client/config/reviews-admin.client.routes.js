'use strict';

// Setting up route
angular.module('reviews.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.reviews', {
        url: '/reviews',
        templateUrl: 'modules/reviews/client/views/admin/dashboard.list-reviews.client.view.html',
        controller: 'ReviewListController'
      })
      .state('admin.review', {
        url: '/reviews/:reviewId',
        templateUrl: 'modules/reviews/client/views/admin/dashboard.view-review.client.view.html',
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
        templateUrl: 'modules/reviews/client/views/admin/dashboard.edit-review.client.view.html',
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
