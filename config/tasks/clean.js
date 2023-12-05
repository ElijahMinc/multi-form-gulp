const { src } = require('gulp');

const paths = require('../path.js');

const clean = require('gulp-clean');

const cleanTask = () => {
  return src(paths.clean, { allowEmpty: true }).pipe(
    clean({
      allowEmpty: true,
    })
  );
};

module.exports = cleanTask;
