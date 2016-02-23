'use strict';

// controller for modal book window
var ModalBookInstanceCtrl = function ($scope, $http, $modalInstance) {
    
    $scope.identifierWork = '';
    $scope.slug = '';
    $scope.title = '';
    $scope.uuid = '';
    $scope.reproduction = '';
    $scope.language = '';
    $scope.mediaType = '';
    $scope.authors = '';

    $scope.form = {};
    $scope.submitForm = function () {
        if ($scope.form.bookForm.$valid) {
            
            $scope.selectedItem = {
                        title:$scope.title,
                        comments: $scope.form.bookForm.comments.$modelValue,
                        identifierWork: $scope.identifierWork,
                        slug: $scope.slug,
                        uuid: $scope.uuid,
                        reproduction: $scope.reproduccion,
                        language: $scope.language,
                        mediaType: $scope.mediaType,
                        authors: $scope.authors,
            };

            $modalInstance.close($scope.selectedItem);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    // when select one item on typeahead
    $scope.setWorkValues = function(val) { // this gets executed when an item is selected
        $scope.identifierWork = val.identifierWork;
        $scope.slug = val.slug;
        $scope.uuid = val.uuid;
        $scope.reproduction = val.reproduction;
        $scope.title = val.title;
        $scope.language = val.language;
        $scope.mediaType = val.mediaType;
        $scope.authors = val.authors;
    };


    // Find existing Books in BVMC catalogue
    $scope.getWork = function(val) {
        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
            params: {
                q: val,
                maxRows: 30
            }
        }).then(function(response){
            return response.data.lista.map(function(item){
     
                var txtMediaType = '';
                angular.forEach(item.formaSoporte, function(mt) {
     
                    if(txtMediaType !== '')
                        txtMediaType += ', ';
                 
                    txtMediaType += mt.nombre;
                });
                
                var authors = '';
                angular.forEach(item.autores, function(author) {
     
                    if(authors !== '')
                        authors += '. ';
                 
                    authors += author.nombre;
                });

                var result = {
                        title:item.titulo, 
                        identifierWork: item.idEntidadDocumental,
                        slug: item.slug,
                        uuid: item.uuid,
                        reproduction: item.reproduccion,
                        language: item.idioma,
                        mediaType: txtMediaType,
                        authors: authors
                    };
                return result;
            });
        });
    };
};

