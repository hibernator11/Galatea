'use strict';

angular.module('booklists').controller('GroupUserPaginationController', ['$scope', '$http', 'Groups', 
  function ($scope, $http, Groups) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "10"},
        {text : "30", value : "30"},
        {text : "45", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.status = '';
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        $http.get('api/groups/user').success(function (data) {
            $scope.pagedItems = data[0].groups;
            $scope.total = data[0].total;
        }).error(function (response) {
            $scope.error = response.message;
        });                    
    };
  }
]);
