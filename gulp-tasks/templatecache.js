var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var notify = require('gulp-notify');
var templateCache = require('gulp-angular-templatecache');
var paths = require('../gulp-config.js').paths;

gulp.task('templatecache', function () {
    return gulp.src([paths.APP_ROOT + '/**/*-tpl.html', paths.APP_ROOT + '/**/*-block.html', paths.APP_ROOT + '/**/*-view.html'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            conservativeCollapse: true,
            removeCommentsFromCDATA: true,
            collapseInlineTagWhitespace: true,
            removeTagWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: true,
            minifyJS: true,
            minifyURLs: true,
            minifyCSS: true
        }))
        .pipe(templateCache({
            module: 'origin.templates',
            standalone: true
        }))
        .pipe(gulp.dest(paths.APP_ROOT + '/config'))
        .pipe(notify({ message: 'templatecache task complete: <%= file.path %>'}));
});
