'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('booklists', ['ngTagsInput']);
ApplicationConfiguration.registerModule('booklists.admin', ['core.admin']);
ApplicationConfiguration.registerModule('booklists.admin.routes', ['core.admin.routes']);
