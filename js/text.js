export class TextTool {

  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.input = this.el.querySelector('.ptro-text-tool-input');

    this.setFontSize(main.params.defaultFontSize);
    this.setFont(this.getFonts()[0].value);
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
    this.input.style['font-family'] = font;
    if (this.active) {
      this.input.focus();
    }
    this.reLimit();
  }

  setFontSize(size) {
    this.fontSize = size;
    this.input.style['font-size'] = size;
    if (this.active) {
      this.input.focus();
    }
    this.reLimit();
  }

  setFontColor(color) {
    this.color = color;
    this.input.style.color = color;
  }


  activate() {

  }

  reLimit() {
    this.input.style.right = 'auto';
    if (this.input.documentOffsetLeft + this.input.clientWidth > this.el.documentOffsetLeft + this.el.clientWidth) {
      this.input.style.right = '0';
    } else {
      this.input.style.right = 'auto';
    }

    this.input.style.bottom = 'auto';
    if (this.input.documentOffsetTop + this.input.clientHeight > this.el.documentOffsetTop + this.el.clientHeight) {
      this.input.style.bottom = '0';
    } else {
      this.input.style.bottom = 'auto';
    }
  }

  procMouseDown(event) {
    const mainClass = event.target.classList[0];
    if (mainClass === 'ptro-crp-el') {
      if (! this.active) {
        this.input.innerHTML = '<br>';
        this.pendingClear = true;
      }
      this.active = true;
      this.crd = [
        event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
        event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop,
      ];
      const scale = this.main.getScale();
      this.scaledCord = [this.crd[0] * scale, this.crd[1] * scale];
      this.input.style.left = this.crd[0];
      this.input.style.top = this.crd[1];
      this.input.style.display = 'inline';
      this.input.focus();
      this.reLimit();
      this.input.onkeydown = (e) => {
        if (e.keyCode === 13) {
          e.preventDefault();
        }
        this.reLimit();
        if (this.pendingClear) {
          this.input.innerText = this.input.innerText.slice(1);
          this.pendingClear = false;
        }
      };
      event.preventDefault();
    }
  }

  apply() {
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${this.fontSize * this.main.getScale()}px ${this.font}`;
    this.ctx.fillText(this.input.innerText, this.scaledCord[0] + 2,
      this.scaledCord[1] + this.input.clientHeight * 0.8 * this.main.getScale());
    this.active = false;
    this.input.style.display = 'none';
  }

  static code() {
    return '<span contenteditable="true" class="ptro-text-tool-input" style="display:none"/>'
  }
}
