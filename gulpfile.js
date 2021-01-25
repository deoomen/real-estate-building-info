const srcDir = 'src';
const distDir = 'dist';
const devDir = 'dev';
let processDir = devDir;

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
  processDir = devDir;
  gulp.watch(srcDir + '/scss/*.scss', scss);
}

function dev(done) {
  processDir = devDir;
  scss();
  gulp
    .src(srcDir + '/js/*.js')
    .pipe(gulp.dest(processDir + '/js'));
  gulp
    .src(srcDir + '/index.html')
    .pipe(gulp.dest(processDir));
  gulp
    .src(srcDir + '/sample.json')
    .pipe(gulp.dest(processDir));

  return done();
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
exports.dev = dev;
exports.prod = prod;

exports.default = dev;
