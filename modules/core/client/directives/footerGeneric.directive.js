'use strict';

angular.module('core')
  .directive('footerGeneric', footerGeneric);

function footerGeneric () {
    return {
        restrict: 'EA',
        templateUrl: '/modules/core/client/views/footer.template.html'
    };
}


