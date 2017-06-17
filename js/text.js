export class TextTool {

  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.font = this.getFonts()[0];
  }

  getFont() {
    return this.font;
  }

  getFonts() {
    const fonts = [
      'Arial, Helvetica, sans-serif',
      '"Arial Black", Gadget, sans-serif',
      '"Comic Sans MS", cursive, sans-serif',
      'Impact, Charcoal, sans-serif',
      '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
      'Tahoma, Geneva, sans-serif',
      '"Trebuchet MS", Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif',
      '"Courier New", Courier, monospace',
      '"Lucida Console", Monaco, monospace',
    ];

    let res = [];
    for (let f of fonts) {
      res.push({
        value: f,
        name: f.split(',')[0].replace(/"/g, '')
      })
    }
    return res;
  }

  setFont(font) {
    this.font = font;
  }
}
