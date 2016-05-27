'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'angular-cookie-law'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider', 
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;

      // if create publication state and provider wordpress or user is admin
      if(toState.name === 'publications.create'){
          if(Authentication.user.provider === 'wordpress-oauth-server' || 
             Authentication.user.additionalProvidersData.indexOf('wordpress-oauth-server') !== -1 ||
             Authentication.user.roles.indexOf('admin') !== -1){
              allowed = true;
              return true;
          }
      }else{
      
        toState.data.roles.forEach(function (role) {
          if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
            allowed = true;
            return true;
          }
        });
      }
      
      if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.go('forbidden');
          } else {
            $state.go('authentication.signin').then(function () {
              storePreviousState(toState, toParams);
            });
          }
      }
    }  
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('booklists', ['ngTagsInput']);
ApplicationConfiguration.registerModule('booklists.admin', ['core.admin']);
ApplicationConfiguration.registerModule('booklists.admin.routes', ['core.admin.routes']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('groups', ['ui.tinymce']);
ApplicationConfiguration.registerModule('groups.admin', ['core.admin']);
ApplicationConfiguration.registerModule('groups.admin.routes', ['core.admin.routes']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('publications', ['ui.tinymce', "xeditable", "pdf"]);
ApplicationConfiguration.registerModule('publications.admin', ['core.admin']);
ApplicationConfiguration.registerModule('publications.admin.routes', ['core.admin.routes']);


'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reviews', ['ui.tinymce', "xeditable"]);
ApplicationConfiguration.registerModule('reviews.admin', ['core.admin']);
ApplicationConfiguration.registerModule('reviews.admin.routes', ['core.admin.routes']);


'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Setting up route
angular.module('booklists.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.booklists', {
        url: '/booklists',
        templateUrl: 'modules/booklists/client/views/admin/dashboard.list-booklists.client.view.html',
        controller: 'BooklistListController'
      })
      .state('admin.booklist', {
        url: '/booklists/:booklistId',
        templateUrl: 'modules/booklists/client/views/admin/dashboard.view-booklist.client.view.html',
        controller: 'BooklistAdminController',
        resolve: {
          booklistResolve: ['$stateParams', 'Booklists', function ($stateParams, Booklists) {
            return Booklists.get({
              booklistId: $stateParams.booklistId
            });
          }]
        }
      })
      .state('admin.booklist-edit', {
        url: '/booklists/:booklistId/edit',
        templateUrl: 'modules/booklists/client/views/admin/dashboard.edit-booklist.client.view.html',
        controller: 'BooklistAdminController',
        resolve: {
          booklistResolve: ['$stateParams', 'Booklists', function ($stateParams, Booklists) {
            return Booklists.get({
              booklistId: $stateParams.booklistId
            });
          }]
        }
      });
  }
]);

'use strict';

