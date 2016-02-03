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
