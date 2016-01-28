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
