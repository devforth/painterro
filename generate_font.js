const webfontsGenerator = require('@vusion/webfonts-generator');
const fs = require('fs');

fs.readdir('res/font', function(err, items) {
  if (err) {
    console.log('cant read res directory');
  }
  const files = items.filter((i) => i.toLowerCase().endsWith('.svg')).map(
    (i) => 'res/font/'+i);

  webfontsGenerator({
    files: files,
    dest: 'css/icons',
    fontName: 'ptroiconfont',
    
    html: true,
    // https://github.com/nfroidure/svgicons2svgfont
    normalize: true,
    round: 10e2,
    
    cssTemplate: 'res/font/font-css.hbs',
    templateOptions: {
      classPrefix: 'ptro-icon-',
      baseSelector: '.ptro-icon'
    },
    types: ['ttf', 'woff']
  }, function (error) {
    if (error) {
      console.log('Fail!', error);
    } else {
      console.log('Done!');
    }
  })

})


