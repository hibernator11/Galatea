'use strict';

angular.module('reviews').controller('ReviewPaginationController', ['$scope', 'Reviews',
  function ($scope, Reviews) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "15"},
        {text : "30", value : "30"},
        {text : "45", value : "45"}
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
        
        Reviews.query(query, function (data) {
            $scope.pagedItems = data[0].reviews;
            $scope.total = data[0].total;
        });
    };
  }
]);
