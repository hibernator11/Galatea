'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('publications', ['ui.tinymce', "xeditable", "pdf"]);
ApplicationConfiguration.registerModule('publications.admin', ['core.admin']);
ApplicationConfiguration.registerModule('publications.admin.routes', ['core.admin.routes']);

