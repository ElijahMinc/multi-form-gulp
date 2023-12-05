const { src, dest } = require('gulp');

const paths = require('../path.js');

const readmeTask = () => {
  return src(paths.src.readme, { allowEmpty: true }).pipe(
    dest(paths.build.readme)
  );
};

module.exports = readmeTask;
