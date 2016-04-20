'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('groups', ['ui.tinymce']);
ApplicationConfiguration.registerModule('groups.admin', ['core.admin']);
ApplicationConfiguration.registerModule('groups.admin.routes', ['core.admin.routes']);
