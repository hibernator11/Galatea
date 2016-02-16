'use strict';

angular.module('booklists').controller('BooklistPaginationController', ['$scope', '$filter', 'Booklists',
  function ($scope, $filter, Booklists) {
    
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.booklists, {
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

        Booklists.query(query, function (data) {
            $scope.booklists = data[0].booklists;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.booklists, {
                $: $scope.search
            });
        });
    };
  }
]);