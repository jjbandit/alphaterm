var gulp = require("gulp");

// Don't break on errors
var plumber = require("gulp-plumber");

// Watch directory for changes
var watch = require("gulp-watch");

// ES6 compiler and Sourcemaps
var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");

gulp.task("default", function () {

  return gulp.src("src/**/*.js")
    .pipe(plumber())
    .pipe(watch("src/**/*.js"))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("lib/"));

});
