const srcDir = 'src';
const distDir = 'dist';

const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

function destDir() {
  return process.argv.indexOf('--prod') > -1 ? distDir : srcDir;
}

function scss() {
  return gulp
    .src(srcDir + '/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destDir() + '/css'));
}

function js() {
  return gulp
    .src(srcDir + '/js/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(destDir() + '/js'));
}

function watch() {
  gulp.watch(srcDir + '/scss/*.scss', scss);
  gulp.watch(srcDir + '/js/*.js', js);
}

function build() {

}

exports.watch = watch;
// exports.build = build;

exports.default = gulp.parallel(scss, js);
