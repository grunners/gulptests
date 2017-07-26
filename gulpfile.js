var gulp = require('gulp'),
    gutil = require('gulp-util'),
    htmlclean = require('gulp-htmlclean'),
    less = require('gulp-less'),
    checkcss = require('gulp-check-unused-css'),
    cleancss = require('gulp-clean-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del'),
    inject = require('gulp-inject'),
    webserver = require('gulp-webserver'),
    pump = require('pump');

//paths
var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/**/*.css',
  srcJS: 'src/**/*.js',

  tmp: 'tmp',
  tmpIndex: 'tmp/index.html',
  tmpCSS: 'tmp/**/*.css',
  tmpJS: 'tmp/**/*.js',

  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/*.css',
  distJS: 'dist/*.js'
};

// 1: copy the html
gulp.task('html', function() {
  return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});

// 2: copy the js
gulp.task('js', function() {
  return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
});

// 3: compile the css
gulp.task('less', function(cb) {
  pump([
      gulp.src('src/styles.less'),
      sourcemaps.init(),
      less().on('error', gutil.log),
      sourcemaps.write(),
      gulp.dest('src')
    ],
    cb
  );
});	

// 4: copy the css, running 'less' task as a prerequisite
gulp.task('css', ['less'], function() {
  return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
});


// run all the copy tasks - src -> tmp
gulp.task('copy', ['html', 'css', 'js'] );




//inject
gulp.task('inject', ['copy'], function(cb) {
  var css = gulp.src(paths.tmpCSS);
  var js = gulp.src(paths.tmpJS);
  pump([
    gulp.src(paths.tmpIndex),
    inject( css, {relative:true} ),
    inject( js, {relative:true} ),
    gulp.dest(paths.tmp)
    ],
    cb
  );
});

//webserver
gulp.task('serve', ['inject'], function(cb) {
  pump([
    gulp.src(paths.tmp),
    webserver({
      port: 3000,
      livereload: true })
    ],
    cb
  );
});


gulp.task('watch', ['serve'], function() {
  gulp.watch(paths.src, ['inject']);
});

//set default task
gulp.task('default', ['watch']);

//dist tasks
//html
gulp.task('dist:html', function(cb) {
  pump([
    gulp.src(paths.srcHTML),
    htmlclean(),
    gulp.dest(paths.dist)
    ],
    cb
  );
});

//css
gulp.task('dist:css', function(cb) {
  pump([
    gulp.src(paths.srcCSS),
    concat('styles.min.css'),
    cleancss(),
    gulp.dest(paths.dist)
    ],
    cb
  );
});

//js
gulp.task('dist:js', function(cb) {
  pump([
    gulp.src(paths.srcJS),
    concat('site.min.js'),
    uglify(),
    gulp.dest(paths.dist)
    ],
    cb
  );
});

gulp.task('dist:copy', ['dist:html', 'dist:css', 'dist:js']);

//inject
gulp.task('dist:inject', ['dist:copy'], function(cb) {
  var css = gulp.src(paths.distCSS);
  var js = gulp.src(paths.distJS);
  pump([
    gulp.src(paths.distIndex),
    inject( css, {relative:true} ),
    inject( js, {relative:true} ),
    gulp.dest(paths.dist)
    ],
    cb
  );
});

//build for production!
gulp.task('build', ['dist:inject']);

//delete built files
gulp.task('clean', function() {
  del([paths.tmp, paths.dist]);
});













//unused at the moment
gulp.task('checkcss', function(cb) {
  pump([
      gulp.src('./css/styles.css'),
      checkcss()
    ],
    cb
  );  
});

gulp.task('jshint', function(cb) {
  pump([
    gulp.src('./test.js'),
    jshint(),
    jshint.reporter('jshint-stylish')
  ],
  cb
  );
});


