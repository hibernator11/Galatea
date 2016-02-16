'use strict';

angular.module('booklists').controller('ModalConfirmCtrl', function ($scope, $modalInstance, text) {

  $scope.text = text;

  $scope.ok = function () {
    $modalInstance.close(true);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('Cancelar');
  };
});


