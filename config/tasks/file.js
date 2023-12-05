const { src, dest } = require('gulp');

const paths = require('../path.js');

const fileTask = () => {
  return src(paths.src.files, { allowEmpty: true }).pipe(
    dest(paths.build.files)
  );
};

module.exports = fileTask;
