'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    
    $scope.numResultsCommentsReview = 3;
    $scope.numResultsCommentsGroup = 3;
    $scope.numResultsCommentsBooklist = 3;
    
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
    
    $scope.init = function() {
      $scope.getReviewComments();
      //$scope.getBooklistComments();
      //$scope.getGroupComments();
    };
  }
]);
