'use strict';

angular.module('booklists.admin').controller('BooklistListController', ['$scope', '$http', 'Booklists',
  function ($scope, $http, Booklists) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "20", value : "20"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"},
        {text : "Bloqueado", value : "blocked"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = '';
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = '';
        $scope.order = 'desc';
        $scope.find();
    };
    
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
                    
        var config = {
            params: query,
            headers : {'Accept' : 'application/json'}
        };            
        
        $http.get('api/admin/booklists', config).then(function(response) {
            // process response here..
            $scope.pagedItems = response.data.booklists;
            $scope.total = response.data.total;
          }, function(response) {
            $scope.error = response.data.message;
        });
    };
  }
]);
