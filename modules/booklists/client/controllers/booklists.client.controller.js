'use strict';

// Booklists controller
angular.module('booklists').controller('BooklistsController', ['$scope', '$http', '$modal', '$stateParams', 
    '$location', 'Authentication', 'Booklists', 'Groups',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Booklists, Groups) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.warningopen = true;
    $scope.messageok = '';
    
    $scope.year = new Date();
    
    $scope.form = {};
    $scope.txtcomment = '';
    
    $scope.max = 5;
    $scope.rate = 0;
    $scope.percent = 0;
    $scope.showRatingBar = false;
    $scope.showRatingButton = true;

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
            tags: this.tags
        });

        // Redirect after save
        booklist.$save(function (response) {
            $location.path('booklists/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.description = '';
            $scope.tags = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };

    // Duplicate new Booklist
    $scope.duplicateBooklist = function () {
       
        // Create new Booklist object
        var booklist = new Booklists({
            title: $scope.booklist.title,
            description: $scope.booklist.description,
            tags: $scope.booklist.tags,
            books: $scope.booklist.books
        });

        // Redirect after save
        booklist.$save(function (response) {
            $location.path('booklists/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.description = '';
            $scope.tags = '';
            $scope.books = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };

    
    $scope.createGroupFromBooklist = function () {
        // Create new Group object
        var group = new Groups({
            name: $scope.booklist.title,
            content: $scope.booklist.description,
            type: "lista",
            books: $scope.booklist.books,
            source: $scope.booklist._id
        });

        // Redirect after save
        group.$save(function (response) {
            $location.path('groups/' + response._id);
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
        return $http.jsonp('//app.pre.cervantesvirtual.com/cervantesvirtual-web-services/materia/like?callback=JSON_CALLBACK', {
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
        
        $http({
            url: 'api/booklists/addComment',
            method: "POST",
            data: { 'message' :  $scope.txtcomment,
                    'booklistId' :  $scope.booklist._id}
        })
        .then(function(response) {
            // success
            var comment = {
              content: $scope.txtcomment,
              user: $scope.authentication.user,
              created: new Date()
            };
            $scope.booklist.comments.push(comment);
            
            $scope.txtcomment = '';
            $scope.messageok = response.data.message;
        }, 
        function(response) { // optional
            // failed
            $scope.error = response.data.message;
        });
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
        if ($scope.showRatingButton && 
                !angular.isUndefined($scope.booklist) && 
                !angular.isUndefined($scope.booklist.ratings)){
            angular.forEach($scope.booklist.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces la misma lista";
                }
            });
        }
    };

    $scope.$watch('rate', function(value) {
        if(!angular.isUndefined($scope.booklist) && value > 0){
            $http({
                url: 'api/booklists/addRating',
                method: "POST",
                data: { 'rate' :  value,
                        'booklistId' :  $scope.booklist._id}
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
                    mediaType: $scope.selectedItem.mediaType,
                    authors: $scope.selectedItem.authors
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
            controller: ModalBooklistEmailInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                booklistId: function () {
                    return $scope.booklist._id;
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
            templateUrl: '/modules/booklists/client/views/modal-report-form.html',
            controller: ModalBooklistReportInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                booklistId: function () {
                    return $scope.booklist._id;
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
            templateUrl: '/modules/booklists/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };
  }
]);

angular.module('booklists').filter('filterComments', function() {
    return function(items) {
        var retn = [];
        
        var date = new Date();
        date.setDate(date.getDate() - 7);
        
        angular.forEach(items, function(item){
            
            var dateComment =  new Date(item.created);
            
            if(dateComment < date && item.status === 'public'){
              retn.push(item); 
            }
        });

        return retn;
    };
});

