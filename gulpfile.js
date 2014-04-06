var gulp = require('gulp'),
    less = require('gulp-less'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename')
;

gulp.task('less', function(){

  gulp.src('src/less/index.less')
      .pipe(less({compress:true}))
      .pipe(rename('grande-module.css'))
      .pipe(gulp.dest('dist/css'));

});

gulp.task('js', function(){

  gulp.src('src/js/grande-module.js')
    .pipe(gulp.dest('dist/js'));

});

gulp.task('fonts', function(){

  gulp.src('src/fonts/**/*.woff')
    .pipe(gulp.dest('dist/fonts'));

});

gulp.task('dev', function(){

  browserify('./dev/dev.js')
    .bundle()
    .pipe(source('dev-bundle.js'))
    .pipe(gulp.dest('dev'));

});