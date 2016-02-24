'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Groups', 'Booklists', 'Users',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Groups, Booklists, Users) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.identifierWork = '';
    $scope.slug = '';
    $scope.title = '';
    $scope.uuid = '';
    $scope.reproduction = '';
    $scope.language = '';
    $scope.mediaType = '';
    $scope.authors = '';

    $scope.form = {};
    $scope.txtcomment = '';

    $scope.messageok = '';
    $scope.warningopen = true;

    $scope.max = 5;
    $scope.rate = 0;
    $scope.isReadonly = false;
    $scope.percent = 0;
    
    $scope.type = '';
    
    $scope.showWorkPanel = false;
    $scope.showBookListPanel = false;
    $scope.showAuthorPanel = false;
    $scope.showThemePanel = false;
    $scope.showDescriptionPanel = false;
    $scope.booklists = '';
    
    $scope.showRatingBar = false;
    
    $scope.selectTypeAction = function() {
        
        // init variables
        $scope.booklist = '';
        $scope.themeName = '';
        $scope.authorName = '';
        $scope.booklists = '';
        $scope.uuid = '';
        $scope.slug = '';
        $scope.reproduction = '';
        $scope.title = '';
        $scope.authors = '';
        $scope.books = '';
        
        if($scope.type === 'obra'){
            $scope.showWorkPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showAuthorPanel = false;
            $scope.showBookListPanel = false;
            $scope.showThemePanel = false;
        }else if($scope.type === 'autor'){
            $scope.showAuthorPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showBookListPanel = false;
            $scope.showThemePanel = false;
        }else if($scope.type === 'lista'){
            $scope.showBookListPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
            $scope.showThemePanel = false;
                        
            // load booklists
            $http.get('/api/booklists')
                .success(function(data) {
                    $scope.booklists = data[0].booklists;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

        }else if($scope.type === 'tema'){
            $scope.showBookListPanel = false;
            $scope.showThemePanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
        }else{
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
            $scope.showDescriptionPanel = false;
            $scope.showBookListPanel = false;
            $scope.showThemePanel = false;
        }
    };
    
    $scope.selectBookListAction = function() {
        $scope.source = $scope.booklistId;
        
        $scope.booklist = Booklists.get({
            booklistId: $scope.booklistId
        });
    };
    
    // Create new Group
    $scope.create = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'groupForm');

            return false;
        }
        
        if($scope.type === "lista" && angular.isUndefined($scope.source)){
            $scope.error = "Por favor seleccione una lista";

            return false;
        }

        // Create new Group object
        var group = new Groups({
            name: this.name,
            content: this.content,
            type: $scope.type,
            source: $scope.source,
            uuid: $scope.uuid,
            reproduction: $scope.reproduction,
            title: $scope.title,
            authorName: $scope.authorName,
            themeName: $scope.themeName,
            books: $scope.booklist.books
        });

        // Redirect after save
        group.$save(function (response) {
            $location.path('groups/' + response._id);

            // Clear form fields
            $scope.name = '';
            $scope.title = '';
            $scope.content = '';
            $scope.identifierWork = '';
            $scope.type = '';
            $scope.source = '';
            $scope.slug = '';
            $scope.title = '';
            $scope.uuid = '';
            $scope.reproduction = '';
            $scope.language = '';
            $scope.mediaType = '';
            $scope.authors = '';

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

    // Update existing Group
    $scope.update = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'groupForm');

            return false;
        }

        var group = $scope.group;

        group.$update(function () {
            $scope.messageok = 'El grupo se ha modificado correctamente.';
            $location.path('groups/' + group._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.showList = function(){
        $location.path('groups');
    };

    $scope.openGroup = function(groupId) {
        $location.path('groups/' + groupId);
    };

    // Find the list of groups of the user
    $scope.find = function () {
        $scope.groups = Groups.query();
    };

    // Find a list of groups with public status
    $scope.findStatusPublic = function () {
        $http.get('api/groups/public').success(function (response) {
            $scope.groups = response;
        }).error(function (response) {
            $scope.error = response.message;
        });
    };

    // Set update group
    $scope.updateGroup = function () {
        $scope.group.$update(function () {
            $scope.messageok = 'El grupo se ha modificado correctamente.';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Group
    $scope.findOne = function () {
      $scope.group = Groups.get({
        groupId: $stateParams.groupId
      });
    };
    
    $scope.showAddComments = function () {
        
        if ($scope.group && 
            $scope.authentication.user &&
            $scope.group.user &&
            $scope.authentication.user._id === $scope.group.user._id){
            console.log("showAddComments true admin group");
            return true;
        }else if($scope.group.status === 'public' && $scope.authentication.user){
            for(var i = 0; i <  $scope.group.members.length; i++) {
                if ( $scope.group.members[i].status === 'aceptado' && 
                     $scope.group.members[i].user._id === $scope.authentication.user._id) {
                     console.log("showAddComments true user aceptado");
                    return true;
                }
            }
        }
        return false;
    };

    // update group status draft
    $scope.setDraftStatus = function () {
      $scope.group.status = "draft";
      
      $scope.group.$update(function () {
          $scope.messageok = 'El grupo se ha cambiado a estado borrador.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    // update group status public
    $scope.setPublicStatus = function () {
      $scope.group.status = "public";
      
      $scope.group.$update(function () {
          $scope.messageok = 'El grupo se ha publicado correctamente.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.checkRatingBar = function (){
        $scope.showRatingBar = true;
        if (!angular.isUndefined($scope.group) && !angular.isUndefined($scope.group.ratings)){
            angular.forEach($scope.group.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces el mismo grupo";
                }
            });
        }
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
              $scope.messageok = 'El grupo se ha valorado correctamente.';
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
    
    $scope.addMember = function(item) {
      
        if ($scope.authentication.user._id === $scope.group.user._id) {
            
            var member = {
                user: item.userId,
                status: 'invitado'
            };
            
            var found = false;
            for(var i = 0; i <  $scope.group.members.length; i++) {
                if ( $scope.group.members[i].user._id === member._id) {
                    found = true;
                    break;
                }
            }

            if(!found){
                $scope.group.members.push(member);

                $scope.group.$update(function () {
                    $scope.messageok = 'Invitación enviada.';
                    $scope.error = '';
                }, function (errorResponse) {
                    $scope.messageok = '';
                    $scope.error = errorResponse.data.message;
                });
            }else{
                $scope.messageok = '';
                $scope.error = 'El usuario ' + item.displayName + ' ya forma parte del grupo.';
            }
        }else{
            $scope.messageok = '';
            $scope.error = 'Eres el creador de este grupo y por tanto ya formas parte del grupo.';
        }
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
     
                var mediatype = '';
                angular.forEach(item.formaSoporte, function(mt) {
     
                    if(mediatype !== '')
                        mediatype += ', ';
                 
                    mediatype += mt.nombre;
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
                        mediaType: mediatype,
                        authors: authors
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
        $scope.authors = val.authors;
        $scope.source = val.slug;
    };
    
    $scope.getAuthor = function(val) {

        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/autoridad/like?callback=JSON_CALLBACK', {
            params: {
                q: val,
                maxRows: 10,
                lengthName:150
            }
        }).then(function(response){
            return response.data.lista.map(function(item){
     
                var result = {
                        authorName:item.nombre,
                        authorId: item.idAutoridad
                    };
                return result;
            });
        });
    };

    // when select one item on typeahead
    $scope.setAuthorValues = function(val) { // this gets executed when an item is selected
        $scope.authorId = val.authorId;
        $scope.authorName = val.authorName;
        $scope.source = val.authorId;
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
                        themeName:item.nombre, 
                        themeId: item.id
                    };
                return result;
            });
        });
    };
    
    // when select one item on typeahead
    $scope.setThemeValues = function(val) { // this gets executed when an item is selected
        $scope.themeId = val.themeId;
        $scope.themeName = val.themeName;
        $scope.source = val.themeId;
    };
    
    $scope.getUsersLike = function(val) {
        // load users like
        return $http.get('/api/userslike/' + val)
        .then(function(response){
            return response.data.map(function(item){
                var result = {
                        displayName:item.displayName, 
                        userId: item._id,
                        profileImageURL: item.profileImageURL
                    };
                return result;
            });
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
            templateUrl: '/modules/groups/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };

  }
]);


angular.module('groups').filter('mountCover', [function () { 
    return function (uuid) {
        var uuidPath = uuid.replace(/-/g, '').match(/.{1,3}/g).join("/"); 
        return "http://media.cervantesvirtual.com/s3/BVMC_OBRAS/" + uuidPath + "/portada/Cover.jpg";
    };
}]);

angular.module('groups').filter('mountRecord', [function () { 
    return function (slug) {
        return "http://www.cervantesvirtual.com/obra/" + slug + "/";
    };
}]);


