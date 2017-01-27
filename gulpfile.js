var gulp = require('gulp');
var paths = require('./gulp-config.js').paths;

// path to separate tasks
var requireDir = require('require-dir')('./gulp-tasks');

gulp.task('build', ['build:vendor'], function () {});
