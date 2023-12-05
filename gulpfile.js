const { series, parallel, watch, task } = require('gulp');
const paths = require('./config/path.js');

const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

module.exports = {
  isProd,
  isDev,
};

const fileTask = require('./config/tasks/file.js');
const cleanTask = require('./config/tasks/clean.js');
const htmlTask = require('./config/tasks/html.js');
const scssTask = require('./config/tasks/sass.js');
const { serverTask } = require('./config/tasks/server.js');
const imgTask = require('./config/tasks/img.js');
const scriptTask = require('./config/tasks/script.js');
const fontsTask = require('./config/tasks/fonts.js');

const watchFiles = () => {
  watch(paths.watch.html, htmlTask);
  watch(paths.watch.styles, scssTask);
  watch(paths.watch.script, scriptTask);
};

const server = parallel(watchFiles, serverTask);

const mainTasks = parallel(htmlTask, scssTask, scriptTask);
const mainTasksOnlyTemplate = parallel(htmlTask, scssTask);

const DEV_TASK = series(cleanTask, imgTask, fontsTask, mainTasks, server);
const PROD_TASK = series(cleanTask, imgTask, fontsTask, mainTasks);

// START_DEFAULT
task('default', isProd ? PROD_TASK : DEV_TASK);
