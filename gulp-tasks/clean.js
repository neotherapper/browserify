var del = require('del');
var gulp = require('gulp');
var paths = require('../gulp-config.js').paths;

// Delete all files in the dist directory
gulp.task('clean', function() {
    var cleanPaths = [
        paths.DIST+'/**/*'
    ];

    return del(cleanPaths);
});

// delete css files from div folder and from scss/css --> node_modules css extracted files
gulp.task('clean:css', function() {
    var distPath = paths.DIST + '/css';
    var cleanPaths = [
        distPath
    ];

    return del(cleanPaths);
});
