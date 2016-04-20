'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reviews', ['ui.tinymce', "xeditable"]);
ApplicationConfiguration.registerModule('reviews.admin', ['core.admin']);
ApplicationConfiguration.registerModule('reviews.admin.routes', ['core.admin.routes']);

