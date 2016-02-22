'use strict';

angular.module('reviews').controller('ReviewPaginationController', ['$scope', '$filter', 'Reviews',
  function ($scope, $filter, Reviews) {
      
    $scope.init = function(status, itemsPerPage){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.reviews, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function () {
        console.log('$scope.currentPage:' + $scope.currentPage);
        $scope.find();
    };
    
    $scope.find = function () {
        if($scope.itemsPerPage === 0 || $scope.itemsPerPage > 50)
            $scope.itemsPerPage = 15;
        
        var query = '';
        if($scope.status === 'public'){
            query = {status:'public', 
                     page:$scope.currentPage, 
                     itemsPerPage:$scope.itemsPerPage};
        }else{
            query = {page:$scope.currentPage,
                     itemsPerPage:$scope.itemsPerPage};
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
