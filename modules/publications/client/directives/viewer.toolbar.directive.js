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
              'class="btn btn-danger">Anterior' +
             '</a>&nbsp;&nbsp;' +
            '<a href=""' +
              'ng-click="next()"' +
              'class="btn btn-danger">Siguiente' +
            '</a>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;<span class="px1">Página</span> ' +
            '<input type="text" class="field-dark" ' +
              'min=1 ng-model="currentPage" ng-change="goToPage()" ' +
               'style="width: 10%"> ' +
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

        var updateCurrentPage = function() {
          scope.currentPage = pdfDelegate
                                .$getByHandle(id)
                                 .getCurrentPage();
        };
      }
    };
}]);

