'use strict';

// Booklists controller
angular.module('booklists').controller('BooklistsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Booklists', 'Reviews',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Booklists, Reviews) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.warningopen = true;
    $scope.messageok = '';
    
    $scope.year = new Date();
    
    $scope.form = {};
    $scope.txtcomment = '';
    
    $scope.max = 5;
    $scope.rate = 0;
    $scope.isReadonly = false;
    $scope.percent = 0;
    $scope.showRatingBar = false;

    // Create new Booklist
    $scope.create = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'booklistForm');

            return false;
        }

        // Create new Booklist object
        var booklist = new Booklists({
            title: this.title,
            description: this.description,
            tags: this.tags,
            visible: this.visible
        });

        // Redirect after save
        booklist.$save(function (response) {
            $location.path('booklists/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.description = '';
            $scope.tags = '';
            $scope.books = '';
            $scope.visible = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };

    // Remove existing Booklist
    $scope.remove = function (booklist) {
        if (booklist) {
            booklist.$remove();

            for (var i in $scope.booklists) {
                if ($scope.booklists[i] === booklist) {
                    $scope.booklists.splice(i, 1);
                }
            }
        } else {
            $scope.booklist.$remove(function () {
                $location.path('booklists');
            });
        }
    };

    // Update existing Booklist
    $scope.update = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'booklistForm');

            return false;
        }

        var booklist = $scope.booklist;

        booklist.$update(function () {
            $location.path('booklists/' + booklist._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.showList = function(){
        $location.path('booklists');
    };

    // Find a list of Booklists
    $scope.find = function () {
        Booklists.query({}, function (data) {
                              $scope.booklists = data[0].booklists;
                              $scope.total = data[0].total;
                           });
    };

    // Set visible field
    $scope.updateBooklist = function () {
        $scope.booklist.$update(function () {
            //$location.path('booklists/' + booklist._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Booklist
    $scope.findOne = function () {
      $scope.booklist = Booklists.get({
        booklistId: $stateParams.booklistId
      });
    };

    $scope.removeBook = function (item){
        var index = $scope.booklist.books.indexOf(item);
        $scope.booklist.books.splice(index,1);

        $scope.booklist.$update(function () {
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Subjects in BVMC catalogue
    $scope.getSubject = function(val) {
        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/materia/like?callback=JSON_CALLBACK', {
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
    
    // update booklist status draft
    $scope.setDraftStatus = function () {
      $scope.booklist.status = "draft";
      
      $scope.booklist.$update(function () {
          $scope.messageok = 'La lista se ha cambiado a estado borrador.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    // update booklist status public
    $scope.setPublicStatus = function () {
      $scope.booklist.status = "public";
      
      $scope.booklist.$update(function () {
          $scope.messageok = 'La lista se ha publicado correctamente.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.addComment = function() {
      if ($scope.form.commentForm.$valid) {
            
        var comment = {
                    content: $scope.txtcomment,
                    user: $scope.authentication.user
        };

        $scope.booklist.comments.unshift(comment);

        $scope.booklist.$update(function () {
            $scope.txtcomment = '';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
      }
    };
    
    $scope.addFollower = function() {
      if ($scope.authentication.user) {
          
        if ($scope.authentication.user._id !== $scope.booklist.user._id) {
            var follower = {
                    user: $scope.authentication.user
            };
            
            var found = false;
            for(var i = 0; i <  $scope.booklist.followers.length; i++) {
                if ( $scope.booklist.followers[i].user === $scope.authentication.user._id) {
                    found = true;
                    break;
                }
            }

            if(!found){
                $scope.booklist.followers.push(follower);

                $scope.booklist.$update(function () {
                    $scope.messageok = 'Ahora eres seguidor de esta lsita de obras.' + $scope.authentication.user._id;
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }else{
                $scope.error = 'Ya eres seguidor de la lista.';
            }
        }else{
            $scope.error = 'Eres el creador de esta lista y por tanto ya eres seguidor.';
        }
      }else{
          $scope.error = 'Para ser seguidor debes introducir tu usuario y contraseña.';
      }
    };

    // update Tag event
    $scope.updateTag = function(val) {
        
        var booklist = $scope.booklist;

        booklist.$update(function () {
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };
    
    $scope.checkRatingBar = function (){
        $scope.showRatingBar = true;
        if (!angular.isUndefined($scope.booklist) && !angular.isUndefined($scope.booklist.ratings)){
            angular.forEach($scope.booklist.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces el mismo grupo";
                }
            });
        }
    };

    $scope.$watch('booklist.ratings', function(value) {
        if (!angular.isUndefined($scope.booklist) && !angular.isUndefined($scope.booklist.ratings)){
            angular.forEach($scope.booklist.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                }
            });
        }
    });
    
    $scope.$watch('rate', function(value) {

       if (!angular.isUndefined($scope.rate) && 
           !angular.isUndefined($scope.booklist) &&
           !angular.isUndefined($scope.booklist.ratings) && !$scope.isReadonly) {
            
          var rating = {
                rate: value,
                user: $scope.authentication.user
          };

          $scope.booklist.ratings.push(rating);

          $scope.booklist.$update(function () {
              $scope.messageok = 'La lista se ha valorado correctamente.';
              $scope.showRatingBar = false;
          }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
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

    $scope.showBookForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/booklists/client/views/modal-book-form.html',
            controller: ModalBookInstanceCtrl,
            scope: $scope,
            resolve: {
                bookForm: function () {
                    return $scope.bookForm;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selectedItem = selectedItem;
            
            // Create new book object
            var book = {
                    title: $scope.selectedItem.title,
                    comments: $scope.selectedItem.comments,
                    identifierWork: $scope.selectedItem.identifierWork,
                    slug: $scope.selectedItem.slug,
                    uuid: $scope.selectedItem.uuid,
                    reproduction: $scope.selectedItem.reproduction,
                    language: $scope.selectedItem.language,
                    mediaType: $scope.selectedItem.mediaType
            };

            $scope.booklist.books.push(book);

            $scope.booklist.$update(function () {
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
            
        }, function () {
            $scope.selectedItem = '';
        });
    };

    $scope.showEmailForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/booklists/client/views/modal-email-form.html',
            controller: ModalEmailInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selectedItem = selectedItem;
 
            $scope.messageok = selectedItem.message;
            
        }, function () {
            $scope.selectedItem = '';
        });
    };

    $scope.showHelpInformation = function () {
       $modal.open({
            templateUrl: '/modules/booklists/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };
  }
]);