// Configuring the booklists module
angular.module('booklists').run(['Menus',
  function (Menus) {
    // Add the books dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Listas de libros',
      state: 'booklists',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'booklists', {
      title: 'Mis listas',
      state: 'booklists.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'booklists', {
      title: 'Crear Lista',
      state: 'booklists.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('booklists').config(['$stateProvider',
  function ($stateProvider) {
    // booklists state routing
    $stateProvider
      .state('booklists', {
        abstract: true,
        url: '/booklists',
        template: '<ui-view/>'
      })
      .state('booklists.list', {
        url: '',
        templateUrl: 'modules/booklists/client/views/list-booklists.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('booklists.search', {
        url: '/search',
        templateUrl: 'modules/booklists/client/views/pagination-booklists.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('booklists.create', {
        url: '/create',
        templateUrl: 'modules/booklists/client/views/create-booklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('booklists.view', {
        url: '/:booklistId',
        templateUrl: 'modules/booklists/client/views/view-booklist.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('booklists.edit', {
        url: '/:booklistId/edit',
        templateUrl: 'modules/booklists/client/views/edit-booklist.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

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

'use strict';

angular.module('booklists.admin').controller('BooklistListController', ['$scope', '$http', 'Booklists',
  function ($scope, $http, Booklists) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "20", value : "20"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"},
        {text : "Bloqueado", value : "blocked"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = '';
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = '';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        var config = {
            params: query,
            headers : {'Accept' : 'application/json'}
        };            
        
        $http.get('api/admin/booklists', config).then(function(response) {
            // process response here..
            $scope.pagedItems = response.data.booklists;
            $scope.total = response.data.total;
          }, function(response) {
            $scope.error = response.data.message;
        });
    };
  }
]);

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
            $scope.booklist = Booklists.get({
              booklistId: $stateParams.booklistId
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
            url: 'api/booklists/removeComment',
            method: "POST",
            data: { 'booklistId' : $scope.booklist._id,
                    'commentId'  : commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.booklist.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
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
        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
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
ModalBookInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance"];


'use strict';

var ModalBooklistEmailInstanceCtrl = function ($scope, $http, $modalInstance, booklistId) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'email': $scope.form.emailForm.inputEmail.$modelValue, 
                          'subject': $scope.form.emailForm.inputSubject.$modelValue,
                          'message': $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/booklists/' + booklistId};
            
            $http.post('api/auth/sendBooklistEmail', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalBooklistEmailInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "booklistId"];



'use strict';

var ModalBooklistReportInstanceCtrl = function ($scope, $http, $modalInstance, booklistId, displayName) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'subject': 'Denuncia de spam o abuso',
                          'message': 'El usuario ' + displayName + ' ha denunciado un uso incorrecto en Galatea. Ha dejado el siguiente mensaje:' + 
                                  $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/booklists/' + booklistId};
            
            $http.post('api/auth/sendEmailReport', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalBooklistReportInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "booklistId", "displayName"];



'use strict';

angular.module('booklists').controller('ModalConfirmCtrl', ["$scope", "$modalInstance", "text", function ($scope, $modalInstance, text) {

  $scope.text = text;

  $scope.ok = function () {
    $modalInstance.close(true);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('Cancelar');
  };
}]);



'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
'use strict';

angular.module('booklists').controller('BooklistPaginationController', ['$scope', 'Booklists',
  function ($scope, Booklists) {
      
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "30", value : "30"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
        
        Booklists.query(query, function (data) {
            $scope.pagedItems = data[0].booklists;
            $scope.total = data[0].total;
        });
    };
  }
]);

'use strict';

angular.module('booklists').controller('BooklistUserPaginationController', ['$scope', '$http', 'Booklists', 
  function ($scope, $http, Booklists) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "10"},
        {text : "30", value : "30"},
        {text : "45", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.status = '';
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        $http.get('api/booklists/user').success(function (data) {
            $scope.pagedItems = data[0].booklists;
            $scope.total = data[0].total;
        }).error(function (response) {
            $scope.error = response.message;
        });                    
    };
  }
]);

'use strict';

angular.module('booklists').directive('confirm', ["ConfirmService", function(ConfirmService) {
    return {
        restrict: 'A',
        scope: {
            eventHandler: '&ngClick'
        },
        link: function(scope, element, attrs){
          element.unbind("click");
          element.bind("click", function(e) {
            ConfirmService.open(attrs.confirm, scope.eventHandler);
          });
        }
    };
}]);




'use strict';

angular.module('booklists').directive('scrollContainer', ["$window", function($window) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {

            angular.element($window).bind("scroll", function() {

                $('.hideme').each( function(i){

                    var bottom_of_object = $(this).offset().top + $(this).outerHeight();
                    var bottom_of_window = $(window).scrollTop() + $(window).height();

                    /* If the object is completely visible in the window, fade it it */
                    if( bottom_of_window > bottom_of_object ){

                        $(this).animate({'opacity':'1'},500);

                    }
               });
           });
        }
    }
}]);


(function (angular) {
    'use strict';
    function printDirective() {
        var printSection = document.getElementById('printSection');
        // if there is no printing section, create one
        if (!printSection) {
            printSection = document.createElement('div');
            printSection.id = 'printSection';
            document.body.appendChild(printSection);
        }
        function link(scope, element, attrs) {
            element.on('click', function () {
                var elemToPrint = document.getElementById(attrs.printElementId);
                if (elemToPrint) {
                    printElement(elemToPrint);
                }
            });
            window.onafterprint = function () {
                // clean the print section before adding new content
                printSection.innerHTML = '';
            }
        }
        function printElement(elem) {
            // clones the element you want to print
            var domClone = elem.cloneNode(true);
            //domClone.style.display = "block";
            printSection.appendChild(domClone);
            window.print();
        }
        return {
            link: link,
            restrict: 'A'
        };
    }
    angular.module('booklists').directive('ngPrint', [printDirective]);
}(window.angular));
'use strict';

//Booklists service used for communicating with the booklists REST endpoints
angular.module('booklists').factory('Booklists', ['$resource',
  function ($resource) {
    return $resource('api/booklists/:booklistId', {
      booklistId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Booklists service
angular.module('booklists.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/booklists/:booklistId', {
      booklistId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


angular.module('booklists').service('ConfirmService', ["$modal", function($modal) {
  var service = {};
  service.open = function (text, onOk) {
    var modalInstance = $modal.open({
      templateUrl: '/modules/booklists/client/views/confirm.template.html',
      controller: 'ModalConfirmCtrl',
      resolve: {
        text: function () {
          return text;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      onOk();
    }, function () {
    });
  };
  
  return service;
}]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
    
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Dashboard',
      state: 'admin.dashboard',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.dashboard', {
      url: '/dashboard',
      templateUrl: 'modules/core/client/views/admin/dashboard.client.view.html',
      data: {
          roles: ['admin']
        }
      })
      .state('admin.comments', {
      url: '/comments',
      templateUrl: 'modules/core/client/views/admin/dashboard.comments.client.view.html',
      data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('condiciones', {
      url: '/condiciones',
      templateUrl: 'modules/core/client/views/condiciones.client.view.html'
    })
    .state('cookies', {
      url: '/cookies',
      templateUrl: 'modules/core/client/views/cookies.client.view.html'
    })
    .state('faq', {
      url: '/faq',
      templateUrl: 'modules/core/client/views/faq.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', 'Menus',
  function ($scope, $state, $http, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    
    $scope.newComments = 0;
    $scope.totalCommentsReview = 0;
    $scope.totalCommentsGroup = 0;
    $scope.totalCommentsBooklist = 0;
    $scope.totalCommentsPublication = 0;
    
    $scope.numResultsCommentsReview = 10;
    $scope.numResultsCommentsGroup = 10;
    $scope.numResultsCommentsBooklist = 10;
    $scope.numResultsCommentsPublication = 10;
    
    $scope.newReviews = 0;
    $scope.newBooklists = 0;
    $scope.newGroups = 0;
    $scope.newUsers = 0;
    $scope.newPublications = 0;
    $scope.totalUsers = 0;
    $scope.totalReviews = 0;
    
    $scope.getReviewComments = function() {
      $http.get('/api/comments/reviews/results/' + $scope.numResultsCommentsReview)
      .success(function (response) {
            $scope.commentsReview = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getGroupComments = function() {
      
      $http.get('/api/comments/groups/results/' + $scope.numResultsCommentsGroup)
      .success(function (response) {
            $scope.commentsGroup = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getBooklistComments = function() {
      $http.get('/api/comments/booklists/results/' + $scope.numResultsCommentsBooklist)
      .success(function (response) {
            $scope.commentsBooklist = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getPublicationComments = function() {
      $http.get('/api/comments/publications/results/' + $scope.numResultsCommentsPublication)
      .success(function (response) {
            $scope.commentsPublication = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsReview = function() {
      
      $http.get('/api/comments/reviews/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsReview = response[0].total;
            $scope.newComments += $scope.totalCommentsReview;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsPublication = function() {
      
      $http.get('/api/comments/publications/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsPublication = response[0].total;
            $scope.newComments += $scope.totalCommentsPublication;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };    
    
    $scope.getTotalCommentsGroup = function() {
      
      $http.get('/api/comments/groups/').success(function (response) {
          if(!angular.isUndefined(response[0])){
            $scope.totalCommentsGroup = response[0].total;
            $scope.newComments += $scope.totalCommentsGroup;
          }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalCommentsBooklist = function() {
      
        $http.get('/api/comments/booklists/').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalCommentsBooklist = response[0].total;
                $scope.newComments += $scope.totalCommentsBooklist;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getTotalComments = function() {
        $scope.getTotalCommentsReview();
        $scope.getTotalCommentsBooklist();
        $scope.getTotalCommentsGroup();
        $scope.getTotalCommentsPublication();
    }
    
    $scope.getNewsReviews = function() {
      
        $http.get('/api/reviews/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newReviews = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsBooklists = function() {
      
        $http.get('/api/booklists/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newBooklists = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsGroups = function() {
      
        $http.get('/api/groups/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newGroups = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getNewsPublications = function() {
      
        $http.get('/api/publications/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newPublications = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }    
    
    $scope.getNewsUsers = function() {
      
        $http.get('/api/users/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    }
    
    $scope.getTotalUsers = function() {
      
      $http.get('/api/users/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getTotalReviews = function() {
      
      $http.get('/api/reviews/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalReviews = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    

    //call methods
    
    $scope.getNewsReviews();
    $scope.getTotalReviews();
    
    $scope.getNewsBooklists();
    $scope.getNewsGroups();
    $scope.getNewsPublications();
    
    $scope.getNewsUsers();
    $scope.getTotalUsers();
    
    $scope.getTotalComments();
    $scope.getReviewComments();
    $scope.getBooklistComments();
    $scope.getGroupComments();
    $scope.getPublicationComments();
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    
    $scope.showPublicationMenu = function () {
        
        if($scope.authentication.user)
            if($scope.authentication.user.provider === 'wordpress-oauth-server' || 
                ($scope.authentication.user.additionalProvidersData !== undefined &&
                 $scope.authentication.user.additionalProvidersData.length > 0 &&
                 $scope.authentication.user.additionalProvidersData.indexOf('wordpress-oauth-server') >= 0) || 
                ($scope.authentication.user.roles.indexOf('admin') >= 0)) {
                return true;
            }
        return false;
    }
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    
    $scope.numResultsCommentsReview = 3;
    $scope.numResultsCommentsGroup = 3;
    $scope.numResultsCommentsBooklist = 3;
    
    $scope.getReviewComments = function() {
      $http.get('/api/comments/reviews/results/' + $scope.numResultsCommentsReview)
      .success(function (response) {
            $scope.commentsReview = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getGroupComments = function() {
      
      $http.get('/api/comments/groups/results/' + $scope.numResultsCommentsGroup)
      .success(function (response) {
            $scope.commentsGroup = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getBooklistComments = function() {
      $http.get('/api/comments/booklists/results/' + $scope.numResultsCommentsBooklist)
      .success(function (response) {
            $scope.commentsBooklist = response;
      }).error(function (response) {
            $scope.error = response.message;
      });
    };  
    
    $scope.init = function() {
      $scope.getReviewComments();
      //$scope.getBooklistComments();
      //$scope.getGroupComments();
    };
  }
]);

'use strict';

angular.module('core')
  .directive('footerGeneric', footerGeneric);

function footerGeneric () {
    return {
        restrict: 'EA',
        templateUrl: '/modules/core/client/views/footer.client.view.html'
    };
}



'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Setting up route
angular.module('groups.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.groups', {
        url: '/groups',
        templateUrl: 'modules/groups/client/views/admin/dashboard.list-groups.client.view.html',
        controller: 'GroupListController'
      })
      .state('admin.group', {
        url: '/groups/:groupId',
        templateUrl: 'modules/groups/client/views/admin/dashboard.view-group.client.view.html',
        controller: 'GroupAdminController',
        resolve: {
          groupResolve: ['$stateParams', 'Groups', function ($stateParams, Groups) {
            return Groups.get({
              groupId: $stateParams.groupId
            });
          }]
        }
      })
      .state('admin.group-edit', {
        url: '/groups/:groupId/edit',
        templateUrl: 'modules/groups/client/views/admin/dashboard.edit-group.client.view.html',
        controller: 'GroupAdminController',
        resolve: {
          groupResolve: ['$stateParams', 'Groups', function ($stateParams, Groups) {
            return Groups.get({
              groupId: $stateParams.groupId
            });
          }]
        }
      });
  }
]);

'use strict';

// Configuring the reviews module
angular.module('groups').run(['Menus',
  function (Menus) {
    // Add the review dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Grupos',
      state: 'groups',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'groups', {
      title: 'Mis grupos',
      state: 'groups.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'groups', {
      title: 'Crear Grupo',
      state: 'groups.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('groups').config(['$stateProvider',
  function ($stateProvider) {
    // groups state routing
    $stateProvider
      .state('groups', {
        abstract: true,
        url: '/groups',
        template: '<ui-view/>'
      })
      .state('groups.list', {
        url: '',
        templateUrl: 'modules/groups/client/views/list-groups.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.search', {
        url: '/search',
        templateUrl: 'modules/groups/client/views/pagination-groups.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('groups.create', {
        url: '/create',
        templateUrl: 'modules/groups/client/views/create-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.accept', {
        url: '/accept/:groupId',
        templateUrl: 'modules/groups/client/views/accept-group.client.view.html',
        data: {
          roles: ['user']
        }
      })
      .state('groups.view', {
        url: '/:groupId',
        templateUrl: 'modules/groups/client/views/view-group.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('groups.edit', {
        url: '/:groupId/edit',
        templateUrl: 'modules/groups/client/views/edit-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

angular.module('groups.admin').controller('GroupAdminController', ['$scope', '$state', '$http', 'Authentication', 'groupResolve',
  function ($scope, $state, $http, Authentication, groupResolve) {
    $scope.authentication = Authentication;
    $scope.group = groupResolve;
    
    $scope.remove = function (group) {
      if (confirm('¿Estás seguro que desea eliminar el grupo?')) {
        if (group) {
          group.$remove();

          $scope.groups.splice($scope.groups.indexOf(group), 1);
        } else {
          $scope.group.$remove(function () {
            $state.go('admin.groups');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'groupForm');

        return false;
      }

      var group = $scope.group;
      
      group.$update(function () {
        $state.go('admin.group', {
          groupId: group._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/groups/removeComment',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'commentId': commentId}
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
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/groups/updateComment',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
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
            url: 'api/admin/groups/setStatus',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/groups/setStatus',
            method: "POST",
            data: { 'groupId' : $scope.group._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.group.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.activateMember = function(item) {
        $http({
            url: 'api/admin/groups/setStatusMember',
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
    };
    
    $scope.deactivateMember = function(item) {
        $http({
            url: 'api/admin/groups/setStatusMember',
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
    
    $scope.addMemberByAdminGroup = function(item) {
      
        var found = false;
        for(var i = 0; i <  $scope.group.members.length; i++) {
            if ($scope.group.members[i].user._id === item.userId) {
                found = true;
                break;
            }
        }

        if(!found){

            $http({
                url: 'api/admin/groups/addGuestMember',
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
    };
    
    $scope.removeMember = function (item){
        $http({
            url: 'api/admin/groups/removeMember',
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
  }
]);

'use strict';

angular.module('groups.admin').controller('GroupListController', ['$scope', '$http', 'Groups',
  function ($scope, $http, Groups) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "20", value : "20"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"},
        {text : "Bloqueado", value : "blocked"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = '';
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = '';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        var config = {
            params: query,
            headers : {'Accept' : 'application/json'}
        };            
        
        $http.get('api/admin/groups', config).then(function(response) {
            // process response here..
            $scope.pagedItems = response.data.groups;
            $scope.total = response.data.total;
          }, function(response) {
            $scope.error = response.data.message;
        });
    };
  }
]);

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
            $http.get('/api/booklists/user')
                .success(function(data) {
                    $scope.booklists = data[0].booklists;
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





'use strict';

// controller for modal email window
var ModalGroupEmailInstanceCtrl = function ($scope, $http, $modalInstance, groupId) {
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
            var Indata = {'email': $scope.form.emailForm.inputEmail.$modelValue, 
                          'subject': $scope.form.emailForm.inputSubject.$modelValue,
                          'message': $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/groups/' + groupId};
            
            $http.post('api/auth/sendGroupEmail', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error por favor rellene todos los campos.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalGroupEmailInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "groupId"];



'use strict';

var ModalGroupReportInstanceCtrl = function ($scope, $http, $modalInstance, groupId, displayName) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'subject': 'Denuncia de spam o abuso',
                          'message': 'El usuario ' + displayName + ' ha denunciado un uso incorrecto en Galatea. Ha dejado el siguiente mensaje:' + 
                                  $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/groups/' + groupId};
            
            $http.post('api/auth/sendEmailReport', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalGroupReportInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "groupId", "displayName"];



'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
'use strict';

angular.module('groups').controller('GroupPaginationController', ['$scope', 'Groups',
  function ($scope, Groups) {
      
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "30", value : "30"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.type = '';
        $scope.find();
    };
    
    $scope.initTypeObra = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.type = 'obra';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      type:$scope.type,
                      text:$scope.text
                    };
        
        Groups.query(query, function (data) {
            $scope.pagedItems = data[0].groups;
            $scope.total = data[0].total;
        });
    };
  }
]);

'use strict';

angular.module('booklists').controller('GroupUserPaginationController', ['$scope', '$http', 'Groups', 
  function ($scope, $http, Groups) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "10"},
        {text : "30", value : "30"},
        {text : "45", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.status = '';
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        $http.get('api/groups/user').success(function (data) {
            $scope.pagedItems = data[0].groups;
            $scope.total = data[0].total;
        }).error(function (response) {
            $scope.error = response.message;
        });                    
    };
  }
]);

'use strict';

//Groups service used for communicating with the categories REST endpoints
angular.module('groups').factory('Groups', ['$resource',
  function ($resource) {
    return $resource('api/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Groups service
angular.module('groups.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Setting up route
angular.module('publications.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.publications', {
        url: '/publications',
        templateUrl: 'modules/publications/client/views/admin/dashboard.list-publications.client.view.html',
        controller: 'PublicationListController'
      })
      .state('admin.publication', {
        url: '/publications/:publicationId',
        templateUrl: 'modules/publications/client/views/admin/dashboard.view-publication.client.view.html',
        controller: 'PublicationAdminController',
        resolve: {
          publicationResolve: ['$stateParams', 'Publications', function ($stateParams, Publications) {
            return Publications.get({
              publicationId: $stateParams.publicationId
            });
          }]
        }
      })
      .state('admin.publication-edit', {
        url: '/publications/:publicationId/edit',
        templateUrl: 'modules/publications/client/views/admin/dashboard.edit-publication.client.view.html',
        controller: 'PublicationAdminController',
        resolve: {
          publicationResolve: ['$stateParams', 'Publications', function ($stateParams, Publications) {
            return Publications.get({
              publicationId: $stateParams.publicationId
            });
          }]
        }
      });
  }
]);

'use strict';

// Configuring the publications module
angular.module('publications').run(['Menus',
  function (Menus) {
    // Add the publication dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Publicaciones',
      state: 'publications',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'publications', {
      title: 'Mis publicaciones',
      state: 'publications.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'publications', {
      title: 'Crear Publicación',
      state: 'publications.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('publications').config(['$stateProvider',
  function ($stateProvider) {
    // publications state routing
    $stateProvider
      .state('publications', {
        abstract: true,
        url: '/publications',
        template: '<ui-view/>'
      })
      .state('publications.list', {
        url: '',
        templateUrl: 'modules/publications/client/views/list-publications.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.search', {
        url: '/search',
        templateUrl: 'modules/publications/client/views/pagination-publications.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.create', {
        url: '/create',
        templateUrl: 'modules/publications/client/views/create-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.view', {
        url: '/:publicationId',
        templateUrl: 'modules/publications/client/views/view-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('publications.edit', {
        url: '/:publicationId/edit',
        templateUrl: 'modules/publications/client/views/edit-publication.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

angular.module('publications.admin').controller('PublicationListController', ['$scope', '$http', 'Publications',
  function ($scope, $http, Publications) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "20", value : "20"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"},
        {text : "Bloqueado", value : "blocked"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = '';
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = '';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        var config = {
            params: query,
            headers : {'Accept' : 'application/json'}
        };            
        
        $http.get('api/admin/publications', config).then(function(response) {
            // process response here..
            $scope.pagedItems = response.data.publications;
            $scope.total = response.data.total;
          }, function(response) {
            $scope.error = response.data.message;
        });
    };
  }
]);

'use strict';
angular.module('publications.admin').run(["editableOptions", function (editableOptions) {editableOptions.theme = 'bs3'; }]);

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

'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
'use strict';

// controller for modal email window
var ModalPublicationEmailInstanceCtrl = function ($scope, $http, $modalInstance, publicationId) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'email': $scope.form.emailForm.inputEmail.$modelValue, 
                          'subject': $scope.form.emailForm.inputSubject.$modelValue,
                          'message': $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/publications/' + publicationId};
            
            $http.post('api/auth/sendPublicationEmail', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Por favor complete todos los campos.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalPublicationEmailInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "publicationId"];



'use strict';

var ModalPublicationReportInstanceCtrl = function ($scope, $http, $modalInstance, publicationId, displayName) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'subject': 'Denuncia de spam o abuso',
                          'message': 'El usuario ' + displayName + ' ha denunciado un uso incorrecto en Galatea. Ha dejado el siguiente mensaje:' + 
                                  $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/publications/' + publicationId};
            
            $http.post('api/auth/sendEmailReport', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalPublicationReportInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "publicationId", "displayName"];



'use strict';

angular.module('publications').controller('PublicationPaginationController', ['$scope', 'Publications',
  function ($scope, Publications) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "15"},
        {text : "30", value : "30"},
        {text : "45", value : "45"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
        
        Publications.query(query, function (data) {
            $scope.pagedItems = data[0].publications;
            $scope.total = data[0].total;
        });
    };
  }
]);

'use strict';

angular.module('publications').controller('PublicationUserPaginationController', ['$scope', '$http', 'Publications', 
  function ($scope, $http, Publications) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "15"},
        {text : "30", value : "30"},
        {text : "45", value : "45"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.status = '';
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        $http.get('api/publications/user').success(function (data) {
            $scope.pagedItems = data[0].publications;
            $scope.total = data[0].total;
        }).error(function (response) {
            $scope.error = response.message;
        });                    
    };
  }
]);

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


'use strict';

angular.module('publications').controller('UploadPublicationController', ['$scope', '$timeout', '$window', '$location', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, $location, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.fileUrl = "";
    $scope.title = "";
    $scope.content = "";
    
    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/publications',
      alias: 'newPublication'
    });

    // Set file uploader pdf filter
    $scope.uploader.filters.push({
      name: 'pdfFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        if('|pdf|'.indexOf(type) === -1)
            $scope.error = "Debe seleccionar un fichero con extensión pdf";
        return '|pdf|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      $scope.error = "";  
      console.log('viene a onAfterAddingFile');
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.fileUrl = fileReaderEvent.target.result; 
          }, 0);
        };
      }
    };
    
    $scope.uploader.onBeforeUploadItem = function (fileItem) {
        console.log('onBeforeUploadItem empieza');
        var formData = [{
            title: $scope.title,
            content: $scope.content
        }];
        Array.prototype.push.apply(fileItem.formData, formData);
        console.log('onBeforeUploadItem termina');
    };
     

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      //$scope.user = Authentication.user = response;
      
      console.log('viene a onSuccessItem:' + response._id);

      // Clear upload buttons
      $scope.cancelUpload();
      
      $location.path('publications/' + response._id);
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();
      console.log('viene a onErrorItem');

      // Show error message
      $scope.error = response.message;
    };
    
    // Change user profile picture
    $scope.uploadFilePublication = function () {
      // Clear messages
      $scope.success = $scope.error = null;
      console.log('viene por uploadFilePublication');
      
      if($scope.title === "")
          $scope.error = "Por favor añade un título a la publicación";
      else if($scope.content === "")
          $scope.error = "Por favor añade una descripción a la publicación";
      else{
          // Start upload
          $scope.uploader.uploadAll();
      }
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.fileUrl = "";
    };
    
  }
]);

  'use strict';
  
  angular.module('publications').directive('myPdfViewerToolbar', [
     'pdfDelegate',
  function(pdfDelegate) {
    return {
       restrict: 'E',
       template:
        '<div class="clearfix mb2 white bg-blue">' +
          '<div class="left">' +
            '<a href=""' +
              'ng-click="prev()"' +
              'class="btn btn-danger"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i> Anterior' +
            '</a>&nbsp;&nbsp;' +
            '<a href=""' +
              'ng-click="next()"' +
              'class="btn btn-danger">Siguiente <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>' +
            '</a>&nbsp;&nbsp;' +
            '&nbsp;&nbsp;&nbsp;&nbsp;<span class="px1">Página</span> ' +
            '<input type="text" class="field-dark" ' +
              'min=1 ng-model="currentPage" ng-change="goToPage()" ' +
              'style="width: 10%"> ' +
            '&nbsp;&nbsp;&nbsp;&nbsp;<a href=""' + 
              'ng-click="zoomIn()"' +
              'class="btn btn-danger">Ampliar <i class="fa fa-search-plus" aria-hidden="true"></i>' +
            '</a>&nbsp;&nbsp;' +
            '<a href=""' + 
              'ng-click="zoomOut()"' +
              'class="btn btn-danger">Reducir <i class="fa fa-search-minus" aria-hidden="true"></i>' +
            '</a>' +
            //' / {{pageCount}}' +
          '</div>' +
        '</div>',
       scope: { pageCount: '=' },
       link: function(scope, element, attrs) {
         var id = attrs.delegateHandle;
         scope.currentPage = 1;

        scope.prev = function() {
          pdfDelegate
            .$getByHandle(id)
            .prev();
          updateCurrentPage();
        };
        scope.next = function() {
          pdfDelegate
            .$getByHandle(id)
            .next();
          updateCurrentPage();
        };
        scope.goToPage = function() {
          pdfDelegate
             .$getByHandle(id)
             .goToPage(scope.currentPage);
        };
        scope.zoomIn = function() {
          pdfDelegate
             .$getByHandle(id)
             .zoomIn();
        };
        scope.zoomOut = function() {
          pdfDelegate
             .$getByHandle(id)
             .zoomOut();
        };

        var updateCurrentPage = function() {
          scope.currentPage = pdfDelegate
                                .$getByHandle(id)
                                 .getCurrentPage();
        };
      }
    };
}]);


'use strict';

//Publications service used for communicating with the categories REST endpoints
angular.module('publications').factory('Publications', ['$resource',
  function ($resource) {
    return $resource('api/publications/:publicationId', {
      publicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Publications service
angular.module('publications.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/publications/:publicationId', {
      publicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Setting up route
angular.module('reviews.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.reviews', {
        url: '/reviews',
        templateUrl: 'modules/reviews/client/views/admin/dashboard.list-reviews.client.view.html',
        controller: 'ReviewListController'
      })
      .state('admin.review', {
        url: '/reviews/:reviewId',
        templateUrl: 'modules/reviews/client/views/admin/dashboard.view-review.client.view.html',
        controller: 'ReviewAdminController',
        resolve: {
          reviewResolve: ['$stateParams', 'Reviews', function ($stateParams, Reviews) {
            return Reviews.get({
              reviewId: $stateParams.reviewId
            });
          }]
        }
      })
      .state('admin.review-edit', {
        url: '/reviews/:reviewId/edit',
        templateUrl: 'modules/reviews/client/views/admin/dashboard.edit-review.client.view.html',
        controller: 'ReviewAdminController',
        resolve: {
          reviewResolve: ['$stateParams', 'Reviews', function ($stateParams, Reviews) {
            return Reviews.get({
              reviewId: $stateParams.reviewId
            });
          }]
        }
      });
  }
]);

'use strict';

// Configuring the reviews module
angular.module('reviews').run(['Menus',
  function (Menus) {
    // Add the review dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Reseñas',
      state: 'reviews',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reviews', {
      title: 'Mis reseñas',
      state: 'reviews.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reviews', {
      title: 'Crear Reseña',
      state: 'reviews.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('reviews').config(['$stateProvider',
  function ($stateProvider) {
    // reviews state routing
    $stateProvider
      .state('reviews', {
        abstract: true,
        url: '/reviews',
        template: '<ui-view/>'
      })
      .state('reviews.list', {
        url: '',
        templateUrl: 'modules/reviews/client/views/list-reviews.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.search', {
        url: '/search',
        templateUrl: 'modules/reviews/client/views/pagination-reviews.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('reviews.uuid', {
        url: '/uuid/:uuid',
        templateUrl: 'modules/reviews/client/views/list-reviews-uuid.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('reviews.create', {
        url: '/create',
        templateUrl: 'modules/reviews/client/views/create-review.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.view', {
        url: '/:reviewId',
        templateUrl: 'modules/reviews/client/views/view-review.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('reviews.edit', {
        url: '/:reviewId/edit',
        templateUrl: 'modules/reviews/client/views/edit-review.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

angular.module('reviews.admin').controller('ReviewListController', ['$scope', '$http', 'Reviews',
  function ($scope, $http, Reviews) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "20", value : "20"},
        {text : "50", value : "50"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"},
        {text : "Bloqueado", value : "blocked"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = '';
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        var config = {
            params: query,
            headers : {'Accept' : 'application/json'}
        };            
        
        $http.get('api/admin/reviews', config).then(function(response) {
            // process response here..
            $scope.pagedItems = response.data.reviews;
            $scope.total = response.data.total;
          }, function(response) {
            $scope.error = response.data.message;
        });
    };
  }
]);

'use strict';
angular.module('reviews.admin').run(["editableOptions", function (editableOptions) {editableOptions.theme = 'bs3'; }]);

angular.module('reviews.admin').controller('ReviewAdminController', ['$scope', '$state', '$http', 'Authentication', 'reviewResolve',
  function ($scope, $state, $http, Authentication, reviewResolve) {
    $scope.authentication = Authentication;
    $scope.review = reviewResolve;
    
    $scope.remove = function (review) {
      if (confirm('¿Estás seguro que desea eliminar la reseña?')) {
        if (review) {
          review.$remove();

          $scope.reviews.splice($scope.groups.indexOf(review), 1);
        } else {
          $scope.review.$remove(function () {
            $state.go('admin.reviews');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reviewForm');

        return false;
      }

      var review = $scope.review;
      
      review.$update(function () {
        $state.go('admin.review', {
          reviewId: review._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.removeComment = function (commentId, index){
        
        $http({
            url: 'api/admin/reviews/removeComment',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.updateComment = function (commentId, data){
        
        $http({
            url: 'api/admin/reviews/updateComment',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
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
            url: 'api/admin/reviews/setStatus',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'status' : 'blocked'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.status = 'blocked';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
    
    $scope.setPublic = function (){
        
        $http({
            url: 'api/admin/reviews/setStatus',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'status' : 'public'}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.status = 'public';
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };
  }
]);

'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalHelpInstanceCtrl.$inject = ["$scope", "$modalInstance"];
'use strict';

// controller for modal email window
var ModalReviewEmailInstanceCtrl = function ($scope, $http, $modalInstance, reviewId) {
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
            
            var Indata = {'email': $scope.form.emailForm.inputEmail.$modelValue, 
                          'subject': $scope.form.emailForm.inputSubject.$modelValue,
                          'message': $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/reviews/' + reviewId};
            
            $http.post('api/auth/sendReviewEmail', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Por favor complete todos los campos.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalReviewEmailInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "reviewId"];



'use strict';

var ModalReviewReportInstanceCtrl = function ($scope, $http, $modalInstance, reviewId, displayName) {
    $scope.result = 'hidden';
    $scope.resultMessage = '';
    $scope.formData = ''; //formData is an object holding the name, email, subject, and message
    $scope.submitButtonDisabled = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
    
    $scope.submit = function(contactform) {
        $scope.submitted = true;
        $scope.submitButtonDisabled = true;
        if (contactform.$valid) {
            
            var Indata = {'subject': 'Denuncia de spam o abuso',
                          'message': 'El usuario ' + displayName + ' ha denunciado un uso incorrecto en Galatea. Ha dejado el siguiente mensaje:' + 
                                  $scope.form.emailForm.inputMessage.$modelValue,
                          'url': '/reviews/' + reviewId};
            
            $http.post('api/auth/sendEmailReport', Indata).success(function (response) {
                // Show user success message and clear form
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.error = response.message;
            });
            
            $modalInstance.close($scope.result);
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalReviewReportInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance", "reviewId", "displayName"];



'use strict';

angular.module('reviews').controller('ReviewPaginationController', ['$scope', 'Reviews',
  function ($scope, Reviews) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "15"},
        {text : "30", value : "30"},
        {text : "45", value : "45"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.status = 'public';
        $scope.order = 'desc';
        $scope.find();
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
        
        Reviews.query(query, function (data) {
            $scope.pagedItems = data[0].reviews;
            $scope.total = data[0].total;
        });
    };
  }
]);

'use strict';

angular.module('reviews').controller('ReviewUserPaginationController', ['$scope', '$http', 'Reviews', 
  function ($scope, $http, Reviews) {
    
    $scope.searchIsCollapsed = true;
      
    $scope.optionsItemsPage = [
        {text : "15", value : "15"},
        {text : "30", value : "30"},
        {text : "45", value : "45"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Borrador", value : "draft"},
        {text : "Publicado", value : "public"}
    ];
      
    $scope.init = function(itemsPerPage){
        $scope.status = '';
        $scope.pagedItems = [];
        $scope.itemsPerPage = itemsPerPage;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.pageChanged = function () {
        $scope.find();
    };
    
    $scope.find = function () {
        
        var query = { page:$scope.currentPage,
                      itemsPerPage:$scope.itemsPerPage,
                      order:$scope.order,
                      status:$scope.status,
                      text:$scope.text
                    };
                    
        $http.get('api/reviews/user').success(function (data) {
            $scope.pagedItems = data[0].reviews;
            $scope.total = data[0].total;
        }).error(function (response) {
            $scope.error = response.message;
        });                    
    };
  }
]);

'use strict';

// Reviews controller
angular.module('reviews').controller('ReviewsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Reviews', 'Groups',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Reviews, Groups) {
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

    // rating variables
    $scope.max = 5;
    $scope.rate = 0;
    $scope.percent = 0;
    $scope.showRatingBar = false;
    $scope.showRatingButton = true;
    
    $scope.tinymceOptions = {
        language_url : 'modules/reviews/client/language-tinymce/es.js' 
    };
    
    $scope.createGroupFromReview = function () {
        // Create new Group object
        var group = new Groups({
            name: $scope.review.title,
            content: $scope.review.content,
            type: "obra",
            source: $scope.review.identifierWork,
            uuid: $scope.review.uuid,
            reproduction: $scope.review.reproduction,
            title: $scope.review.title
        });

        // Redirect after save
        group.$save(function (response) {
            $location.path('groups/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
        });
    };
    
    // Create new Review
    $scope.create = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'reviewForm');

            return false;
        }

        // Create new Review object
        var review = new Reviews({
            title: this.title,
            content: this.content,
            identifierWork: $scope.identifierWork,
            slug: $scope.slug,
            uuid: $scope.uuid,
            reproduction: $scope.reproduction,
            language: $scope.language,
            mediaType: $scope.mediaType, 
            authors: $scope.authors
        });

        // Redirect after save
        review.$save(function (response) {
            $location.path('reviews/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.content = '';
            $scope.identifierWork = '';
            $scope.slug = '';
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
    $scope.remove = function (review) {
        if (review) {
            review.$remove();

            for (var i in $scope.reviews) {
                if ($scope.reviews[i] === review) {
                    $scope.reviews.splice(i, 1);
                }
            }
        } else {
            $scope.review.$remove(function () {
                $location.path('reviews');
            });
        }
    };

    // Update existing Review
    $scope.update = function (isValid) {
        $scope.error = null;

        if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'reviewForm');

            return false;
        }

        var review = $scope.review;

        review.$update(function () {
            $scope.messageok = 'La reseña se ha modificado correctamente.';
            $location.path('reviews/' + review._id);
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    $scope.showList = function(){
        $location.path('reviews');
    };

    $scope.openReview = function(reviewId) {
        $location.path('reviews/' + reviewId);
    };

    // Find the list of Reviews of the user
    $scope.find = function () {
        $scope.reviews = Reviews.query();
    };
    
    // Find the list of Reviews by uuid
    $scope.findByUuid = function () {
        $http.get('api/reviews/uuid/' + $stateParams.uuid).success(function (response) {
            $scope.reviews = response;
            $scope.getWorkJson();
        }).error(function (response) {
            $scope.error = response.message;
        });
    };

    // Set update review
    $scope.updateReview = function () {
        $scope.review.$update(function () {
            $scope.messageok = 'La reseña se ha modificado correctamente.';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find existing Review
    $scope.findOne = function () {
      $scope.review = Reviews.get({
        reviewId: $stateParams.reviewId
      });
    };

    // update review status draft
    $scope.setDraftStatus = function () {
      $scope.review.status = "draft";
      
      $scope.review.$update(function () {
          $scope.messageok = 'La reseña se ha cambiado a estado borrador.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };

    // update review status public
    $scope.setPublicStatus = function () {
      $scope.review.status = "public";
      
      $scope.review.$update(function () {
          $scope.messageok = 'La reseña se ha publicado correctamente.';
      }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
      });
    };
    
    $scope.checkRatingBar = function (){
        $scope.showRatingBar = true;
        if ($scope.showRatingButton && 
                !angular.isUndefined($scope.review) && 
                !angular.isUndefined($scope.review.ratings)){
            angular.forEach($scope.review.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces la misma reseña";
                }
            });
        }
    };

    $scope.$watch('rate', function(value) {
        if(!angular.isUndefined($scope.review) && value > 0){
            $http({
                url: 'api/reviews/addRating',
                method: "POST",
                data: { 'rate' :  value,
                        'reviewId' :  $scope.review._id}
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

    $scope.addComment = function() {
      
      if ($scope.form.commentForm.$valid) {
        
        $http({
            url: 'api/reviews/addComment',
            method: "POST",
            data: { 'message' :  $scope.txtcomment,
                    'reviewId' :  $scope.review._id}
        })
        .then(function(response) {
            // success
            $scope.review = Reviews.get({
              reviewId: $stateParams.reviewId
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
            url: 'api/reviews/removeComment',
            method: "POST",
            data: { 'reviewId' : $scope.review._id,
                    'commentId': commentId}
        })
        .then(function(response) {
            // success
            $scope.messageok = response.data.message;
            $scope.review.comments.splice(index, 1);
        },
        function(response) { // optional
            // failed
            $scope.messageok = '';
            $scope.error = response.data.message;
        });
    };

     // Find existing Book by uuid in BVMC catalogue 
    $scope.getWorkJson = function() {

        return $http.jsonp('//app.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/getJson?callback=JSON_CALLBACK', {
            params: {
                uuid: $stateParams.uuid
            }
        }).then(function(response){
            return response.data.map(function(item){
     
                var mediaType = '';
                angular.forEach(item.formaSoporte, function(mt) {
     
                    if(mediaType !== '')
                        mediaType += ', ';
                 
                    mediaType += mt.nombre;
                });
                
                var authors = '';
                angular.forEach(item.autores, function(author) {
     
                    if(authors !== '')
                        authors += '. ';
                 
                    authors += author.nombre;
                });
                
                $scope.identifierWork = item.idEntidadDocumental;
                $scope.slug = item.slug;
                $scope.uuid = item.uuid;
                $scope.reproduction = item.reproduccion;
                $scope.title = item.titulo;
                $scope.language = item.idioma;
                $scope.mediaType = mediaType;
                $scope.authors = authors;
            });
        });
    };

    // Find existing Books in BVMC catalogue
    $scope.getWorkLike = function(val) {

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
    };

    $scope.showEmailForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/reviews/client/views/modal-email-form.html',
            controller: ModalReviewEmailInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                reviewId: function () {
                    return $scope.review._id;
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
            templateUrl: '/modules/reviews/client/views/modal-report-form.html',
            controller: ModalReviewReportInstanceCtrl,
            scope: $scope,
            resolve: {
                emailForm: function () {
                    return $scope.emailForm;
                },
                reviewId: function () {
                    return $scope.review._id;
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
            templateUrl: '/modules/reviews/client/views/modal-help-information.html',
            controller: ModalHelpInstanceCtrl,
            scope: $scope
       });
    };

  }
]);

angular.module('reviews').filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}]);

angular.module('reviews').filter('htmlLimit', ['$sce', function ($sce) { 
    return function (text, limit) {
        if(text && limit && text.length > limit)
          text = text.substring(0, limit) + '...';
        return $sce.trustAsHtml(text);
    };    
}]);




'use strict';

angular.module('reviews')
  .directive('flip', flip);

function flip() {
  return {
    restrict : "A",
    scope: true,
    link: function(scope, element) {
      var $panels = element.css({ position: 'relative' }).children().addClass("flip-panel");  
      var frontPanel = $panels.eq(0);
      var backPanel = $panels.eq(1);

      scope.showFrontPanel = function() {
        frontPanel.removeClass("flip-hide-front-panel");
        backPanel.addClass("flip-hide-back-panel");
      };
      
      scope.showBackPanel = function() {
        backPanel.removeClass("flip-hide-back-panel");
        frontPanel.addClass("flip-hide-front-panel");
      };
            
      scope.showFrontPanel();
    }
  };
}

tinymce.addI18n('es',{
"Cut": "Cortar",
"Heading 5": "Encabezado 5",
"Header 2": "Encabezado 2 ",
"Your browser doesn't support direct access to the clipboard. Please use the Ctrl+X\/C\/V keyboard shortcuts instead.": "Tu navegador no soporta acceso directo al portapapeles. Por favor usa las teclas Crtl+X\/C\/V de tu teclado",
"Heading 4": "Encabezado 4",
"Div": "Capa",
"Heading 2": "Encabezado 2",
"Paste": "Pegar",
"Close": "Cerrar",
"Font Family": "Familia de fuentes",
"Pre": "Pre",
"Align right": "Alinear a la derecha",
"New document": "Nuevo documento",
"Blockquote": "Bloque de cita",
"Numbered list": "Lista numerada",
"Heading 1": "Encabezado 1",
"Headings": "Encabezados",
"Increase indent": "Incrementar sangr\u00eda",
"Formats": "Formatos",
"Headers": "Encabezados",
"Select all": "Seleccionar todo",
"Header 3": "Encabezado 3",
"Blocks": "Bloques",
"Undo": "Deshacer",
"Strikethrough": "Tachado",
"Bullet list": "Lista de vi\u00f1etas",
"Header 1": "Encabezado 1",
"Superscript": "Super\u00edndice",
"Clear formatting": "Limpiar formato",
"Font Sizes": "Tama\u00f1os de fuente",
"Subscript": "Sub\u00edndice",
"Header 6": "Encabezado 6",
"Redo": "Rehacer",
"Paragraph": "P\u00e1rrafo",
"Ok": "Ok",
"Bold": "Negrita",
"Code": "C\u00f3digo",
"Italic": "It\u00e1lica",
"Align center": "Alinear al centro",
"Header 5": "Encabezado 5 ",
"Heading 6": "Encabezado 6",
"Heading 3": "Encabezado 3",
"Decrease indent": "Disminuir sangr\u00eda",
"Header 4": "Encabezado 4",
"Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.": "Pegar est\u00e1 ahora en modo de texto plano. El contenido se pegar\u00e1 como texto plano hasta que desactive esta opci\u00f3n.",
"Underline": "Subrayado",
"Cancel": "Cancelar",
"Justify": "Justificar",
"Inline": "en l\u00ednea",
"Copy": "Copiar",
"Align left": "Alinear a la izquierda",
"Visual aids": "Ayudas visuales",
"Lower Greek": "Inferior Griega",
"Square": "Cuadrado",
"Default": "Por defecto",
"Lower Alpha": "Inferior Alfa",
"Circle": "C\u00edrculo",
"Disc": "Disco",
"Upper Alpha": "Superior Alfa",
"Upper Roman": "Superior Romana",
"Lower Roman": "Inferior Romana",
"Name": "Nombre",
"Anchor": "Ancla",
"You have unsaved changes are you sure you want to navigate away?": "Tiene cambios sin guardar. \u00bfEst\u00e1 seguro de que quiere salir?",
"Restore last draft": "Restaurar el \u00faltimo borrador",
"Special character": "Car\u00e1cter especial",
"Source code": "C\u00f3digo fuente",
"B": "A",
"R": "R",
"G": "V",
"Color": "Color",
"Right to left": "De derecha a izquierda",
"Left to right": "De izquierda a derecha",
"Emoticons": "Emoticonos",
"Robots": "Robots",
"Document properties": "Propiedades del documento",
"Title": "T\u00edtulo",
"Keywords": "Palabras clave",
"Encoding": "Codificaci\u00f3n",
"Description": "Descripci\u00f3n",
"Author": "Autor",
"Fullscreen": "Pantalla completa",
"Horizontal line": "L\u00ednea horizontal",
"Horizontal space": "Espacio horizontal",
"Insert\/edit image": "Insertar\/editar imagen",
"General": "General",
"Advanced": "Avanzado",
"Source": "Enlace",
"Border": "Borde",
"Constrain proportions": "Restringir proporciones",
"Vertical space": "Espacio vertical",
"Image description": "Descripci\u00f3n de la imagen",
"Style": "Estilo",
"Dimensions": "Dimensiones",
"Insert image": "Insertar imagen",
"Zoom in": "Acercar",
"Contrast": "Contraste",
"Back": "Atr\u00e1s",
"Gamma": "Gamma",
"Flip horizontally": "Invertir horizontalmente",
"Resize": "Redimensionar",
"Sharpen": "Forma",
"Zoom out": "Alejar",
"Image options": "Opciones de imagen",
"Apply": "Aplicar",
"Brightness": "Brillo",
"Rotate clockwise": "Girar a la derecha",
"Rotate counterclockwise": "Girar a la izquierda",
"Edit image": "Editar imagen",
"Color levels": "Niveles de color",
"Crop": "Recortar",
"Orientation": "Orientaci\u00f3n",
"Flip vertically": "Invertir verticalmente",
"Invert": "Invertir",
"Insert date\/time": "Insertar fecha\/hora",
"Remove link": "Quitar enlace",
"Url": "URL",
"Text to display": "Texto para mostrar",
"Anchors": "Anclas",
"Insert link": "Insertar enlace",
"New window": "Nueva ventana",
"None": "Ninguno",
"The URL you entered seems to be an external link. Do you want to add the required http:\/\/ prefix?": "El enlace que has introducido no parece ser una enlace externo. Quieres a\u00f1adir el prefijo necesario http:\/\/ ?",
"Target": "Destino",
"The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?": "El enlace que has introducido no parece ser una direcci\u00f3n de correo electr\u00f3nico. Quieres a\u00f1adir el prefijo necesario mailto: ?",
"Insert\/edit link": "Insertar\/editar enlace",
"Insert\/edit video": "Insertar\/editar video",
"Poster": "Miniatura",
"Alternative source": "Enlace alternativo",
"Paste your embed code below:": "Pega tu c\u00f3digo embebido debajo",
"Insert video": "Insertar video",
"Embed": "Incrustado",
"Nonbreaking space": "Espacio fijo",
"Page break": "Salto de p\u00e1gina",
"Paste as text": "Pegar como texto",
"Preview": "Previsualizar",
"Print": "Imprimir",
"Save": "Guardar",
"Could not find the specified string.": "No se encuentra la cadena de texto especificada",
"Replace": "Reemplazar",
"Next": "Siguiente",
"Whole words": "Palabras completas",
"Find and replace": "Buscar y reemplazar",
"Replace with": "Reemplazar con",
"Find": "Buscar",
"Replace all": "Reemplazar todo",
"Match case": "Coincidencia exacta",
"Prev": "Anterior",
"Spellcheck": "Corrector ortogr\u00e1fico",
"Finish": "Finalizar",
"Ignore all": "Ignorar todos",
"Ignore": "Ignorar",
"Add to Dictionary": "A\u00f1adir al Diccionario",
"Insert row before": "Insertar fila antes",
"Rows": "Filas",
"Height": "Alto",
"Paste row after": "Pegar la fila despu\u00e9s",
"Alignment": "Alineaci\u00f3n",
"Border color": "Color del borde",
"Column group": "Grupo de columnas",
"Row": "Fila",
"Insert column before": "Insertar columna antes",
"Split cell": "Dividir celdas",
"Cell padding": "Relleno de celda",
"Cell spacing": "Espacio entre celdas",
"Row type": "Tipo de fila",
"Insert table": "Insertar tabla",
"Body": "Cuerpo",
"Caption": "Subt\u00edtulo",
"Footer": "Pie de p\u00e1gina",
"Delete row": "Eliminar fila",
"Paste row before": "Pegar la fila antes",
"Scope": "\u00c1mbito",
"Delete table": "Eliminar tabla",
"H Align": "Alineamiento Horizontal",
"Top": "Arriba",
"Header cell": "Celda de la cebecera",
"Column": "Columna",
"Row group": "Grupo de filas",
"Cell": "Celda",
"Middle": "Centro",
"Cell type": "Tipo de celda",
"Copy row": "Copiar fila",
"Row properties": "Propiedades de la fila",
"Table properties": "Propiedades de la tabla",
"Bottom": "Abajo",
"V Align": "Alineamiento Vertical",
"Header": "Cabecera",
"Right": "Derecha",
"Insert column after": "Insertar columna despu\u00e9s",
"Cols": "Columnas",
"Insert row after": "Insertar fila despu\u00e9s ",
"Width": "Ancho",
"Cell properties": "Propiedades de la celda",
"Left": "Izquierda",
"Cut row": "Cortar fila",
"Delete column": "Eliminar columna",
"Center": "Centrado",
"Merge cells": "Combinar celdas",
"Insert template": "Insertar plantilla",
"Templates": "Plantillas",
"Background color": "Color de fondo",
"Custom...": "Personalizar...",
"Custom color": "Color personalizado",
"No color": "Sin color",
"Text color": "Color del texto",
"Show blocks": "Mostrar bloques",
"Show invisible characters": "Mostrar caracteres invisibles",
"Words: {0}": "Palabras: {0}",
"Insert": "Insertar",
"File": "Archivo",
"Edit": "Editar",
"Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help": "\u00c1rea de texto enriquecido. Pulse ALT-F9 para el menu. Pulse ALT-F10 para la barra de herramientas. Pulse ALT-0 para ayuda",
"Tools": "Herramientas",
"View": "Ver",
"Table": "Tabla",
"Format": "Formato"
});
'use strict';

//Booklists service used for communicating with the categories REST endpoints
angular.module('reviews').factory('Reviews', ['$resource',
  function ($resource) {
    return $resource('api/reviews/:reviewId', {
      reviewId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Reviews service
angular.module('reviews.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/reviews/:reviewId', {
      reviewId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Users module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    /*Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Usuarios',
      state: 'admin.users'
    });*/
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/dashboard.list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/dashboard.view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/dashboard.edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', '$http', 'Admin',
  function ($scope, $filter, $http, Admin) {
      
    $scope.searchIsCollapsed = true;
    
    $scope.optionsItemsPage = [
        {text : "10", value : "10"},
        {text : "50", value : "50"},
        {text : "100", value : "100"}
    ];
    
    $scope.optionsOrder = [
        {text : "Descendente", value : "asc"},
        {text : "Ascendente", value : "desc"}
    ];
    
    $scope.optionsStatus = [
        {text : "Todos", value : ""},
        {text : "Activo", value : "activo"},
        {text : "Inactivo", value : "inactivo"}
    ];
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function (page) {
        $scope.currentPage = page;
        $scope.find();
    };
    
    $scope.find = function () {
        var query = {page:$scope.currentPage,
                     itemsPerPage:$scope.itemsPerPage,
                     order:$scope.order,
                     status:$scope.status,
                     text:$scope.text
                    };

        Admin.query(query, function (data) {
            $scope.users = data[0].users;
            $scope.totalResults = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
        });
    };
    
    $scope.getTotalUsers = function() {
      
      $http.get('/api/users/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.totalUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.getNewUsers = function() {
      
      $http.get('/api/users/news/count').success(function (response) {
            if(!angular.isUndefined(response[0])){
                $scope.newUsers = response[0].total;
            }
        }).error(function (response) {
            $scope.error = response.message;
      });
    };
    
    $scope.init = function(){
        $scope.getNewUsers();
        $scope.getTotalUsers();
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.order = 'desc';
        $scope.status = '';
        $scope.text = '';
        $scope.currentPage = 1;
        $scope.searchIsCollapsed = true;
        
        $scope.find();
    }
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;
    
    $scope.userStatus = [
        {text : "Activo", value : "activo"},
        {text : "Inactivo", value : "inactivo"}
    ];

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$modal', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $modal, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
    
    $scope.showLOPDInformation = function () {
       $modal.open({
            templateUrl: '/modules/users/client/views/authentication/modal-lopd-information.html',
            controller: ModalLOPDInstanceCtrl,
            scope: $scope
       });
    };
  }
]);

'use strict';

// controller for modal help window
var ModalLOPDInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalLOPDInstanceCtrl.$inject = ["$scope", "$modalInstance"];
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Por favor introduce una contraseña con más de 10 caracteres incluyendo números, minúsculas, mayúsculas y caracteres especiales.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
