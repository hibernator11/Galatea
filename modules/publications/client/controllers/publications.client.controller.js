'use strict';

// Publications controller
angular.module('publications').controller('PublicationsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'pdfDelegate', 'Authentication', 'Publications', 
  function ($scope, $http, $modal, $stateParams, $location, pdfDelegate, Authentication, Publications) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.title = '';

    $scope.form = {};
    $scope.txtcomment = '';

    $scope.messageok = '';
    $scope.warningopen = true;

    // rating variables
    $scope.max = 5;
    $scope.rate = 0;
    $scope.percent = 0;
    $scope.showRatingBar = false;
    $scope.showRatingButton = true;
    
    $scope.loadNewFile = function(url) {
      $scope.showToolbar = true;  
      pdfDelegate
        .$getByHandle('my-pdf-container')
        .load(url);
    };
    
    // Create new Publication
    $scope.create = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'publicationForm');

            return false;
        }

        // Create new Publication object
        var publication = new Publications({
            title: this.title,
            content: this.content
        });

        // Redirect after save
        publication.$save(function (response) {
            $location.path('publications/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.content = '';

            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };

    // Remove existing Publication
    $scope.remove = function (publication) {
        if (publication) {
            publication.$remove();

            for (var i in $scope.publications) {
                if ($scope.publications[i] === publication) {
                    $scope.publications.splice(i, 1);
                }
            }
        } else {
            $scope.publication.$remove(function () {
                $location.path('publications');
            });
        }
    };

    // Update existing Publication
    $scope.update = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'publicationForm');

            return false;
        }

        var publication = $scope.publication;

        publication.$update(function () {
            $scope.messageok = 'La publicación se ha modificado correctamente.';
            $location.path('publications/' + publication._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.showList = function(){
        $location.path('publications');
    };

    $scope.openPublication = function(publicationId) {
        $location.path('publications/' + publicationId);
    };

    // Find the list of Publications of the user
    $scope.find = function () {
        $scope.publications = Publications.query();
    };
    
    // Set update publication
    $scope.updatePublication = function () {
        $scope.publication.$update(function () {
            $scope.messageok = 'La publicación se ha modificado correctamente.';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Publication
    $scope.findOne = function () {
        $scope.publication = Publications.get({
            publicationId: $stateParams.publicationId
        });
        
    };

    // update publication status draft
    $scope.setDraftStatus = function () {
      $scope.publication.status = "draft";
      
      $scope.publication.$update(function () {
          $scope.messageok = 'La publicación se ha cambiado a estado borrador.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    // update publication status public
    $scope.setPublicStatus = function () {
      $scope.publication.status = "public";
      
      $scope.publication.$update(function () {
          $scope.messageok = 'La publicación se ha publicado correctamente.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.checkRatingBar = function (){
        $scope.showRatingBar = true;
        if ($scope.showRatingButton && 
                !angular.isUndefined($scope.publication) && 
                !angular.isUndefined($scope.publication.ratings)){
            angular.forEach($scope.publication.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces la misma publicación";
                }
            });
        }
    };

    $scope.$watch('rate', function(value) {
        if(!angular.isUndefined($scope.publication) && value > 0){
            $http({
                url: 'api/publications/addRating',
                method: "POST",
                data: { 'rate' :  value,
                        'publicationId' :  $scope.publication._id}
            })
            .then(function(response) {
                // success
                $scope.rate = 0;
                $scope.messageok = response.data.message;
                $scope.showRatingBar = false;
                $scope.showRatingButton = false;
            }, 
            function(response) { // optional
                // failed
                $scope.error = response.data.message;
            });
        }
    });
    
    $scope.hoveringOver = function(value) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);

      if(value === 1)
        $scope.overStar = 'Me gusta poco';
      else if(value === 2)
        $scope.overStar = 'Me gusta';
      else if(value === 3)
        $scope.overStar = 'Me gusta bastante';
      else if(value === 4)
        $scope.overStar = 'Me gusta mucho';
      else if(value === 5)
        $scope.overStar = 'Me encanta';
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

    $scope.addComment = function() {
      
      if ($scope.form.commentForm.$valid) {
        
        $http({
            url: 'api/publications/addComment',
            method: "POST",
            data: { 'message' :  $scope.txtcomment,
                    'publicationId' :  $scope.publication._id}
        })
        .then(function(response) {
            // success
            $scope.publication = Publications.get({
              publicationId: $stateParams.publicationId
            });
            
            $scope.txtcomment = '';
            $scope.messageok = response.data.message;
        }, 
        function(response) { // optional
            // failed
            $scope.error = response.data.message;
        });
      }
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/publications/removeComment',
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

    $scope.showEmailForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/publications/client/views/modal-email-form.html',
            controller: ModalPublicationEmailInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                publicationId: function () {
                    return $scope.publication._id;
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.messageok = result.message;
        }, function () {
        });
    };
    
    $scope.showReportForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/publications/client/views/modal-report-form.html',
            controller: ModalPublicationReportInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                publicationId: function () {
                    return $scope.publication._id;
                },
                displayName: function () {
                    return $scope.authentication.user.displayName;
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.messageok = result.message;
            
        }, function () {
            
        });
    };

    $scope.showHelpInformation = function () {
       $modal.open({
            templateUrl: '/modules/publications/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };

  }
]);

