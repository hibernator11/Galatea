'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

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
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

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

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('groups', ['ui.tinymce']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reviews', ['ui.tinymce']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

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
        data: {
          roles: ['user', 'admin']
        }
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
        data: {
          roles: ['user', 'admin']
        }
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
ModalBookInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance"];


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
            $scope.resultMessage = 'Error: por favor rellene todos los campos';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};



'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
'use strict';

angular.module('booklists').controller('BooklistPaginationController', ['$scope', '$filter', 'Booklists',
  function ($scope, $filter, Booklists) {
    
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.booklists, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        var query = '';
        if($scope.status === 'public'){
            query = {status:'public', page:$scope.currentPage};
        }else{
            query = {page:$scope.currentPage};
        }

        Booklists.query(query, function (data) {
            $scope.booklists = data[0].booklists;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.booklists, {
                $: $scope.search
            });
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

angular.module('booklists')
  .directive('footerGeneric', footerGeneric);

function footerGeneric () {
    return {
        restrict: 'EA',
        templateUrl: '/modules/booklists/client/views/footerGeneric.template.html'
    };
}



'use strict';

//Booklists service used for communicating with the categories REST endpoints
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
    .state('inicio', {
      url: '/inicio',
      templateUrl: 'modules/core/client/views/inicio.client.view.html'
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
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Reviews',
  function ($scope, Authentication, Reviews) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

  }
]);

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
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.create', {
        url: '/create',
        templateUrl: 'modules/groups/client/views/create-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.view', {
        url: '/:groupId',
        templateUrl: 'modules/groups/client/views/view-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
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

// Groups controller
angular.module('groups').controller('GroupsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Groups', 'Booklists',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Groups, Booklists) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.identifierWork = '';
    $scope.slug = '';
    $scope.title = '';
    $scope.uuid = '';
    $scope.reproduction = '';
    $scope.language = '';
    $scope.mediaType = '';

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
    $scope.showDescriptionPanel = false;
    $scope.booklists = '';
    
    $scope.showRatingBar = false;
    
    $scope.selectTypeAction = function() {
        if($scope.type === 'obra'){
            $scope.showWorkPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showAuthorPanel = false;
            $scope.showBookListPanel = false;
            $scope.booklists = '';
            $scope.authorName = '';
            $scope.booklist = '';
        }else if($scope.type === 'autor'){
            $scope.showAuthorPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showBookListPanel = false;
            $scope.booklists = '';
            $scope.uuid = '';
            $scope.slug = '';
            $scope.reproduction = '';
            $scope.title = '';
            $scope.booklist = '';
        }else if($scope.type === 'lista'){
            $scope.showBookListPanel = true;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
            $scope.uuid = '';
            $scope.slug = '';
            $scope.reproduction = '';
            $scope.title = '';
            $scope.authorName = '';
            $scope.booklist = '';
            
            // load booklists
            $http.get('/api/booklists')
                    .success(function(data) {
                        $scope.booklists = data[0].booklists;
                        console.log(data);
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });

        }else if($scope.type === 'general'){
            $scope.showBookListPanel = false;
            $scope.showDescriptionPanel = true;
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
            $scope.uuid = '';
            $scope.slug = '';
            $scope.reproduction = '';
            $scope.title = '';
            $scope.authorName = '';
            $scope.books = '';
            $scope.booklist = '';
        }else{
            $scope.showWorkPanel = false;
            $scope.showAuthorPanel = false;
            $scope.showDescriptionPanel = false;
            $scope.showBookListPanel = false;
            $scope.booklists = '';
            $scope.uuid = '';
            $scope.slug = '';
            $scope.reproduction = '';
            $scope.title = '';
            $scope.authorName = '';
            $scope.booklist = '';
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
        
        console.log("type" + $scope.type);
        console.log("source" + $scope.source);
        if($scope.type === "lista" && angular.isUndefined($scope.source)){
            console.log("Error lista null");
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

    $scope.openReview = function(groupId) {
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
    
    $scope.addFollower = function() {
      if ($scope.authentication.user) {
          
        if ($scope.authentication.user._id !== $scope.group.user._id) {
            var follower = {
                    user: $scope.authentication.user
            };
            
            var found = false;
            for(var i = 0; i <  $scope.group.followers.length; i++) {
                console.log('$scope.group.followers[i]._id:' + $scope.group.followers[i].user);
                if ( $scope.group.followers[i].user === $scope.authentication.user._id) {
                    found = true;
                    break;
                }
            }

            if(!found){
                $scope.group.followers.push(follower);

                $scope.group.$update(function () {
                    $scope.messageok = 'Ahora eres seguidor de este grupo.' + $scope.authentication.user._id;
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }else{
                $scope.error = 'Ya eres seguidor del grupo.';
            }
        }else{
            $scope.error = 'Eres el creador de este grupo y por tanto ya eres seguidor.';
        }
      }else{
          $scope.error = 'Para ser seguidor debes introducir tu usuario y contraseña.';
      }
    };
    

    // Find existing Books in BVMC catalogue
    $scope.getWork = function(val) {

        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
            params: {
                q: val,
                maxRows: 10
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



'use strict';

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
            $scope.resultMessage = 'Error por favor rellene todos los campos.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};



'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
'use strict';

angular.module('groups').controller('GroupPaginationController', ['$scope', '$filter', 'Groups',
  function ($scope, $filter, Groups) {
      
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.groups, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        var query = '';
        if($scope.status === 'public'){
            query = {status:'public', page:$scope.currentPage};
        }else{
            query = {page:$scope.currentPage};
        }

        Groups.query(query, function (data) {
            $scope.groups = data[0].groups;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.groups, {
                $: $scope.search
            });
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
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reviews.uuid', {
        url: '/uuid/:uuid',
        templateUrl: 'modules/reviews/client/views/list-reviews-uuid.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
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
        data: {
          roles: ['user', 'admin']
        }
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
            $scope.resultMessage = 'Por favor complete todos los campos.';
            $scope.result='bg-danger';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalEmailInstanceCtrl.$inject = ["$scope", "$http", "$modalInstance"];



'use strict';

// controller for modal help window
var ModalHelpInstanceCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
ModalHelpInstanceCtrl.$inject = ["$scope", "$modalInstance"];
'use strict';

angular.module('reviews').controller('ReviewPaginationController', ['$scope', '$filter', 'Reviews',
  function ($scope, $filter, Reviews) {
      
    $scope.init = function(status){
        $scope.status = status;
        $scope.pagedItems = [];
        $scope.itemsPerPage = 10;
        $scope.currentPage = 1;
        $scope.find();
    }
    
    $scope.figureOutItemsToDisplay = function () {
      
      $scope.pagedItems = $filter('filter')($scope.reviews, {
        $: $scope.search
      });
    };
    
    $scope.pageChanged = function () {
        $scope.find();
    };
      
    $scope.find = function () {
        var query = '';
        if($scope.status === 'public'){
            query = {status:'public', page:$scope.currentPage};
        }else{
            query = {page:$scope.currentPage};
        }

        Reviews.query(query, function (data) {
            $scope.reviews = data[0].reviews;
            $scope.total = data[0].total;
            
            $scope.pagedItems = $filter('filter')($scope.reviews, {
                $: $scope.search
            });
        });
    };
  }
]);

'use strict';

// Reviews controller
angular.module('reviews').controller('ReviewsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Reviews',
  function ($scope, $http, $modal, $stateParams, $location, Authentication, Reviews) {
    $scope.authentication = Authentication;

    $scope.location = $location.absUrl();

    $scope.identifierWork = '';
    $scope.slug = '';
    $scope.title = '';
    $scope.uuid = '';
    $scope.reproduction = '';
    $scope.language = '';
    $scope.mediaType = '';

    $scope.form = {};
    $scope.txtcomment = '';

    $scope.messageok = '';
    $scope.warningopen = true;

    // rating variables
    $scope.max = 5;
    $scope.rate = 0;
    $scope.isReadonly = false;
    $scope.percent = 0;
    
    $scope.showRatingBar = false;
    
    $scope.tinymceOptions = {
        language_url : 'modules/reviews/client/language-tinymce/es.js' 
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
            mediaType: $scope.mediaType 
        });

        // Redirect after save
        review.$save(function (response) {
            $location.path('reviews/' + response._id);

            // Clear form fields
            $scope.title = '';
            $scope.content = '';
            $scope.identifierWork = '';
            $scope.slug = '';
            $scope.title = '';
            $scope.uuid = '';
            $scope.reproduction = '';
            $scope.language = '';
            $scope.mediaType = '';

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

    // Find a list of Reviews with public status
    $scope.findStatusPublic = function () {
        $http.get('api/reviews/public').success(function (response) {
            $scope.reviews = response;
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
        if (!angular.isUndefined($scope.review) && !angular.isUndefined($scope.review.ratings)){
            angular.forEach($scope.review.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                    $scope.showRatingBar = false;
                    $scope.error = "No puedes votar dos veces la misma reseña";
                }
            });
        }
    };

    $scope.$watch('review.ratings', function(value) {
        if (!angular.isUndefined($scope.review) && !angular.isUndefined($scope.review.ratings)){
            angular.forEach($scope.review.ratings, function(value, key){
                if($scope.authentication.user._id === value.user){
                    $scope.isReadonly = true;
                    $scope.rate = value.rate;
                }
            });
        }
    });
    
    $scope.$watch('rate', function(value) {

       if (!angular.isUndefined($scope.rate) && 
           !angular.isUndefined($scope.review) &&
           !angular.isUndefined($scope.review.ratings) && !$scope.isReadonly) {
            
          var rating = {
                rate: value,
                user: $scope.authentication.user
          };

          $scope.review.ratings.push(rating);

          $scope.review.$update(function () {
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

        $scope.review.comments.unshift(comment);

        $scope.review.$update(function () {
            $scope.txtcomment = '';
        }, function (errorResponse) {
            $scope.error = errorResponse.data.message;
        });
      }
    };

     // Find existing Book by uuid in BVMC catalogue 
    $scope.getWorkJson = function() {

        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/getJson?callback=JSON_CALLBACK', {
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
                
                $scope.identifierWork = item.idEntidadDocumental;
                $scope.slug = item.slug;
                $scope.uuid = item.uuid;
                $scope.reproduction = item.reproduccion;
                $scope.title = item.titulo;
                $scope.language = item.idioma;
                $scope.mediaType = mediaType;
            });
        });
    };

    // Find existing Books in BVMC catalogue
    $scope.getWorkLike = function(val) {

        return $http.jsonp('//app.dev.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
            params: {
                q: val,
                maxRows: 10
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
    };

    $scope.showEmailForm = function () {
        var modalInstance = $modal.open({
            templateUrl: '/modules/reviews/client/views/modal-email-form.html',
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

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
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
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
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

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

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

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/home');
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

        //if($state.previous.state.name === 'home')
        //    $state.previous.state.name = 'inicio';
        // And redirect to the previous or home page
        //$state.go($state.previous.state.name || 'inicio', $state.previous.params);
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
  }
]);

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
