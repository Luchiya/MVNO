var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var lint = require('gulp-eslint'); //Lint JS files, including JSX

var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');


// Development Tasks 
// -----------------


var config = {
  port: 9005,
  devBaseUrl: 'http://localhost',
  paths:{
    html: './app/*.html',
    js : './app/js/**/*.js',
    css : './app/css/*.css'
  }
}


gulp.task('open', ['connect'], function() {
  gulp.src('./app/index.html')
    .pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});


//Start a local development server
gulp.task('connect', function() {
  connect.server({
    root: ['app'],
    port: config.port,
    base: config.devBaseUrl,
    livereload: true
  });
});


gulp.task('html', function() {
  gulp.src(config.paths.html)
    .pipe(connect.reload());
});

gulp.task('autoprefixer', function () {

    return gulp.src(config.paths.css)
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./app/css/prod'))
        .pipe(connect.reload());

});



gulp.task('css', function() {
  gulp.src(config.paths.css)
    .pipe(connect.reload());
});

gulp.task('lint', function() {
  return gulp.src(config.paths.js)
    .pipe(lint({config: 'eslint.config.json'}))
    .pipe(lint.format());
});


// Watchers
gulp.task('watch', function() {
  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.css, ['autoprefixer','css']);
  gulp.watch(config.paths.js, ['lint']);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(['open','watch'],
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['useref', 'images', 'fonts'],
    callback
  )
})
