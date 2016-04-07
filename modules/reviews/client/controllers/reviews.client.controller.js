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
    /*$scope.findStatusPublic = function () {
        $http.get('api/reviews/public').success(function (response) {
            $scope.reviews = response;
        }).error(function (response) {
            $scope.error = response.message;
        });
    };*/

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

        return $http.jsonp('//app.pre.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/getJson?callback=JSON_CALLBACK', {
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

        return $http.jsonp('//app.pre.cervantesvirtual.com/cervantesvirtual-web-services/entidaddocumental/like?callback=JSON_CALLBACK', {
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



