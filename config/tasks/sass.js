const mode = require('../../gulpfile.js');
const { src, dest } = require('gulp');

const paths = require('../path.js');
const { browserSync } = require('./server');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const gcmq = require('gulp-group-css-media-queries');

// const hash = require('gulp-hash-filename');

const gulpif = require('gulp-if');

const scssTask = () => {
  return (
    src(paths.src.styles)
      .pipe(sass().on('error', sass.logError))
      .pipe(gcmq())
      .pipe(
        autoprefixer({
          grid: true,
          flexbox: true,
          overrideBrowserlist: ['>0.2%', 'not dead', 'not op_mini all'],
          cascade: true,
        })
      )
      //is Production mode
      .pipe(gulpif(mode.isProd, gcmq()))
      .pipe(gulpif(mode.isProd, cleanCSS({ compatibility: 'ie8' })))
      .pipe(gulpif(mode.isProd, rename('styles.min.css')))
      // dest files
      .pipe(dest(paths.build.styles))
      .pipe(browserSync.stream())
  );
};

module.exports = scssTask;
