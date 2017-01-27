var browserify = require('browserify'),
    concat = require('gulp-concat'),
    es = require('event-stream'),
    fs = require('fs'),
    glob = require('glob'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    ngAnnotate = require('gulp-ng-annotate'),
    package_json = JSON.parse(fs.readFileSync('./package.json')),
    paths = require('../gulp-config.js').paths,
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    streamify = require('gulp-streamify'),
    symlink = require('gulp-symlink'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify'),
    _ = require('lodash');

/////////////////////////

gulp.task('build:webapp', ['copy:assets', 'templatecache'], function () {
    var js = './webapp/**/*.js';
    var testJs = '!./webapp/**/*.spec.js';
    var outputMinimizedFile = '../../dist/webapp/webapp.js';
    var outputMapFolder = '.';
    var outputFolder = './dist/webapp/';
    var sources = [ js , testJs];

    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(concat(outputMinimizedFile))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write(outputMapFolder))
        .pipe(gulp.dest(outputFolder));
});

gulp.task('build:vendor', function () {
    var outputMapFolder = '';
    var b = browserify();
    _.forIn(package_json.dependencies, function (dep_version, dep) {
        if (dep !== 'angular-ui-select' && dep !== 'angular-websocket' && dep !== 'angular-c3' && dep !== 'angular' 
                && dep !== 'angular-moment'&& dep !== 'angular-clipboard' && dep !=='angular-touch' 
                && dep !=='angular-eonasdan-datetimepicker' && dep !=='angular-bootstrap-switch' && dep !== 'angular-md5' 
                && dep !=='angular-utf8-base64' && dep !=='c3' && dep !=='d3' && dep !=='iso-currency' && dep !=='ng-lodash' 
                && dep !=='angular-ui-grid' && dep!=='angular-ui-select' && dep!=='ng-handsontable') {
            b.require(dep);
        }
    });
    return b.bundle().on('error', function (err) {
        gutil.log("Build Error!!  error:" + err);
    })
        .pipe(source('vendor.js'))
        .pipe(streamify(sourcemaps.init()))
        .pipe(streamify(uglify()))
        .pipe(streamify(sourcemaps.write(outputMapFolder)))
        .pipe(gulp.dest('dist/js/'))
});

gulp.task('build:bundles', function (cb) {
    var outputMapFolder = '.';
    glob('./js/main/*.js', function (err, files) {
        if (err) cb(err);
        var tasks = files.map(function (entry) {
            var b = browserify({
                entries: [entry],
                transform: ['brfs'],
                paths: ['./node_modules/', './js/']
            });
            _.forIn(package_json.dependencies, function (dep_version, dep) {
                b.external(dep);
            });
            return b.bundle()
                .on('error', function (err) {
                    gutil.log("Build Error!! file:" + entry + " error:" + err);
                    cb();
                })
                .pipe(source(entry))
                .pipe(streamify(sourcemaps.init()))
                .pipe(streamify(uglify()))
                .pipe(rename({dirname: ""}))
                .pipe(streamify(sourcemaps.write(outputMapFolder)))
                .pipe(gulp.dest('dist/js/'));
        });
        es.merge(tasks).on('end', cb);
    })
});

gulp.task('build:bundles-debug', function (cb) {
    glob('./js/main/*.js', function (err, files) {
        if (err) cb(err);
        var tasks = files.map(function (entry) {
            var b = browserify({
                entries: [entry],
                cache: {},
                packageCache: {},
                debug: true,
                transform: ['brfs'],
                paths: ['./node_modules/', './js/']
            });
            _.forIn(package_json.dependencies, function (dep_version, dep) {
                b.external(dep);
            })
            return b.bundle()
                .on('error', function (err) {
                    gutil.log("Build Error!! file:" + entry + " error:" + err);
                    cb();
                })
                .pipe(source(entry))
                .pipe(rename({dirname: ""}))
                .pipe(gulp.dest('dist/js/'));
        });
        es.merge(tasks).on('end', cb);
    })
});

gulp.task('copy:assets', ['copy:lib'], function () {
    var target = paths.SRC + '/common/browser_test-tpl.html';
    var destination = paths.DIST + '/webapp/';

    return gulp.src(target)
        .pipe(gulp.dest(destination))
});

gulp.task('copy:lib', function () {
    var destination = paths.DIST + '/lib/';

    return gulp.src([
        'node_modules/angular/angular.min.js',
        'node_modules/angular-ui-router/release/angular-ui-router.min.js',
        'node_modules/angular-moment/angular-moment.min.js',
        'node_modules/moment/min/moment.min.js',
        'node_modules/angularjs-slider/dist/rzslider.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/iso-currency/dist/isoCurrency.min.js',
        'node_modules/angular-bootstrap-switch/dist/angular-bootstrap-switch.min.js',
        'node_modules/angular-eonasdan-datetimepicker/dist/angular-eonasdan-datetimepicker.min.js',
        'node_modules/angular-ui-select/select.min.js',
        'node_modules/angular-touch/angular-touch.min.js',
        'node_modules/angular-ui-grid/ui-grid.min.js',
        'node_modules/angular-ui-grid/ui-grid.eot',
        'node_modules/angular-ui-grid/ui-grid.svg',
        'node_modules/angular-ui-grid/ui-grid.ttf',
        'node_modules/angular-ui-grid/ui-grid.woff',
        'node_modules/angular-clipboard/angular-clipboard.js',
        'node_modules/angular-md5/angular-md5.min.js',
        'node_modules/angular-websocket/dist/angular-websocket.min.js',
        'node_modules/angular-utf8-base64/angular-utf8-base64.js',
        'node_modules/iso-currency/dist/isoCurrency.min.js',
        'node_modules/c3-angular/c3-angular.min.js',
        'node_modules/c3/c3.min.js',
        'node_modules/d3/d3.min.js',
        'node_modules/humane-js/humane.min.js',
        'node_modules/ng-lodash/build/ng-lodash.min.js',
        'node_modules/autosize/dist/autosize.min.js',
        'node_modules/angular-loading-bar/build/loading-bar.min.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'js/handsontable/handsontable.full.min.js',
        'node_modules/ng-handsontable/dist/ngHandsontable.min.js',
        'js/lib/*',
    ])
        .pipe(gulp.dest(destination))
});
