'use strict';

angular.module('booklists.admin').controller('BooklistAdminController', ['$scope', '$state', '$http', 'Authentication', 'booklistResolve',
  function ($scope, $state, $http, Authentication, booklistResolve) {
    $scope.authentication = Authentication;
    $scope.booklist = booklistResolve;
    
    $scope.remove = function (booklist) {
      if (confirm('¿Estás seguro que desea eliminar la lista?')) {
        if (booklist) {
          booklist.$remove();

          $scope.booklists.splice($scope.booklists.indexOf(booklist), 1);
        } else {
          $scope.booklist.$remove(function () {
            $state.go('admin.booklists');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'booklistForm');

        return false;
      }

      var booklist = $scope.booklist;
      
      booklist.$update(function () {
        $state.go('admin.booklist', {
          booklistId: booklist._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/booklists/removeComment',
            method: "POST",
            data: { 'booklistId' : $scope.booklist._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.booklist.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.message = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/booklists/updateComment',
            method: "POST",
            data: { 'booklistId' : $scope.booklist._id,
                    'commentId': commentId,
                    'data' : data
                  }
        })
        .then(function(response) {
            // success
            $scope.message = response.data.message;
        },
        function(response) { // optional
            // failed
            $scope.message = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setBlocked = function (){
        
        $http({
            url: 'api/admin/booklists/setStatus',
            method: "POST",
            data: { 'booklistId' : $scope.booklist._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.message = response.data.message;
            $scope.booklist.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.message = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/booklists/setStatus',
            method: "POST",
            data: { 'booklistId' : $scope.booklist._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.message = response.data.message;
            $scope.booklist.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.message = '';
            $scope.error = response.data.message;
        });
    };
    
    // Find existing Subjects in BVMC catalogue
    $scope.getSubject = function(val) {
        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/materia/like?callback=JSON_CALLBACK', {
            params: {
                q: val,
                maxRows: 10
            }
        }).then(function(response){
            return response.data.lista.map(function(item){
                var result = {
                        name:item.nombre, 
                        identifierSubject: item.id
                    };
                return result;
            });
        });
    };
    
    // update Tag event
    $scope.updateTag = function(val) {
        
        var booklist = $scope.booklist;

        booklist.$update(function () {
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };
  }
]);
