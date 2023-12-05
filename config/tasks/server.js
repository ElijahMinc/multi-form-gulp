const { src } = require('gulp');
const paths = require('../path.js');

const browserSync = require('browser-sync').create();

const serverTask = () => {
  return browserSync.init({
    server: {
      baseDir: paths.build.html,
    },
  });
};

module.exports = {
  serverTask,
  browserSync,
};
