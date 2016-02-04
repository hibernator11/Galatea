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

// Reviews controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$window', '$modal', '$stateParams', '$location', 'Authentication', 'Groups',
  function ($scope, $http, $window, $modal, $stateParams, $location, Authentication, Groups) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

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
    $scope.txtcomment = '';

    $scope.messageok = '';
    $scope.warningopen = true;

    $scope.max = 5;
    $scope.rate = 0;
    $scope.isReadonly = false;
    $scope.percent = 0;
    
    // Create new Review
    $scope.create = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'groupForm');

            return false;
        }

        // Create new Review object
        var group = new Groups({
            title: this.title,
            content: this.content,
            identifierWork: $scope.identifierWork,
            slug: $scope.slug,
            uuid: $scope.uuid,
            reproduction: $scope.reproduction,
            language: $scope.language,
            mediaType: $scope.mediaType 
        });

        // Redirect after save
        group.$save(function (response) {
            $location.path('groups/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.content = '';
            $scope.identifierWork = '';
            $scope.slug = '';
            $scope.title = '';
            $scope.uuid = '';
            $scope.reproduction = '';
            $scope.language = '';
            $scope.cover = '';
            $scope.url = '';
            $scope.mediaType = '';

            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };

    // Remove existing Review
    $scope.remove = function (group) {
        if (group) {
            group.$remove();

            for (var i in $scope.groups) {
                if ($scope.groups[i] === group) {
                    $scope.groups.splice(i, 1);
                }
            }
        } else {
            $scope.group.$remove(function () {
                $location.path('groups');
            });
        }
    };

    // Update existing Review
    $scope.update = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'groupForm');

            return false;
        }

        var group = $scope.group;

        group.$update(function () {
            $scope.messageok = 'La reseña se ha modificado correctamente.';
            $location.path('groups/' + group._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.showList = function(){
        $location.path('groups');
    };

    $scope.openReview = function(groupId) {
        $location.path('groups/' + groupId);
    };

    // Find the list of Reviews of the user
    $scope.find = function () {
        $scope.groups = Groups.query();
    };

    // Find a list of Reviews with public status
    $scope.findStatusPublic = function () {
        $http.get('api/groups/public').success(function (response) {
            $scope.groups = response;
        }).error(function (response) {
            $scope.error = response.message;
        });
    };

    // Set update group
    $scope.updateReview = function () {
        $scope.group.$update(function () {
            $scope.messageok = 'La reseña se ha modificado correctamente.';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Review
    $scope.findOne = function () {
      $scope.group = Groups.get({
        groupId: $stateParams.groupId
      });
    };

    // update group status draft
    $scope.setDraftReviewStatus = function () {
      $scope.group.status = "draft";
      
      $scope.group.$update(function () {
          $scope.messageok = 'La reseña se ha cambiado a estado borrador.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    // update group status public
    $scope.setPublicReviewStatus = function () {
      $scope.group.status = "public";
      
      $scope.group.$update(function () {
          $scope.messageok = 'La reseña se ha publicado correctamente.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    $scope.$watch('group.ratings', function(value) {
        if (!angular.isUndefined($scope.group) && !angular.isUndefined($scope.group.ratings)){
            angular.forEach($scope.group.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                }
            });
        }
    });
    
    $scope.$watch('rate', function(value) {

       if (!angular.isUndefined($scope.rate) && 
           !angular.isUndefined($scope.group) &&
           !angular.isUndefined($scope.group.ratings) && !$scope.isReadonly) {
            
          var rating = {
                rate: value,
                user: $scope.authentication.user
          };

          $scope.group.ratings.push(rating);

          $scope.group.$update(function () {
              $scope.messageok = 'La reseña se ha valorado correctamente.';
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

 
    $scope.addComment = function() {
      if ($scope.form.commentForm.$valid) {
            
        var comment = {
                    content: $scope.txtcomment,
                    user: $scope.authentication.user
        };

        $scope.group.comments.unshift(comment);

        $scope.group.$update(function () {
            $scope.txtcomment = '';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
      }
    };

    $scope.uuidFilter = function(uuid) {
        if(uuid)
          return uuid.replace(/-/g, '').match(/.{1,3}/g).join("/");
        else
          return '';
    };

    // Find existing Books in BVMC catalogue
    $scope.getWork = function(val) {

        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?maxRows=12&callback=JSON_CALLBACK', {
            params: {
                q: val
            }
        }).then(function(response){
            return response.data.lista.map(function(item){
     
                var mediatype = '';
                angular.forEach(item.formaSoporte, function(mt) {
     
                    if(mediatype !== '')
                        mediatype += ', ';
                 
                    mediatype += mt.nombre;
                });

                var result = {
                        title:item.titulo, 
                        identifierWork: item.idEntidadDocumental,
                        slug: item.slug,
                        uuid: item.uuid,
                        reproduction: item.reproduccion,
                        language: item.idioma,
                        mediaType: mediatype
                    };
                return result;
            });
        });
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
       var modalInstance = $modal.open({
            templateUrl: '/modules/groups/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };

  }
]);

angular.module('groups').filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}]);

angular.module('groups').filter('htmlLimit', ['$sce', function ($sce) { 
    return function (text) {
        if(text && text.length > 200)
          text = text.substring(0, 200) + '...';
        return $sce.trustAsHtml(text);
    };    
}]);



