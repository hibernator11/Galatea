'use strict';

// Configuring the publications module
angular.module('publications').run(['Menus',
  function (Menus) {
    // Add the publication dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Publicaciones',
      state: 'publications',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'publications', {
      title: 'Mis publicaciones',
      state: 'publications.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'publications', {
      title: 'Crear Publicación',
      state: 'publications.create',
      roles: ['user']
    });
  }
]);
