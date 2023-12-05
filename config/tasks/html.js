const mode = require('../../gulpfile.js');

const { src, dest } = require('gulp');
const paths = require('../path.js');
const { browserSync } = require('./server');
const gulpif = require('gulp-if');
const versionNumber = require('gulp-version-number');
const decomment = require('gulp-decomment');
const fileinclude = require('gulp-file-include');

const htmlTask = () => {
  return src(paths.src.html)
    .pipe(
      fileinclude({
        prefix: '@@',
        context: {
          isProd: mode.isProd,
          isDev: mode.isDev,
        },
      })
    )
    .pipe(gulpif(mode.isProd, decomment({ trim: true })))

    .pipe(
      gulpif(
        mode.isProd,
        versionNumber({
          value: '%DT%',
          append: {
            key: '_v',
            cover: 0,
            to: ['css', 'js'],
          },
          output: {
            file: 'gulp/version.json',
          },
        })
      )
    )
    .pipe(dest(paths.build.html))
    .pipe(browserSync.stream());
};

module.exports = htmlTask;
