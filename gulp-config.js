var angular2 ='./src',
  src = './webapp',
  dist = './dist',
  appRoot = src,
  images = './img',
  scss = './scss',
  tmp = './tmp';

var paths = {
  ANGULAR2: angular2,
  APP_SCSS: scss + '/app',
  NODE_MODULES: './node_modules',
  SRC: src,
  DIST: dist,
  SCSS: scss,
  APP_ROOT: appRoot,
  TMP: tmp,
  IMAGES: images,
  ENV_CONFIG: src + '/config/environment.json'
};

module.exports = {
  paths: paths
};
