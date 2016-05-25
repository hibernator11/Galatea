'use strict';
angular.module('publications.admin').run(function (editableOptions) {editableOptions.theme = 'bs3'; });

angular.module('publications.admin').controller('PublicationAdminController', ['$scope', '$state', '$http', 'pdfDelegate', 'Authentication', 'publicationResolve',
  function ($scope, $state, $http, pdfDelegate, Authentication, publicationResolve) {
    $scope.authentication = Authentication;
    $scope.publication = publicationResolve;
    
    $scope.remove = function (publication) {
      if (confirm('¿Estás seguro que desea eliminar la publicación?')) {
        if (publication) {
          publication.$remove();

          $scope.publications.splice($scope.groups.indexOf(publication), 1);
        } else {
          $scope.publication.$remove(function () {
            $state.go('admin.publications');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'publicationForm');

        return false;
      }

      var publication = $scope.publication;
      
      publication.$update(function () {
        $state.go('admin.publication', {
          publicationId: publication._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/publications/removeComment',
            method: "POST",
            data: { 'publicationId' : $scope.publication._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.publication.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/publications/updateComment',
            method: "POST",
            data: { 'publicationId' : $scope.publication._id,
                    'commentId': commentId,
                    'data' : data
                  }
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setBlocked = function (){
        
        $http({
            url: 'api/admin/publications/setStatus',
            method: "POST",
            data: { 'publicationId' : $scope.publication._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.publication.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/publications/setStatus',
            method: "POST",
            data: { 'publicationId' : $scope.publication._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.publication.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
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
    
    $scope.loadNewFile = function(url) {
      $scope.showToolbar = true;  
      pdfDelegate
        .$getByHandle('my-pdf-container')
        .load(url);
    };
    
  }
]);
