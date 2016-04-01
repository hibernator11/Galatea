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
    
    $scope.numResultsCommentsReview = 10;
    $scope.numResultsCommentsGroup = 10;
    $scope.numResultsCommentsBooklist = 10;
    
    $scope.getReviewComments = function() {
      $http.get('/api/comments/reviews/results/' + $scope.numResultsCommentsReview)
      .success(function (response) {
            $scope.commentsReview = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getGroupComments = function() {
      
      $http.get('/api/comments/groups/results/' + $scope.numResultsCommentsGroup)
      .success(function (response) {
            $scope.commentsGroup = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getBooklistComments = function() {
      $http.get('/api/comments/booklists/results/' + $scope.numResultsCommentsBooklist)
      .success(function (response) {
            $scope.commentsBooklist = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };    
    
    $scope.getTotalCommentsReview = function() {
      
      $http.get('/api/comments/reviews/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsReview = response[0].total;
            $scope.newComments += $scope.totalCommentsReview;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsGroup = function() {
      
      $http.get('/api/comments/groups/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsGroup = response[0].total;
            $scope.newComments += $scope.totalCommentsGroup;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsBooklist = function() {
      
        $http.get('/api/comments/booklists/').success(function (response) {
            if(!angular.isUndefined(response[0])){
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
