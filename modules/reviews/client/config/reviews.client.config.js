'use strict';

// Configuring the reviews module
angular.module('reviews').run(['Menus',
  function (Menus) {
    // Add the review dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Reseñas',
      state: 'reviews',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reviews', {
      title: 'Mis reseñas',
      state: 'reviews.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reviews', {
      title: 'Crear Reseña',
      state: 'reviews.create',
      roles: ['user']
    });
  }
]);
