'use strict';

// Setting up route
angular.module('publications').config(['$stateProvider',
  function ($stateProvider) {
    // publications state routing
    $stateProvider
      .state('publications', {
        abstract: true,
        url: '/publications',
        template: '<ui-view/>'
      })
      .state('publications.list', {
        url: '',
        templateUrl: 'modules/publications/client/views/list-publications.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.search', {
        url: '/search',
        templateUrl: 'modules/publications/client/views/pagination-publications.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.create', {
        url: '/create',
        templateUrl: 'modules/publications/client/views/create-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.view', {
        url: '/:publicationId',
        templateUrl: 'modules/publications/client/views/view-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.edit', {
        url: '/:publicationId/edit',
        templateUrl: 'modules/publications/client/views/edit-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
