var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var scripts = ['js/main.js'];
var DEST = 'js/';

//Credits for the basic idea to:
//https://github.com/gulpjs/gulp/blob/master/docs/recipes/minified-and-non-minified.md
gulp.task('default', function() {
  for(var i = 0; i < scripts.length; i++) {
    gulp.src(scripts[i])
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
  }
});
