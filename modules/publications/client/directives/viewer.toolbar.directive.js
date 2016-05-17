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

