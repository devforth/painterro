import { KEYS, checkIn } from './utils';

export default class TextTool {
  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.wrapper = main.wrapper;
    this.input = this.el.querySelector('.ptro-text-tool-input');

    this.setFontSize(main.params.defaultFontSize);
    this.setFontStrokeSize(main.params.fontStrokeSize);
    this.setFont(TextTool.getFonts()[0].value);
    this.setFontStyle(TextTool.getFontStyles()[0].value);
  }

  getFont() {
    return this.font;
  }

  getFontStyle() {
    return this.fontStyle;
  }

  static getFonts() {
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

    const res = [];
    fonts.forEach((f) => {
      res.push({
        value: f,
        name: 'Aa',
        extraStyle: `font-family:${f}`,
        title: f.split(',')[0].replace(/"/g, ''),
      });
    });
    return res;
  }

  static getFontStyles() {
    return [
      {
        value: 'normal',
        name: 'N',
        title: 'Normal',
      },
      {
        value: 'bold',
        name: 'B',
        extraStyle: 'font-weight: bold',
        title: 'Bold',
      },
      {
        value: 'italic',
        name: 'I',
        extraStyle: 'font-style: italic',
        title: 'Italic',
      },
      {
        value: 'italic bold',
        name: 'BI',
        extraStyle: 'font-weight: bold; font-style: italic',
        title: 'Bold + Italic',
      },
    ];
  }

  setFont(font) {
    this.font = font;
    this.input.style['font-family'] = font;
    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontStyle(style) {
    this.fontStyle = style;
    if (checkIn('bold', this.fontStyle)) {
      this.input.style['font-weight'] = 'bold';
    } else {
      this.input.style['font-weight'] = 'normal';
    }
    if (checkIn('italic', this.fontStyle)) {
      this.input.style['font-style'] = 'italic';
    } else {
      this.input.style['font-style'] = 'normal';
    }

    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontSize(size) {
    this.fontSize = size;
    this.input.style['font-size'] = `${size}px`;
    // if (this.active) {
    //   this.input.focus();
    // }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontStrokeSize(size) {
    this.fontStrokeSize = size;
    this.input.style['-webkit-text-stroke'] = `${size}px ${this.main.currentBackground}`;
    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontColor(color) {
    this.color = color;
    this.input.style.color = color;
  }

  inputLeft() {
    return this.input.documentOffsetLeft + this.main.scroller.scrollLeft;
  }

  inputTop() {
    return this.input.documentOffsetTop + this.main.scroller.scrollTop;
  }

  reLimit() {
    this.input.style.right = 'auto';
    if (this.inputLeft() + this.input.clientWidth >
        this.main.elLeft() + this.el.clientWidth) {
      this.input.style.right = '0';
    } else {
      this.input.style.right = 'auto';
    }

    this.input.style.bottom = 'auto';
    if (this.inputTop() + this.input.clientHeight >
        this.main.elTop() + this.el.clientHeight) {
      this.input.style.bottom = '0';
    } else {
      this.input.style.bottom = 'auto';
    }
  }

  handleMouseDown(event) {
    const mainClass = event.target.classList[0];
    if (mainClass === 'ptro-crp-el') {
      if (!this.active) {
        this.input.innerHTML = '<br>';
        this.pendingClear = true;
      }
      this.active = true;
      this.crd = [
        (event.clientX - this.main.elLeft()) + this.main.scroller.scrollLeft,
        (event.clientY - this.main.elTop()) + this.main.scroller.scrollTop,
      ];
      const scale = this.main.getScale();
      this.scaledCord = [this.crd[0] * scale, this.crd[1] * scale];
      this.input.style.left = `${this.crd[0]}px`;
      this.input.style.top = `${this.crd[1]}px`;
      this.input.style.display = 'inline';
      this.input.focus();
      this.reLimit();
      this.input.onkeydown = (e) => {
        if (e.keyCode === KEYS.enter && !this.main.isMobile) {
          this.apply();
          this.main.closeActiveTool();
          e.preventDefault();
        }
        if (e.keyCode === KEYS.esc) {
          this.cancel();
          this.main.closeActiveTool();
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
    this.ctx.textAlign = 'left';
    this.ctx.font = `${this.fontStyle} ${this.fontSize * this.main.getScale()}px ${this.font}`;

    this.ctx.fillText(this.input.innerText, this.scaledCord[0] + 2,
      this.scaledCord[1] + (this.input.clientHeight * 0.8 * this.main.getScale()));

    this.ctx.strokeStyle = this.main.currentBackground;
    this.ctx.lineWidth = this.fontStrokeSize;
    this.ctx.strokeText(this.input.innerText, this.scaledCord[0] + 2,
      this.scaledCord[1] + (this.input.clientHeight * 0.8 * this.main.getScale()));

    this.active = false;
    this.input.style.display = 'none';
    this.main.worklog.captureState();
  }

  cancel() {
    this.active = false;
    this.input.style.display = 'none';
  }

  static code() {
    return '<span contenteditable="true" class="ptro-text-tool-input" style="display:none"></span>';
  }
}
