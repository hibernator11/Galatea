'use strict';
angular.module('reviews.admin').run(function (editableOptions) {editableOptions.theme = 'bs3'; });

angular.module('reviews.admin').controller('ReviewAdminController', ['$scope', '$state', '$http', 'Authentication', 'reviewResolve',
  function ($scope, $state, $http, Authentication, reviewResolve) {
    $scope.authentication = Authentication;
    $scope.review = reviewResolve;
    
    $scope.remove = function (review) {
      if (confirm('¿Estás seguro que desea eliminar la reseña?')) {
        if (review) {
          review.$remove();

          $scope.reviews.splice($scope.groups.indexOf(review), 1);
        } else {
          $scope.review.$remove(function () {
            $state.go('admin.reviews');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reviewForm');

        return false;
      }

      var review = $scope.review;
      
      review.$update(function () {
        $state.go('admin.review', {
          reviewId: review._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/reviews/removeComment',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/reviews/updateComment',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'commentId': commentId,
                    'data' : data
                  }
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setBlocked = function (){
        
        $http({
            url: 'api/admin/reviews/setStatus',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/reviews/setStatus',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
  }
]);
