const mode = require('../../gulpfile.js');

const { src, dest } = require('gulp');

const paths = require('../path.js');

const { browserSync } = require('./server');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

const imgTask = () => {
  return (
    src(paths.src.images)
      .pipe(newer(paths.build.images))
      .pipe(
        imagemin({
          optimizationLevel: 5,
        })
      )
      .pipe(dest(paths.build.images))

      //dest files
      .pipe(dest(paths.build.images))
      .pipe(browserSync.stream())
  );
};

module.exports = imgTask;
