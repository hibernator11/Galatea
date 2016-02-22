'use strict';

angular.module('booklists').directive('scrollContainer', function($window) {
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
});

