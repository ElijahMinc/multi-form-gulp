const srcDefaultPath = './src';
const buildDefaultPath = './build';

const paths = {
  build: {
    html: `${buildDefaultPath}/`,
    styles: `${buildDefaultPath}/styles`,
    script: `${buildDefaultPath}/script`,
    images: `${buildDefaultPath}/images`,
    fonts: `${buildDefaultPath}/fonts`,
    files: `${buildDefaultPath}/files`,
    readme: `${buildDefaultPath}/`,
  },
  src: {
    html: `${srcDefaultPath}/*.html`,
    styles: `${srcDefaultPath}/styles/**/index.scss`,
    script: `${srcDefaultPath}/script/**/*.js`,
    images: `${srcDefaultPath}/images/*.{jpeg,jpg,png,svg,gif}`,
    fonts: `${srcDefaultPath}/fonts/*.{ttf,woff, ttf2}`,
    files: `${srcDefaultPath}/files/**/*.{txt,mp4,mp3}`,
    readme: `${srcDefaultPath}/Readme.txt`,
  },
  watch: {
    html: [`${srcDefaultPath}/*.html`, `${srcDefaultPath}/html/**/*.html`],
    styles: `${srcDefaultPath}/styles/**/*.scss`,
    script: `${srcDefaultPath}/script/**/*.{js,ts}`,
    fonts: `${srcDefaultPath}/fonts/*.{ttf,woff,ttf2}`,
  },
  clean: buildDefaultPath,
};

module.exports = paths;
