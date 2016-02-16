'use strict';

angular.module('booklists').controller('BooklistPaginationController', ['$scope', '$filter', 'Booklists',
  function ($scope, $filter, Booklists) {
      
    $scope.init = function(typeSearch){
        $scope.typeSearch = typeSearch;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.filteredItems = $filter('filter')($scope.booklists, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.find();
    };
      
    $scope.find = function () {
        var query = '';
        if($scope.typeSearch === 'public'){
            query = {status:'public', page:$scope.currentPage};
        }else{
            query = {page:$scope.currentPage};
        }
        Booklists.query(query, function (data) {
            $scope.booklists = data[0].booklists;
            $scope.total = data[0].total;
            
            console.log($scope.booklists.length);
            
            $scope.filteredItems = $filter('filter')($scope.booklists, {
                $: $scope.search
            });
            console.log('filteredItems:' + $scope.filteredItems.length);
            
            
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.pagedItems = $scope.filteredItems.slice(begin, end);
            console.log('begin:' + begin);
            console.log('end:' + end);
            console.log('pagedItems:' + $scope.pagedItems.length);
        });
    };
    
  }
]);
