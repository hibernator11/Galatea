'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Reviews',
  function ($scope, Authentication, Reviews) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

  }
]);
