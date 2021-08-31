import { KEYS } from './utils';
import { tr } from './translation';
import domtoimage from 'dom-to-image';

export default class TextTool {
  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.wrapper = main.wrapper;
    this.input = this.el.querySelector('.ptro-text-tool-input');
    this.inputWrapper = this.el.querySelector('.ptro-text-tool-input-wrapper');
    this.inputWrapper.style.display = 'none';
    this.isBold = main.params.defaultFontBold;
    this.isItalic = main.params.defaultFontItalic;
    this.strokeOn = main.params.defaultTextStrokeAndShadow;

    this.strokeColor = main.params.textStrokeAlphaColor;
    this.setFontSize(main.params.defaultFontSize);
    this.setFont(this.getFonts()[0].value);
    this.setFontIsBold(this.isBold);
    this.setFontIsItalic(this.isItalic);

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
      ...this.main.params.extraFonts,
    ];

    const res = [];
    fonts.forEach((f) => {
      const fontName = f.split(',')[0].replace(/"/g, '');
      res.push({
        value: f,
        name: fontName,
        extraStyle: `font-family:${f}`,
        title: fontName,
      });
    });
    return res;
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

  setStrokeOn(state) {
    this.strokeOn = state;
    this.setStrokeParams();
  }

  setFontIsBold(state) {
    this.isBold = state;
    if (state) {
      this.input.style['font-weight'] = 'bold';
    } else {
      this.input.style['font-weight'] = 'normal';
    }
    if (this.active) {
      this.input.focus();
      this.reLimit();
    }
    this.setStrokeParams();
  }

  setFontIsItalic(state) {
    this.isItalic = state;
    if (state) {
      this.input.style['font-style'] = 'italic';
    } else {
      this.input.style['font-style'] = 'normal';
    }
    if (this.active) {
      this.input.focus();
      this.reLimit();
    }
  }

  setFontSize(size) {
    this.fontSize = size;
    this.input.style['font-size'] = `${size}px`;
    this.setStrokeParams();
    if (this.active) {
      this.reLimit();
    }
  }

  setStrokeParams() {
    if (this.strokeOn) {
      const st = 1;
      this.input.style['text-shadow'] = `
      -${st}px -${st}px 1px ${this.strokeColor},${st}px -${st}px 1px ${this.strokeColor},
      -${st}px  ${st}px 1px ${this.strokeColor},${st}px  ${st}px 1px ${this.strokeColor},
      ${st}px ${st}px ${Math.log(this.fontSize) * this.main.params.shadowScale}px black`;
    } else {
      this.input.style['text-shadow'] = 'none';
    }
  }

  setFontColor(color) {
    this.color = color;
    this.input.style.color = color;
    this.input.style['outline-color'] = color;
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
        e.stopPropagation();
      };
      if (!this.main.isMobile) {
        event.preventDefault();
      }
    }
  }

  apply() {
    const origBorder = this.input.style.border;
    const scale = this.main.getScale();
    this.input.style.border = 'none';
    domtoimage.toPng(this.input, {
      style: {
        'transform-origin': 'top left',
        transform: `scale(${scale})`
      },
      width: this.input.clientWidth * scale,
      height: this.input.clientHeight * scale,
    })
      .then((dataUrl) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          this.ctx.drawImage(img, this.scaledCord[0], this.scaledCord[1]);
          this.input.style.border = origBorder;
          this.close();
          this.main.worklog.captureState();
          this.main.closeActiveTool();
        };
      })
      .catch(function (error) {
          console.error('oops, something went wrong!', error);
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
          `<button type="button" class="ptro-text-tool-apply ptro-icon-btn ptro-color-control" title="${tr('apply')}" 
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-apply"></i>' +
          '</button>' +
          `<button type="button" class="ptro-text-tool-cancel ptro-icon-btn ptro-color-control" title="${tr('cancel')}"
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-close"></i>' +
          '</button>' +
        '</span>' +
      '</span>';
  }
}
