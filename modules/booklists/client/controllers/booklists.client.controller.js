'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

// controller for modal email window
var ModalEmailInstanceCtrl = function ($scope, $http, $modalInstance) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            console.log('contact form valid');
            /*$http({
                method  : 'POST',
                url     : 'contact-form.php',
                data    : $.param($scope.formData),  //param method from jQuery
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  //set the headers so angular passing info as form data (not request payload)
            }).success(function(data){
                console.log(data);
                if (data.success) { //success comes from the return json object*/
                    $scope.submitButtonDisabled = true;
                    //$scope.resultMessage = data.message;
                    //$scope.result='bg-success';
                    $scope.result = {
                        css: 'bg-success',
                        message: 'Correo enviado correctamente'
                    };

                /*} else {
                    $scope.submitButtonDisabled = false;
                    $scope.resultMessage = data.message;
                    $scope.result='bg-danger';
                }
            });*/
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Failed <img src="http://www.chaosm.net/blog/wp-includes/images/smilies/icon_sad.gif" alt=":(" class="wp-smiley">  Please fill out all the fields.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

// controller for modal book window
var ModalBookInstanceCtrl = function ($scope, $http, $modalInstance) {
    
    $scope.identifierWork = '';
    $scope.slug = '';
    $scope.title = '';
    $scope.uuid = '';
    $scope.reproduction = '';
    $scope.language = '';
    $scope.cover = '';
    $scope.url = '';
    $scope.mediaType = '';

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
                        cover: $scope.cover,
                        url: $scope.url,
                        mediaType: $scope.mediaType,
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
        $scope.cover = val.uuid.replace(/-/g, '').match(/.{1,3}/g).join("/");
        $scope.url = 'http://www.cervantesvirtual.com/obra/' + val.slug;
    };


    // Find existing Books in BVMC catalogue
    $scope.getWork = function(val) {
        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?maxRows=12&callback=JSON_CALLBACK', {
            params: {
                q: val
            }
        }).then(function(response){
            return response.data.lista.map(function(item){
     
                var txtMediaType = '';
                angular.forEach(item.formaSoporte, function(mt) {
     
                    if(txtMediaType !== '')
                        txtMediaType += ', ';
                 
                    txtMediaType += mt.nombre;
                });

                var result = {
                        title:item.titulo, 
                        identifierWork: item.idEntidadDocumental,
                        slug: item.slug,
                        uuid: item.uuid,
                        reproduction: item.reproduccion,
                        language: item.idioma,
                        mediaType: txtMediaType
                    };
                return result;
            });
        });
    };
};

// Booklists controller
angular.module('booklists').controller('BooklistsController', ['$scope', '$http', '$window', '$modal', '$stateParams', '$location', 'Authentication', 'Booklists',
  function ($scope, $http, $window, $modal, $stateParams, $location, Authentication, Booklists) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.warningopen = true;
    $scope.messageok = '';

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
            comments: this.comments,
            tags: this.tags,
            visible: this.visible
        });

        // Redirect after save
        booklist.$save(function (response) {
            $location.path('booklists/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.comments = '';
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
        $scope.booklists = Booklists.query();
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
        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/materia/like?maxRows=12&callback=JSON_CALLBACK', {
            params: {
                q: val
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
        console.log('val:' + val.name + ' val.identifierSubject:' + val.identifierSubject);
        
        var booklist = $scope.booklist;
        console.log('booklist:' + booklist);
        booklist.$update(function () {
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.uuidFilter = function(uuid) {
        return uuid.replace(/-/g, '').match(/.{1,3}/g).join("/");
    };

    $scope.showBookForm = function () {
        $scope.message = "Show Form Button Clicked";
        console.log($scope.message);

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
        $scope.message = "Show Form Button Clicked";
        console.log($scope.message);

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
       var modalInstance = $modal.open({
            templateUrl: '/modules/booklists/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };
  }
]);



