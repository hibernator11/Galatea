'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', '$http', 'Admin',
  function ($scope, $filter, $http, Admin) {
      
    $scope.searchIsCollapsed = true;
    
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "50", value : "50"},
        {text : "100", value : "100"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Activo", value : "activo"},
        {text : "Inactivo", value : "inactivo"}
    ];
    
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
                     itemsPerPage:$scope.itemsPerPage,
                     order:$scope.order,
                     status:$scope.status,
                     text:$scope.text
                    };

        Admin.query(query, function (data) {
            $scope.users = data[0].users;
            $scope.totalResults = data[0].total;
            
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
        $scope.order = 'desc';
        $scope.status = '';
        $scope.text = '';
        $scope.currentPage = 1;
        $scope.searchIsCollapsed = true;
        
        $scope.find();
    }
  }
]);
