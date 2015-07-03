'use strict';

var appName = 'mainApp';
var app = angular.module(appName, [
  'ngAnimate',
  'ui.router'
]);

app.config(require('./main/config.js'));
app.run(require('./main/run.js'));

app.directive('icon', require('./main/directives/icon.js'));
app.directive('pageTitle', require('./main/directives/page-title.js'));
app.directive('pageloader', require('./main/directives/pageloader/pageloader.js'));
app.directive('table', require('./main/directives/table.js'));
