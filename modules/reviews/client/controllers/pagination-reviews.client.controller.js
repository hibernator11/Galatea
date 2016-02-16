'use strict';

angular.module('reviews').controller('ReviewPaginationController', ['$scope', '$filter', 'Reviews',
  function ($scope, $filter, Reviews) {
      
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.reviews, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        var query = '';
        if($scope.status === 'public'){
            query = {status:'public', page:$scope.currentPage};
        }else{
            query = {page:$scope.currentPage};
        }

        Reviews.query(query, function (data) {
            $scope.reviews = data[0].reviews;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.reviews, {
                $: $scope.search
            });
        });
    };
  }
]);
