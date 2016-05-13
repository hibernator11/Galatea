'use strict';

// Setting up route
angular.module('publications.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.publications', {
        url: '/publications',
        templateUrl: 'modules/publications/client/views/admin/dashboard.list-publications.client.view.html',
        controller: 'PublicationListController'
      })
      .state('admin.publication', {
        url: '/publications/:publicationId',
        templateUrl: 'modules/publications/client/views/admin/dashboard.view-publication.client.view.html',
        controller: 'PublicationAdminController',
        resolve: {
          publicationResolve: ['$stateParams', 'Publications', function ($stateParams, Publications) {
            return Publications.get({
              publicationId: $stateParams.publicationId
            });
          }]
        }
      })
      .state('admin.publication-edit', {
        url: '/publications/:publicationId/edit',
        templateUrl: 'modules/publications/client/views/admin/dashboard.edit-publication.client.view.html',
        controller: 'PublicationAdminController',
        resolve: {
          publicationResolve: ['$stateParams', 'Publications', function ($stateParams, Publications) {
            return Publications.get({
              publicationId: $stateParams.publicationId
            });
          }]
        }
      });
  }
]);
