'use strict';

angular.module('booklists')
  .directive('footerGeneric', footerGeneric);

function footerGeneric () {
    return {
        restrict: 'EA',
        templateUrl: '/modules/booklists/client/views/footerGeneric.template.html'
    };
}


