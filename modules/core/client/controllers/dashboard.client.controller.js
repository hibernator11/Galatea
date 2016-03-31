'use strict';

angular.module('core').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', 'Menus',
  function ($scope, $state, $http, Authentication, Menus) {
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
    
    $scope.newComments = 0;
    $scope.totalCommentsReview = 0;
    $scope.totalCommentsGroup = 0;
    $scope.totalCommentsBooklist = 0;
    
    $scope.getReviewComments = function() {
      
      $http.get('api/reviews/comments/').success(function (response) {
            console.log('comments Review:' + response);
            $scope.commentsReview = response;
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getGroupComments = function() {
      
      $http.get('api/groups/comments/').success(function (response) {
            console.log('comments Group:' + response);
            $scope.commentsGroup = response;
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getBooklistComments = function() {
      
      $http.get('api/booklists/comments/').success(function (response) {
            console.log('comments Booklist:' + response);
            $scope.commentsBooklist = response;
        }).error(function (response) {
            $scope.error = response.message;
      });
    };    
    
    $scope.getTotalCommentsReview = function() {
      
      $http.get('/api/reviews/comments/total').success(function (response) {
          if(!angular.isUndefined(response[0])){
            console.log('comments Review total:' + response[0].total);
            $scope.totalCommentsReview = response[0].total;
            $scope.newComments += $scope.totalCommentsReview;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsGroup = function() {
      
      $http.get('/api/groups/comments/total').success(function (response) {
          if(!angular.isUndefined(response[0])){
            console.log('comments Group total:' + response);
            $scope.totalCommentsGroup = response[0].total;
            $scope.newComments += $scope.totalCommentsGroup;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsBooklist = function() {
      
        $http.get('/api/booklists/comments/total').success(function (response) {
            if(!angular.isUndefined(response[0])){
                console.log('comments Booklist total:' + response[0].total);
                $scope.totalCommentsBooklist = response[0].total;
                $scope.newComments += $scope.totalCommentsBooklist;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getTotalComments = function() {
        $scope.getTotalCommentsReview();
        $scope.getTotalCommentsBooklist();
        $scope.getTotalCommentsGroup();
    }
    
    //call method
    $scope.getTotalComments();
  }
]);
