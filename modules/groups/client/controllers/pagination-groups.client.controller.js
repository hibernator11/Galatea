'use strict';

angular.module('groups').controller('GroupPaginationController', ['$scope', 'Groups',
  function ($scope, Groups) {
      
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "30", value : "30"},
        {text : "50", value : "50"}
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
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.type = '';
        $scope.find();
    };
    
    $scope.initTypeObra = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.type = 'obra';
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
                      type:$scope.type,
                      text:$scope.text
                    };
        
        Groups.query(query, function (data) {
            $scope.pagedItems = data[0].groups;
            $scope.total = data[0].total;
        });
    };
  }
]);
