'use strict';

// Setting up route
angular.module('booklists').config(['$stateProvider',
  function ($stateProvider) {
    // booklists state routing
    $stateProvider
      .state('booklists', {
        abstract: true,
        url: '/booklists',
        template: '<ui-view/>'
      })
      .state('booklists.list', {
        url: '',
        templateUrl: 'modules/booklists/client/views/list-booklists.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('booklists.search', {
        url: '/search',
        templateUrl: 'modules/booklists/client/views/pagination-booklists.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('booklists.create', {
        url: '/create',
        templateUrl: 'modules/booklists/client/views/create-booklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('booklists.view', {
        url: '/:booklistId',
        templateUrl: 'modules/booklists/client/views/view-booklist.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('booklists.edit', {
        url: '/:booklistId/edit',
        templateUrl: 'modules/booklists/client/views/edit-booklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
