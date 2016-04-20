'use strict';

//Booklists service used for communicating with the booklists REST endpoints
angular.module('booklists').factory('Booklists', ['$resource',
  function ($resource) {
    return $resource('api/booklists/:booklistId', {
      booklistId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Booklists service
angular.module('booklists.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/booklists/:booklistId', {
      booklistId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


angular.module('booklists').service('ConfirmService', function($modal) {
  var service = {};
  service.open = function (text, onOk) {
    var modalInstance = $modal.open({
      templateUrl: '/modules/booklists/client/views/confirm.template.html',
      controller: 'ModalConfirmCtrl',
      resolve: {
        text: function () {
          return text;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      onOk();
    }, function () {
    });
  };
  
  return service;
});
