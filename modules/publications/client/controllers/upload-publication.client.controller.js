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
