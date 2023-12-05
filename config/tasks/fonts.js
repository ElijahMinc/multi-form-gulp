const { src, dest } = require('gulp');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const paths = require('../path.js');

const fontsTask = () => {
  return src(paths.src.fonts)
    .pipe(ttf2woff())
    .pipe(ttf2woff2())
    .pipe(dest(paths.build.fonts));
};

module.exports = fontsTask;
