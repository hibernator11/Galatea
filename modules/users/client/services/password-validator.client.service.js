'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
    
    owaspPasswordStrengthTest.config({
        allowPassphrases       : false,
        maxLength              : 128,
        minLength              : 6,
        minPhraseLength        : 6,
        minOptionalTestsToPass : 0,
    });

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        //var popoverMsg = 'Por favor introduce una contraseña con más de 10 caracteres incluyendo números, minúsculas, mayúsculas y caracteres especiales.';
        var popoverMsg = 'Por favor introduce una contraseña con 6 caracteres.';
        return popoverMsg;
      }
    };
  }
]);
