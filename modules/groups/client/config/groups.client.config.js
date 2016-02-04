'use strict';

// Configuring the reviews module
angular.module('groups').run(['Menus',
  function (Menus) {
    // Add the review dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Grupos',
      state: 'groups',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'groups', {
      title: 'Mis grupos',
      state: 'groups.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'groups', {
      title: 'Crear Grupo',
      state: 'groups.create',
      roles: ['user']
    });
  }
]);
