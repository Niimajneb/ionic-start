var gulp = require('gulp');
//var gutil = require('gulp-util');
//var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
//var sh = require('shelljs');
var ngTemplates = require('gulp-ng-templates');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var connect = require('gulp-connect');

var paths = {
  sass: ['scss/**/*.scss', '!scss/ionic/**'],
  sassionic: ['scss/ionic/*.scss'],
  templates: ['templates/**.html', 'partials/**.html'],
  src: ['src/**.js'],
  lib: ['lib/ionic/js/ionic.bundle.min.js', 'lib/angular-translate/angular-translate.min.js', 'lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js']
};

var task = {};

function swallowError (error) {
  console.log(error.toString());
  this.emit('end');
}

gulp.task('watch', task.watch = function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.sassionic, ['sassionic']);
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.lib, ['concatlib']);
  gulp.watch(paths.src, ['concatjs']);
});

gulp.task('default', ['make', 'webserver'], task.watch);

gulp.task('make', ['sassionic', 'sass', 'concatlib', 'templates:concatjs'], function() {
  gulp.src('lib/ionic/fonts/*').pipe(gulp.dest('www/lib/fonts'));
});

gulp.task('concatlib', function() {
  gulp.src(paths.lib)
    .pipe(ngAnnotate())
    .on('error', swallowError)
    .pipe(concat('lib.min.js'))
    .on('error', swallowError)
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(gulp.dest('www/lib'))
    .pipe(connect.reload());
});

gulp.task('concatjs', task.concatjs = function() {
  return gulp.src(paths.src)
    .pipe(ngAnnotate())
    .on('error', swallowError)
    .pipe(concat('all.min.js'))
    .on('error', swallowError)
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(gulp.dest('www/dist'))
    .pipe(connect.reload());
});

gulp.task('templates:concatjs', ['templates'], task.concatjs);

gulp.task('webserver', function() {
  connect.server({
    root: 'www',
    livereload: true
  });
});

gulp.task('sass', function (done) {
  gulp.src(paths.sass)
    .pipe(sass({
      errLogToConsole: true
    }))
    .on('error', swallowError)
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('www/css'))
    .on('end', done)
    .pipe(connect.reload());
});

gulp.task('sassionic', function (done) {
  gulp.src(paths.sassionic)
    .pipe(sass({
      errLogToConsole: true
    }))
    .on('error', swallowError)
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('www/lib/css'))
    .on('end', done)
    .pipe(connect.reload());
});

gulp.task('templates', function () {
  return gulp.src(paths.templates)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .on('error', swallowError)
    .pipe(ngTemplates({
      module: 'starter.templates',
      standalone: true,
      path: function (path, base) {
        var replace = '';
        if (path.indexOf('templates') > -1) {
          replace = 'templates/';
        }
        else if (path.indexOf('partials') > -1) {
          replace = 'partials/';
        }
        return path.replace(base, replace);
      }
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('src'));
});
