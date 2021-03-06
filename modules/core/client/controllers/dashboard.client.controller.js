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
    $scope.totalCommentsPublication = 0;
    
    $scope.numResultsCommentsReview = 10;
    $scope.numResultsCommentsGroup = 10;
    $scope.numResultsCommentsBooklist = 10;
    $scope.numResultsCommentsPublication = 10;
    
    $scope.newReviews = 0;
    $scope.newBooklists = 0;
    $scope.newGroups = 0;
    $scope.newUsers = 0;
    $scope.newPublications = 0;
    $scope.totalUsers = 0;
    $scope.totalReviews = 0;
    
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
    
    $scope.getPublicationComments = function() {
      $http.get('/api/comments/publications/results/' + $scope.numResultsCommentsPublication)
      .success(function (response) {
            $scope.commentsPublication = response;
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
    
    $scope.getTotalCommentsPublication = function() {
      
      $http.get('/api/comments/publications/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsPublication = response[0].total;
            $scope.newComments += $scope.totalCommentsPublication;
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
        $scope.getTotalCommentsPublication();
    }
    
    $scope.getNewsReviews = function() {
      
        $http.get('/api/reviews/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newReviews = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsBooklists = function() {
      
        $http.get('/api/booklists/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newBooklists = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsGroups = function() {
      
        $http.get('/api/groups/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newGroups = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsPublications = function() {
      
        $http.get('/api/publications/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newPublications = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }    
    
    $scope.getNewsUsers = function() {
      
        $http.get('/api/users/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getTotalUsers = function() {
      
      $http.get('/api/users/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalReviews = function() {
      
      $http.get('/api/reviews/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalReviews = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    

    //call methods
    
    $scope.getNewsReviews();
    $scope.getTotalReviews();
    
    $scope.getNewsBooklists();
    $scope.getNewsGroups();
    $scope.getNewsPublications();
    
    $scope.getNewsUsers();
    $scope.getTotalUsers();
    
    $scope.getTotalComments();
    $scope.getReviewComments();
    $scope.getBooklistComments();
    $scope.getGroupComments();
    $scope.getPublicationComments();
  }
]);
