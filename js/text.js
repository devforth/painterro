import html2canvas from 'html2canvas';
import { KEYS, checkIn } from './utils';
import { tr } from './translation';

export default class TextTool {
  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.wrapper = main.wrapper;
    this.input = this.el.querySelector('.ptro-text-tool-input');
    this.inputWrapper = this.el.querySelector('.ptro-text-tool-input-wrapper');
    this.inputWrapper.style.display = 'none';
    this.setFontSize(main.params.defaultFontSize);
    this.setFontStrokeSize(main.params.fontStrokeSize);
    this.setFont(TextTool.getFonts()[0].value);
    this.setFontStyle(TextTool.getFontStyles()[0].value);

    this.el.querySelector('.ptro-text-tool-apply').onclick = () => {
      this.apply();
    };

    this.el.querySelector('.ptro-text-tool-cancel').onclick = () => {
      this.close();
    };
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
        name: f.split(',')[0].replace(/"/g, ''),
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
    this.input.style['-webkit-text-stroke'] = `${this.fontStrokeSize}px ${this.strokeColor}`;
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

  setStrokeColor(color) {
    this.strokeColor = color;
    this.input.style['-webkit-text-stroke'] = `${this.fontStrokeSize}px ${this.strokeColor}`;
  }

  inputLeft() {
    return this.input.documentOffsetLeft + this.main.scroller.scrollLeft;
  }

  inputTop() {
    return this.input.documentOffsetTop + this.main.scroller.scrollTop;
  }

  reLimit() {
    this.inputWrapper.style.right = 'auto';
    if (this.inputLeft() + this.input.clientWidth >
        this.main.elLeft() + this.el.clientWidth) {
      this.inputWrapper.style.right = '0';
    } else {
      this.inputWrapper.style.right = 'auto';
    }

    this.inputWrapper.style.bottom = 'auto';
    if (this.inputTop() + this.input.clientHeight >
        this.main.elTop() + this.el.clientHeight) {
      this.inputWrapper.style.bottom = '0';
    } else {
      this.inputWrapper.style.bottom = 'auto';
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
      this.inputWrapper.style.left = `${this.crd[0]}px`;
      this.inputWrapper.style.top = `${this.crd[1]}px`;
      this.inputWrapper.style.display = 'inline';
      this.input.focus();
      this.reLimit();
      this.input.onkeydown = (e) => {
        if (e.ctrlKey && e.keyCode === KEYS.enter) {
          this.apply();

          e.preventDefault();
        }
        if (e.keyCode === KEYS.esc) {
          this.close();
          this.main.closeActiveTool();
          e.preventDefault();
        }
        this.reLimit();
        if (this.pendingClear) {
          this.input.innerText = this.input.innerText.slice(1);
          this.pendingClear = false;
        }
      };
      if (!this.main.isMobile) {
        event.preventDefault();
      }
    }
  }

  apply() {
    const origBorder = this.input.style.border;
    this.input.style.border = 'none';
    html2canvas(this.input, {
      backgroundColor: null,
      logging: false,
      scale: 1 / this.main.zoomFactor,
    }).then((can) => {
      this.ctx.drawImage(can, this.scaledCord[0], this.scaledCord[1]);
      this.input.style.border = origBorder;
      this.close();
      this.main.worklog.captureState();
      this.main.closeActiveTool();
    });
  }

  close() {
    this.active = false;
    this.inputWrapper.style.display = 'none';
  }

  static code() {
    return '<span class="ptro-text-tool-input-wrapper">' +
      '<div contenteditable="true" class="ptro-text-tool-input"></div>' +
        '<span class="ptro-text-tool-buttons">' +
          `<button class="ptro-text-tool-apply ptro-icon-btn ptro-color-control" title="${tr('apply')}" 
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-apply"></i>' +
          '</button>' +
          `<button class="ptro-text-tool-cancel ptro-icon-btn ptro-color-control" title="${tr('cancel')}"
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-close"></i>' +
          '</button>' +
        '</span>' +
      '</span>';
  }
}
