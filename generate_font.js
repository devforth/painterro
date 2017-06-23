const webfontsGenerator = require('webfonts-generator');

webfontsGenerator({
  files: [
    'res/brush.svg',
    'res/close.svg',
    'res/crop.svg',
    'res/ellipse.svg',
    'res/line.svg',
    'res/linked.svg',
    'res/loading.svg',
    'res/mirror.svg',
    'res/open.svg',
    'res/pipette.svg',
    'res/rect.svg',
    'res/resize.svg',
    'res/rotate.svg',
    'res/save.svg',
    'res/text.svg',
    'res/unlinked.svg',
  ],
  dest: 'css/icons',
  cssTemplate: 'res/font-css.hbs',
  templateOptions: {
    classPrefix: 'ptro-icon-',
    baseSelector: '.ptro-icon'
  },
  types: ['svg', 'ttf', 'woff', 'eot']
}, function (error) {
  if (error) {
    console.log('Fail!', error);
  } else {
    console.log('Done!');
  }
})
