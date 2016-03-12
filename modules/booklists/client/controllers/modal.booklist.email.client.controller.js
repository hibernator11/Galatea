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


