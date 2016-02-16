'use strict';

angular.module('groups').controller('GroupPaginationController', ['$scope', '$filter', 'Groups',
  function ($scope, $filter, Groups) {
      
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.groups, {
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

        Groups.query(query, function (data) {
            $scope.groups = data[0].groups;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.groups, {
                $: $scope.search
            });
        });
    };
  }
]);
