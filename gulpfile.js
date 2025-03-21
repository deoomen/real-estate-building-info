const srcDir = 'src';
const distDir = 'dist';
let processDir = srcDir;

const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

function scss() {
  return gulp
    .src(srcDir + '/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(processDir + '/css'));
}

function js() {
  return gulp
    .src(srcDir + '/js/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(processDir + '/js'));
}

function watch() {
  processDir = srcDir;
  gulp.watch(srcDir + '/scss/*.scss', scss);
}

function prod(done) {
  processDir = distDir;
  scss();
  js();
  gulp
    .src(srcDir + '/index.html')
    .pipe(gulp.dest(processDir));

  return done();
}

exports.watch = watch;
exports.prod = prod;

// exports.default = dev;
