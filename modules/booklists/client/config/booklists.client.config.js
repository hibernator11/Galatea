'use strict';

// Configuring the booklists module
angular.module('booklists').run(['Menus',
  function (Menus) {
    // Add the books dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Listas de libros',
      state: 'booklists',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'booklists', {
      title: 'Mis listas',
      state: 'booklists.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'booklists', {
      title: 'Crear Lista',
      state: 'booklists.create',
      roles: ['user']
    });
  }
]);
