import { Translation } from './translation';

function HexToRGB(hex) {
  let parse = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.exec(hex);
  if (parse) {
    return {
      r: parseInt(parse[1], 16),
      g: parseInt(parse[2], 16),
      b: parseInt(parse[3], 16)
    }
  }
  parse = /^#?([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])$/i.exec(hex);
  if (parse) {
    return {
      r: parseInt(parse[1].repeat(2), 16),
      g: parseInt(parse[2].repeat(2), 16),
      b: parseInt(parse[3].repeat(2), 16)
    }
  }
}

export function HexToRGBA(hex, alpha) {
  const rgb = HexToRGB(hex);
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function format2Hex(val) {
  const hex = val.toString(16);
  return hex.length == 1 && ("0" + hex) || hex;
}

function rgbToHex(r, g, b) {
  return `#${format2Hex(r)}${format2Hex(g)}${format2Hex(b)}`;
}

function reversedColor(color) {
  const rgb = HexToRGB(color);
  const index = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114))/1000;
  return index >= 128 && 'black' || 'white';
}

export class ColorPicker {
  constructor(main, callback) {
    this.callback = callback;
    this.main = main;
    this.w = 180;
    this.h = 150;
    const w = this.w;
    const h = this.h;
    this.lightPosition = this.w - 1;

    this.wrapper = document.querySelector(`#${main.id} .ptro-color-widget-wrapper`);
    this.input = document.querySelector(`#${main.id} .ptro-color-widget-wrapper .ptro-color`);
    this.inputAlpha = document.querySelector(`#${main.id} .ptro-color-widget-wrapper .ptro-color-alpha`);
    this.pipetteButton = document.querySelector(`#${main.id} .ptro-color-widget-wrapper button.ptro-pipette`);
    this.closeButton = document.querySelector(`#${main.id} .ptro-color-widget-wrapper button.ptro-close`);
    this.colorRegulator = document.querySelector(`#${main.id} .ptro-color-widget-wrapper .ptro-color-light-regulator`);
    this.canvas = document.querySelector(`#${main.id} .ptro-color-widget-wrapper canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.canvasLight = document.querySelector(`#${main.id} .ptro-color-widget-wrapper .ptro-canvas-light`);
    this.ctxLight  = this.canvasLight.getContext('2d');
    this.canvas.setAttribute('width', w);
    this.canvas.setAttribute('height', h);
    this.canvasLight.setAttribute('width', w);
    this.canvasLight.setAttribute('height', 20);

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

    this.canvas.onmousedown = (e) => {
      this.selecting = true;
      this.getPaletteColorAtPoint(e)
    };

    const startLightSelecting = (e) => {
      this.lightSelecting = true;
      this.getColorLightAtClick(e);
    };

    this.canvasLight.onmousedown = startLightSelecting;
    this.colorRegulator.onmousedown = startLightSelecting;

    this.closeButton.onclick = () => {
      this.wrapper.setAttribute('hidden', 'true');
      this.opened = false;
    };

    this.pipetteButton.onclick = () => {
      this.wrapper.setAttribute('hidden', 'true');
      this.opened = false;
      this.choosing = true;
    };

    this.input.onkeyup = () => {
      this.setActiveColor(this.input.value, true);
    };
    this.inputAlpha.value  = this.alpha;
    this.inputAlpha.oninput = () => {
      this.alpha = this.inputAlpha.value;
      this.setActiveColor(this.color, true);
    };
  }

  open(state, addCallback) {
    this.target = state.target;
    this.palleteColor = state.palleteColor;
    this.alpha = state.alpha;
    this.lightPosition = this.lightPosition || this.w - 1;

    this.drawLighter();
    this.colorRegulator.style.left = this.lightPosition;
    this.regetColor();
    this.inputAlpha.value = this.alpha;

    this.wrapper.removeAttribute('hidden');
    this.opened = true;
    this.addCallback = addCallback;
  }

  getPaletteColorAtPoint(e) {
    let x = e.clientX - this.canvas.documentOffsetLeft;
    let y = e.clientY - this.canvas.documentOffsetTop;
    x = x < 1 && 1 || x;
    y = y < 1 && 1 || y;
    x = x > this.w && this.w - 1 || x;
    y = y > this.h && this.h - 1 || y;
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    this.palleteColor = rgbToHex(p[0], p[1], p[2]);
    this.drawLighter();
    this.regetColor();
  }

  regetColor() {
    const p = this.ctxLight.getImageData(this.lightPosition, 5, 1, 1).data;
    this.setActiveColor(rgbToHex(p[0], p[1], p[2]));
  }

  getColorLightAtClick(e) {
    let x = e.clientX - this.canvasLight.documentOffsetLeft;
    x = x < 1 && 1 || x;
    x = x > this.w - 1 && this.w - 1 || x;
    this.lightPosition = x;
    this.colorRegulator.style.left = x;
    this.regetColor();
  }

  handleMouseDown(e) {
    if (this.choosing && e.button === 0) { //0 - m1, 1 middle, 2-m2
      this.choosingActive = true;
      this.handleMouseMove(e);
      return true;
    } else {
      this.choosing = false;
    }
  }

  handleMouseMove(e) {
    if (this.opened) {
      if (this.selecting) {
        this.getPaletteColorAtPoint(e)
      }
      if (this.lightSelecting) {
        this.getColorLightAtClick(e)
      }
    } else if (this.choosingActive) {
      const scale = this.main.getScale();
      let x = (e.clientX - this.main.canvas.documentOffsetLeft)*scale;
      x = x < 1 && 1 || x;
      x = x > this.main.size.w - 1 && this.main.size.w - 1 || x;
      let y = (e.clientY - this.main.canvas.documentOffsetTop)*scale;
      y = y < 1 && 1 || y;
      y = y > this.main.size.h - 1 && this.main.size.h - 1 || y;
      const p = this.main.ctx.getImageData(x, y, 1, 1).data;
      const color = rgbToHex(p[0], p[1], p[2]);
      this.callback({
        alphaColor: HexToRGBA(color, 1),
        lightPosition: this.w - 1,
        alpha: 1,
        palleteColor: color,
        target: this.target
      });
      if (this.addCallback !== undefined) {
        this.addCallback({
          alphaColor:HexToRGBA(color, 1),
          lightPosition: this.w - 1,
          alpha: 1,
          palleteColor: color,
          target: this.target
        });
      }
    }
  }

  handleMouseUp(e) {
    this.selecting = false;
    this.lightSelecting = false;
    this.choosing = false;
    this.choosingActive = false;
  }

  setActiveColor(color, ignoreUpdateText) {
    try {
      this.input.style.color = reversedColor(color);
    } catch (e) {
      return
    }
    this.input.style['background-color'] = color;
    if (ignoreUpdateText == undefined) {
      this.input.value = color;
    }
    this.color = color;
    this.alphaColor = HexToRGBA(color, this.alpha);
    if (this.callback !== undefined && this.opened) {
      this.callback({
        alphaColor: this.alphaColor,
        lightPosition: this.lightPosition,
        alpha: this.alpha,
        palleteColor: this.palleteColor,
        target: this.target
      });
    }
    if (this.addCallback !== undefined && this.opened) {
      this.addCallback({
        alphaColor: this.alphaColor,
        lightPosition: this.lightPosition,
        alpha: this.alpha,
        palleteColor: this.palleteColor,
        target: this.target
      });
    }
  }

  static html() {
    return '<div class="ptro-color-widget-wrapper" hidden>' +
      '<div class="ptro-color-widget">' +
        '<div class="ptro-pallet ptro-color-main">' +
          '<canvas></canvas>' +
          '<canvas class="ptro-canvas-light"></canvas>' +
          '<span class="ptro-color-light-regulator ptro-bordered-control"></span>' +
          '<div class="ptro-colors"></div>' +
            '<div class="ptro-color-edit">' +
              '<button class="ptro-icon-btn ptro-pipette ptro-color-control" style="float: left; margin-right: 5px">' +
                '<i class="ptro-icon ptro-icon-pipette"></i>' +
              '</button>' +
              '<input class="ptro-color" type="text" size="7"/>' +
              `<span style="float:right"><span class="ptro-color-alpha-label" ` +
                `title="${Translation.get().tr('alphaFull')}">${Translation.get().tr('alpha')}</span>` +
              '<input class="ptro-color-alpha ptro-input" type="number" min="0" max="1" step="0.1"/></span>' +
              '<div><button class="ptro-named-btn ptro-close ptro-color-control" ' +
                'style="margin-top: 8px;position: absolute; top: 225px; right: 10px;width: 50px;">'+
                `${Translation.get().tr('close')}</button></div>` +
            '</div>' +
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
}