var gulp = require('gulp'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename')
;

gulp.task('less', function(){

  gulp.src('less/index.less')
      .pipe(less({compress:true}))
      .pipe(rename('grande-module.css'))
      .pipe(gulp.dest('dist/css'));

});

gulp.task('js', function(){

  gulp.src('js/index.js')
    .pipe(uglify())
    .pipe(rename('grande-module.min.js'))
    .pipe(gulp.dest('dist/js'));

  gulp.src('js/index.js')
    .pipe(rename('grande-module.js'))
    .pipe(gulp.dest('dist/js'));

});

gulp.task('fonts', function(){

  gulp.src('fonts/**/*.woff')
      .pipe(gulp.dest('dist/fonts'));

});

gulp.task('example', function(){

  browserify('./example/example.js')
    .bundle()
    .pipe(source('example-bundle.js'))
    .pipe(gulp.dest('example'));

});

gulp.task('watch', function() {

  var server = livereload();

  gulp.watch('js/**/*.js',['js']);
  gulp.watch('less/**/*.less',['less']);

  gulp.watch('dist/**')
      .on('change', function(file) {
        server.changed(file.path);
      });

});