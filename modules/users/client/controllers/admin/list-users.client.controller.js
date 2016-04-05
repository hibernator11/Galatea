'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', '$http', 'Admin',
  function ($scope, $filter, $http, Admin) {
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function (page) {
        $scope.currentPage = page;
        $scope.find();
    };
    
    
    $scope.find = function () {
        
        var query = {page:$scope.currentPage,
                     itemsPerPage:$scope.itemsPerPage};

        Admin.query(query, function (data) {
            $scope.users = data;
            
            $scope.pagedItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
        });
    };
    
    $scope.getTotalUsers = function() {
      
      $http.get('/api/users/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getNewUsers = function() {
      
      $http.get('/api/users/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.init = function(){
        $scope.getNewUsers();
        $scope.getTotalUsers();
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
  }
]);
