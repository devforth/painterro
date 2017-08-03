const webfontsGenerator = require('webfonts-generator');
const fs = require('fs');

fs.readdir('res', function(err, items) {
  if (err) {
    console.log('cant read res directory');
  }
  const files = items.filter((i) => i.toLowerCase().endsWith('.svg')).map(
    (i) => 'res/'+i);

  webfontsGenerator({
    files: files,
    dest: 'css/icons',
    fontName: 'ptroiconfont',
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

})


