'use strict';

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Groups', 'Booklists', 
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Groups, Booklists) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();
    
    $scope.memberName = '';
    
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
    
    $scope.removeMember = function (item){
        $http({
            url: 'api/groups/removeMember',
            method: "POST",
            data: { 'groupId' :  $scope.group._id,
                    'userId'  :  item.user._id}
        })
        .then(function(response) {
            // success
            $scope.group = response.data;
            $scope.messageok = "Usuario eliminado correctamente.";
        }, 
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
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

    // Find existing Group
    $scope.findOne = function () {
      $scope.group = Groups.get({
        groupId: $stateParams.groupId
      });
    };
    
    $scope.userIsActiveMember = function () {
        
        if ($scope.group && 
            $scope.authentication.user &&
            $scope.group.user &&
            $scope.authentication.user._id === $scope.group.user._id){
            return true;
        }else if($scope.group.status === 'public' && $scope.authentication.user){
            for(var i = 0; i <  $scope.group.members.length; i++) {
                if ( $scope.group.members[i].status === 'activo' && 
                     $scope.group.members[i].user._id === $scope.authentication.user._id) {
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
    
    $scope.addComment = function() {
      
      if ($scope.form.commentForm.$valid) {
       
        $http({
            url: 'api/groups/addComment',
            method: "POST",
            data: { 'message' :  $scope.txtcomment,
                    'groupId' :  $scope.group._id}
        })
        .then(function(response) {
            // success
            $scope.group = Groups.get({
              groupId: $stateParams.groupId
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
            url: 'api/groups/removeComment',
            method: "POST",
            data: { 'groupId' :  $scope.group._id,
                    'commentId'  :  commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.addPendingMember = function() {
      
        var found = false;
        for(var i = 0; i <  $scope.group.members.length; i++) {
            if ($scope.group.members[i].user._id === $scope.authentication.user._id) {
                found = true;
                break;
            }
        }

        if(!found){
            
            $http({
                url: 'api/groups/addPendingMember',
                method: "POST",
                data: { 'groupId' :  $scope.group._id}
            })
            .then(function(response) {
                
                var Indata = {'toUserId': $scope.group.user._id, 
                              'subject': 'Solicitud de admisión para tu grupo',
                              'message': 'El usuario ' + $scope.authentication.user.displayName + ' ha solicitado la admisión a tu grupo. Haz click en el siguiente enlace para aceptar la solicitud desde el apartado miembros.',
                              'url': '/groups/' + $scope.group._id};

                $http.post('api/auth/sendEmail', Indata).success(function (response) {
                    // Show user success message and clear form
                    $scope.success = response.message;

                }).error(function (response) {
                    // Show user error message and clear form
                    $scope.error = response.message;
                });
                
                
                // success
                $scope.messageok = response.data.message;
            }, 
            function(response) { // optional
                // failed
                $scope.error = response.data.message;
            });

        }else{
            $scope.messageok = '';
            $scope.error = 'El administrador del grupo tiene pendiente tu aceptación en el grupo.';
        }
    };
    
    $scope.addMemberByAdminGroup = function(item) {
      
        // if admin group user
        if ($scope.authentication.user._id === $scope.group.user._id) {

            var found = false;
            for(var i = 0; i <  $scope.group.members.length; i++) {
                if ($scope.group.members[i].user._id === item.userId) {
                    found = true;
                    break;
                }
            }

            if(!found){
                
                $http({
                    url: 'api/groups/addGuestMember',
                    method: "POST",
                    data: { 'groupId':  $scope.group._id,
                            'userId' :  item.userId}
                })
                .then(function(response) {
                    
                    var Indata = {'toUserId': item.userId, 
                              'subject': 'Te han invitado a un grupo',
                              'message': 'Te han invitado a un grupo. Haz click en el siguiente enlace para aceptar la invitación.',
                              'url': '/groups/accept/' + $scope.group._id};

                    $http.post('api/auth/sendEmail', Indata).success(function (response) {
                        // Show user success message and clear form
                        $scope.success = response.message;

                    }).error(function (response) {
                        // Show user error message and clear form
                        $scope.error = response.message;
                    });
                    
                    // success
                    $scope.group = response.data;
                    $scope.messageok = "Solicitud enviada. El usuario debe aceptar tu invitación.";
                    $scope.memberName = '';
                }, 
                function(response) { // optional
                    // failed
                    $scope.messageok = '';
                    $scope.error = response.data.message;
                });
                
            }else{
                $scope.messageok = '';
                $scope.error = 'El usuario ' + item.displayName + ' ya forma parte del grupo.';
            }
        }
    };
    
    $scope.activateMember = function(item) {
      
        // if admin group user
        if ($scope.authentication.user._id === $scope.group.user._id) {
            $http({
                url: 'api/groups/setStatusMember',
                method: "POST",
                data: { 'groupId':  $scope.group._id,
                        'userId' :  item.user._id,
                        'status' :  'activo'}
            })
            .then(function(response) {
                // success
                $scope.messageok = "Usuario activado correctamente";
                $scope.group = response.data;
            }, 
            function(response) { // optional
                // failed
                $scope.error = response.data.message;
            });
        }
    };
    
    $scope.deactivateMember = function(item) {
      
        // if admin group user
        if ($scope.authentication.user._id === $scope.group.user._id) {
            
            $http({
                url: 'api/groups/setStatusMember',
                method: "POST",
                data: { 'groupId':  $scope.group._id,
                        'userId' :  item.user._id,
                        'status' : 'inactivo'}
            })
            .then(function(response) {
                // success
                $scope.messageok = "Usuario bloqueado correctamente";
                $scope.group = response.data;
            }, 
            function(response) { // optional
                // failed
                $scope.error = response.data.message;
            });
        }
    };
    
    // Find existing Books in BVMC catalogue
    $scope.getWork = function(val) {

        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
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

        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/autoridad/like?callback=JSON_CALLBACK', {
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
        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/materia/like?callback=JSON_CALLBACK', {
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
            templateUrl: '/modules/groups/client/views/modal-email-form.html',
            controller: ModalGroupEmailInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                groupId: function () {
                    return $scope.group._id;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selectedItem = selectedItem;
            $scope.messageok = selectedItem.message;
            
        }, function () { // user cancel
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
    
    $scope.showReportForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/groups/client/views/modal-report-form.html',
            controller: ModalGroupReportInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                groupId: function () {
                    return $scope.group._id;
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
    
    $scope.showAcceptInvitation = function () {
        
        var found = false;
        for(var i = 0; i <  $scope.group.members.length; i++) {
            if ($scope.group.members[i].user._id === $scope.authentication.user._id) {
                found = true;
                if($scope.group.members[i].status === 'invitado'){
                    
                    $http({
                        url: 'api/groups/activatePublicMember',
                        method: "POST",
                        data: { 'groupId' :  $scope.group._id,
                                'userId': $scope.authentication.user}
                    })
                    .then(function(response) {
                        // success
                        $scope.messageok = response.data.message;
                         $location.path('groups/' + $scope.group._id);
                    }, 
                    function(response) { // optional
                        // failed
                        $scope.error = response.data.message;
                    });
                }else if($scope.group.members[i].status === 'activo'){
                    $scope.error = "El usuario ya se encuentra activo.";
                }
                
                break;
            }
        }
        
        if(!found){
            $scope.error = "El usuario no se encuentra entre los invitados al grupo.";
        }
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




