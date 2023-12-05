const { src, dest } = require('gulp');
const paths = require('../path.js');
const mode = require('../../gulpfile.js');
const { browserSync } = require('./server');
const fileinclude = require('gulp-file-include');

const scriptTask = () => {
  return src(paths.src.script)
    .pipe(
      fileinclude({
        prefix: '@@',
      })
    )
    .pipe(dest(paths.build.script))
    .pipe(browserSync.stream());
};

module.exports = scriptTask;
