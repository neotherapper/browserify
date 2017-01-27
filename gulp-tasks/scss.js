var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var fs = require('fs');
var gulp = require('gulp');
var inject = require("gulp-inject");
var notify = require('gulp-notify');
var paths = require('../gulp-config.js').paths;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var runSeq = require('run-sequence');

///////////////////////////////////////////////////////////////////////////

var sassInput = paths.APP_SCSS + '/*.scss';  // './scss/app/*.scss'
var sassWebAppInput = paths.SRC + '/**/*.scss'; // './webapp/**/*.scss'
var sassOutput = paths.DIST + '/css'; // 'dist/css'
var sassAppOutput = paths.DIST + '/css'; // 'dist/css'

var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed',
};

var autoprefixerOptions = {
    browsers: ['> 1%', 'last 4 versions', 'Firefox ESR', 'Opera 12.1'],
    cascade: false
};

var injectSassOptions = {
    starttag: '/* inject:imports */',
    endtag: '/* endinject */',
    transform: function(filepath) {
        return '@import ".' + filepath + '";';
    }
};

// hacky copy paste ui-grid font files into css folder
gulp.task('copy:fonts', ['copy:ui-fonts'], function() {
   return gulp.src([
           'fonts/fontawesome-*',
           'fonts/glyphicons-*'
       ])
       .pipe(gulp.dest('./dist/fonts/'))
});

gulp.task('copy:ui-fonts', function() {
   return gulp.src(
       [
           paths.NODE_MODULES + '/angular-ui-grid/ui-grid.ttf',
           paths.NODE_MODULES + '/angular-ui-grid/ui-grid.woff'
       ])
       .pipe(gulp.dest('./dist/css/'))
});

// inject sass files from webapp to site.scss
gulp.task('inject:webapp_scss', function() {
    var targetFolder = 'scss/';
    var targetFile = targetFolder + 'site.scss';

    var scssData = '/* inject:imports */ /* endinject */'

    fs.writeFile(targetFile, scssData, function (err) {
        if (err) return console.log(err);
        console.log('site.scss file has been created');
    });

    var target = gulp.src(targetFile);
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([sassWebAppInput], { read: false });

    return target.pipe(inject(sources, injectSassOptions))
        .pipe(gulp.dest(targetFolder));
});

//  wait for clean to finish and then build css
gulp.task('build:css', function(callback){
  return runSeq('clean:css',  ['build:css3'], callback);
});

// Compile SCSS files
gulp.task('build:css3', ['concat:css', 'inject:webapp_scss'], function() {
    var target = gulp.src('scss/app/app.scss', { cwd: './' });
    var destination = gulp.dest(sassOutput);

    return target
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(notify({ message: 'SCSS converted to CSS: <%= file.relative %>' }))
        .pipe(sourcemaps.write('/'))
        .pipe(destination)
        .pipe(notify({ message: 'SCSS task complete: <%= file.relative %>' }));
});

// vendor css is concat from node_modules and vendor is already there 3rd party css
gulp.task('concat:css', ['copy:fonts'], function() {
    var scssPath = paths.SCSS + '/vendor';
    var source = scssPath + '/*.css';

    var targetFiles = [
        paths.NODE_MODULES + '/angularjs-slider/dist/rzslider.min.css',
        paths.NODE_MODULES + '/angular-ui-grid/ui-grid.min.css',
        paths.NODE_MODULES + '/angular-ui-select/select.min.css',
        paths.NODE_MODULES + '/c3/c3.min.css',
        paths.NODE_MODULES + '/angular-loading-bar/build/loading-bar.min.css',
        paths.NODE_MODULES + '/angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
        source
    ];

    var target = gulp.src(targetFiles);
    var destination = gulp.dest(paths.SCSS);

    return target
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.scss'))
        .pipe(sourcemaps.write())
        .pipe(destination);

});

gulp.task('watch:css', function() {
    gulp.watch([sassInput,sassWebAppInput], ['build:css3']);
});

gulp.task('watch:webapp_css', ['inject:webapp_scss'], function() {
    gulp.watch('./webapp/**/*.scss', ['inject:webapp_scss']);
});

//  wait for build to finish and then watch css
gulp.task('watch:allCss', function(callback){
  return runSeq('clean:css', 'build:css3',  ['watch:css'], callback);
});
