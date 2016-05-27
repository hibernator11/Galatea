'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    
    $scope.showPublicationMenu = function () {
        
        if($scope.authentication.user)
            if($scope.authentication.user.provider === 'wordpress-oauth-server' || 
                ($scope.authentication.user.additionalProvidersData.length > 0 &&    
                $scope.authentication.user.additionalProvidersData.indexOf('wordpress-oauth-server') >= 0) || 
                ($scope.authentication.user.roles.indexOf('admin') >= 0)) {
                return true;
            }
        return false;
    }
  }
]);
