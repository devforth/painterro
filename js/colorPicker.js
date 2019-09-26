import { tr } from './translation';
import { KEYS } from './utils';

export function HexToRGB(hex) {
  let parse = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.exec(hex);
  if (parse) {
    return {
      r: parseInt(parse[1], 16),
      g: parseInt(parse[2], 16),
      b: parseInt(parse[3], 16),
    };
  }
  parse = /^#?([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])$/i.exec(hex);
  if (parse) {
    return {
      r: parseInt(parse[1].repeat(2), 16),
      g: parseInt(parse[2].repeat(2), 16),
      b: parseInt(parse[3].repeat(2), 16),
    };
  }
}

export function HexToRGBA(hex, alpha) {
  const rgb = HexToRGB(hex);
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function format2Hex(val) {
  const hex = val.toString(16);
  return (hex.length === 1 && (`0${hex}`)) || hex;
}

export function rgbToHex(r, g, b) {
  return `#${format2Hex(r)}${format2Hex(g)}${format2Hex(b)}`;
}

function reversedColor(color) {
  const rgb = HexToRGB(color);
  const index = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return (index >= 128 && 'black') || 'white';
}

export default class ColorPicker {
  constructor(main, callback) {
    this.callback = callback;
    this.main = main;
    this.w = 180;
    this.h = 150;
    const w = this.w;
    const h = this.h;
    this.lightPosition = this.w - 1;
    this.wrapper = main.wrapper.querySelector('.ptro-color-widget-wrapper');
    this.input = main.wrapper.querySelector('.ptro-color-widget-wrapper .ptro-color');
    this.pipetteButton = main.wrapper.querySelector('.ptro-color-widget-wrapper button.ptro-pipette');
    this.closeButton = main.wrapper.querySelector('.ptro-color-widget-wrapper button.ptro-close-color-picker');
    this.canvas = main.wrapper.querySelector('.ptro-color-widget-wrapper canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvasLight = main.wrapper.querySelector('.ptro-color-widget-wrapper .ptro-canvas-light');
    this.colorRegulator = main.wrapper.querySelector('.ptro-color-widget-wrapper .ptro-color-light-regulator');

    this.canvasAlpha = main.wrapper.querySelector('.ptro-color-widget-wrapper .ptro-canvas-alpha');
    this.alphaRegulator = main.wrapper.querySelector('.ptro-color-widget-wrapper .ptro-color-alpha-regulator');

    this.ctxLight = this.canvasLight.getContext('2d');
    this.ctxAlpha = this.canvasAlpha.getContext('2d');
    this.canvas.setAttribute('width', `${w}`);
    this.canvas.setAttribute('height', `${h}`);
    this.canvasLight.setAttribute('width', `${w}`);
    this.canvasLight.setAttribute('height', `${20}`);
    this.canvasAlpha.setAttribute('width', `${w}`);
    this.canvasAlpha.setAttribute('height', `${20}`);
    const palette = this.ctx.createLinearGradient(0, 0, w, 0);
    palette.addColorStop(1 / 15, '#ff0000');
    palette.addColorStop(4 / 15, '#ffff00');
    palette.addColorStop(5 / 15, '#00ff00');
    palette.addColorStop(9 / 15, '#00ffff');
    palette.addColorStop(12 / 15, '#0000ff');
    palette.addColorStop(14 / 15, '#ff00ff');
    this.ctx.fillStyle = palette;
    this.ctx.fillRect(0, 0, w, h);

    const darkOverlay = this.ctx.createLinearGradient(0, 0, 0, h);
    darkOverlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
    darkOverlay.addColorStop(0.99, 'rgba(0, 0, 0, 1)');
    darkOverlay.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = darkOverlay;
    this.ctx.fillRect(0, 0, w, h);

    this.closeButton.onclick = () => {
      this.close();
    };
    this.pipetteButton.onclick = () => {
      this.wrapper.setAttribute('hidden', 'true');
      this.opened = false;
      this.choosing = true;
    };

    this.input.onkeyup = () => {
      this.setActiveColor(this.input.value, true);
    };
  }

  open(state, addCallback) {
    this.target = state.target;
    this.palleteColor = state.palleteColor;
    this.alpha = state.alpha;
    this.lightPosition = this.lightPosition || this.w - 1;

    this.drawLighter();
    this.colorRegulator.style.left = `${this.lightPosition}px`;
    this.alphaRegulator.style.left = `${Math.round(this.alpha * this.w)}px`;
    this.regetColor();

    this.wrapper.removeAttribute('hidden');
    this.opened = true;
    this.addCallback = addCallback;
  }

  close() {
    this.wrapper.setAttribute('hidden', 'true');
    this.opened = false;
  }

  getPaletteColorAtPoint(e) {
    let x = e.clientX - this.canvas.documentOffsetLeft;
    let y = e.clientY - this.canvas.documentOffsetTop;
    x = (x < 1 && 1) || x;
    y = (y < 1 && 1) || y;
    x = (x > this.w && this.w - 1) || x;
    y = (y > this.h && this.h - 1) || y;
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    this.palleteColor = rgbToHex(p[0], p[1], p[2]);
    this.drawLighter();
    this.regetColor();
  }

  regetColor() {
    const p = this.ctxLight.getImageData(this.lightPosition, 5, 1, 1).data;
    this.setActiveColor(rgbToHex(p[0], p[1], p[2]));
    this.drawAlpher();
  }

  regetAlpha() {
    const p = this.ctxAlpha.getImageData(this.alphaPosition, 5, 1, 1).data;
    this.alpha = p[3] / 255;
    this.setActiveColor(this.color, true);
  }

  getColorLightAtClick(e) {
    let x = e.clientX - this.canvasLight.documentOffsetLeft;
    x = (x < 1 && 1) || x;
    x = (x > this.w - 1 && this.w - 1) || x;
    this.lightPosition = x;
    this.colorRegulator.style.left = `${x}px`;
    this.regetColor();
  }

  getAlphaAtClick(e) {
    let x = e.clientX - this.canvasAlpha.documentOffsetLeft;
    x = (x < 1 && 1) || x;
    x = (x > this.w - 1 && this.w - 1) || x;
    this.alphaPosition = x;
    this.alphaRegulator.style.left = `${x}px`;
    this.regetAlpha();
  }

  handleKeyDown(event) {
    if (this.opened && event.keyCode === KEYS.enter) {
      return true; // mark as handled - user might expect doing save by enter
    }
    if (this.opened && event.keyCode === KEYS.esc) {
      this.close();
      return true;
    }
    return false;
  }

  handleMouseDown(e) {
    if (this.choosing && e.button !== 2) { // 0 - m1, 1 middle, 2-m2
      this.choosingActive = true;
      this.handleMouseMove(e);
      return true;
    }
    this.choosing = false;
    if (e.target === this.canvas) {
      this.selecting = true;
      this.getPaletteColorAtPoint(e);
    }
    if (e.target === this.canvasLight || e.target === this.colorRegulator) {
      this.lightSelecting = true;
      this.getColorLightAtClick(e);
    }
    if (e.target === this.canvasAlpha || e.target === this.alphaRegulator) {
      this.alphaSelecting = true;
      this.getAlphaAtClick(e);
    }
    return false;
  }

  handleMouseMove(e) {
    if (this.opened) {
      if (this.selecting) {
        this.getPaletteColorAtPoint(e);
      }
      if (this.lightSelecting) {
        this.getColorLightAtClick(e);
      }
      if (this.alphaSelecting) {
        this.getAlphaAtClick(e);
      }
    } else if (this.choosingActive) {
      const scale = this.main.getScale();
      let x = ((e.clientX - this.main.elLeft()) +
        this.main.scroller.scrollLeft) * scale;
      x = (x < 1 && 1) || x;
      x = (x > this.main.size.w - 1 && this.main.size.w - 1) || x;
      let y = ((e.clientY - this.main.elTop()) +
        this.main.scroller.scrollTop) * scale;
      y = (y < 1 && 1) || y;
      y = (y > this.main.size.h - 1 && this.main.size.h - 1) || y;
      const p = this.main.ctx.getImageData(x, y, 1, 1).data;
      const color = rgbToHex(p[0], p[1], p[2]);
      this.callback({
        alphaColor: HexToRGBA(color, 1),
        lightPosition: this.w - 1,
        alpha: 1,
        palleteColor: color,
        target: this.target,
      });
      if (this.addCallback !== undefined) {
        this.addCallback({
          alphaColor: HexToRGBA(color, 1),
          lightPosition: this.w - 1,
          alpha: 1,
          palleteColor: color,
          target: this.target,
        });
      }
    }
  }

  handleMouseUp() {
    this.selecting = false;
    this.lightSelecting = false;
    this.choosing = false;
    this.choosingActive = false;
    this.alphaSelecting = false;
    this.main.zoomHelper.hideZoomHelper();
  }

  setActiveColor(color, ignoreUpdateText) {
    try {
      this.input.style.color = reversedColor(color);
    } catch (e) {
      return;
    }
    this.input.style['background-color'] = color;
    if (ignoreUpdateText === undefined) {
      this.input.value = color;
    }
    this.color = color;
    this.alphaColor = HexToRGBA(color, this.alpha);
    if (this.callback !== undefined && this.opened) {
      this.callback({
        alphaColor: this.alphaColor,
        lightPosition: this.lightPosition,
        alpha: this.alpha,
        palleteColor: this.color,
        target: this.target,
      });
    }
    if (this.addCallback !== undefined && this.opened) {
      this.addCallback({
        alphaColor: this.alphaColor,
        lightPosition: this.lightPosition,
        alpha: this.alpha,
        palleteColor: this.color,
        target: this.target,
      });
    }
  }

  static html() {
    return '' +
      '<div class="ptro-color-widget-wrapper ptro-common-widget-wrapper ptro-v-middle" hidden>' +
        '<div class="ptro-pallet ptro-color-main ptro-v-middle-in">' +
          '<canvas></canvas>' +
          '<canvas class="ptro-canvas-light"></canvas>' +
          '<span class="ptro-color-light-regulator ptro-bordered-control"></span>' +
          '<canvas class="ptro-canvas-alpha"></canvas>' +
          '<span class="alpha-checkers"></span>' +
          '<span class="ptro-color-alpha-regulator ptro-bordered-control"></span>' +
          '<div class="ptro-colors"></div>' +
          '<div class="ptro-color-edit">' +
            '<button type="button" class="ptro-icon-btn ptro-pipette ptro-color-control" style="float: left; margin-right: 5px">' +
              '<i class="ptro-icon ptro-icon-pipette"></i>' +
            '</button>' +
            '<input class="ptro-input ptro-color" type="text" size="7"/>' +
            '<button type="button" class="ptro-named-btn ptro-close-color-picker ptro-color-control" >' +
            `${tr('close')}</button>` +
          '</div>' +
        '</div>' +
      '</div>';
  }

  drawLighter() {
    const lightGradient = this.ctxLight.createLinearGradient(0, 0, this.w, 0);
    lightGradient.addColorStop(0, '#ffffff');
    lightGradient.addColorStop(0.05, '#ffffff');
    lightGradient.addColorStop(0.95, this.palleteColor);
    lightGradient.addColorStop(1, this.palleteColor);
    this.ctxLight.fillStyle = lightGradient;
    this.ctxLight.fillRect(0, 0, this.w, 15);
  }

  drawAlpher() {
    this.ctxAlpha.clearRect(0, 0, this.w, 15);
    const lightGradient = this.ctxAlpha.createLinearGradient(0, 0, this.w, 0);
    lightGradient.addColorStop(0, 'rgba(255,255,255,0)');
    lightGradient.addColorStop(0.05, 'rgba(255,255,255,0)');
    lightGradient.addColorStop(0.95, this.color);
    lightGradient.addColorStop(1, this.color);
    this.ctxAlpha.fillStyle = lightGradient;
    this.ctxAlpha.fillRect(0, 0, this.w, 15);
  }
}
