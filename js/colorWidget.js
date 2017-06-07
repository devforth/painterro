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


function format2Hex(val) {
  const hex = val.toString(16);
  return hex.length == 1 && ("0" + hex) || hex;
}

function RGBToHex(r, g, b) {
  return `#${format2Hex(r)}${format2Hex(g)}${format2Hex(b)}`;
}


function reversedColor(color) {
  const rgb = HexToRGB(color);
  const index = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114))/1000;
  return index >= 128 && 'black' || 'white';
}

export class ColorWidget {
  constructor(main) {
    this.main = main;
    this.w = 180;
    this.h = 180;
    const w = this.w;
    const h = this.h;

    this.wrapper = document.querySelector(`#${main.id} .ptro-color-widget-wrapper`);

    this.input = document.querySelector(`#${main.id} .ptro-color-widget-wrapper input`);
    this.button = document.querySelector(`#${main.id} .ptro-color-widget-wrapper button`);
    this.canvas = document.querySelector(`#${main.id} .ptro-color-widget-wrapper canvas`);
    this.ctx = this.canvas.getContext('2d');

    this.canvas.setAttribute('width', w);
    this.canvas.setAttribute('height', h);
    const palette = this.ctx.createLinearGradient(0, 0, w, 0);
    palette.addColorStop(1 / 15, '#ff0000');
    palette.addColorStop(4 / 15, '#ffff00');
    palette.addColorStop(5 / 15, '#00ff00');
    palette.addColorStop(9 / 15, '#00ffff');
    palette.addColorStop(12 / 15, '#0000ff');
    palette.addColorStop(14 / 15, '#ff00ff');
   // palette.addColorStop(6 / 6, '#ff0000');
    this.ctx.fillStyle = palette;
    this.ctx.fillRect(0, 0, w, h);

    const whiteOverlay = this.ctx.createLinearGradient(0, 0, 0, h*2/5 + 20);
    whiteOverlay.addColorStop(0, 'rgba(255, 255, 255, 1)');
    whiteOverlay.addColorStop(0.05, 'rgba(255, 255, 255, 1)');
    whiteOverlay.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = whiteOverlay;
    this.ctx.fillRect(0, 0, w, h*2/5+ 20);

    const darkOverlay = this.ctx.createLinearGradient(0, h*3/5 - 20, 0, h);
    darkOverlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
    darkOverlay.addColorStop(0.99, 'rgba(0, 0, 0, 1)');
    darkOverlay.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = darkOverlay;
    this.ctx.fillRect(0, h*3/5 - 20, w, h);

    this.canvas.onmousedown = (e) => {
      this.selecting = true;
      this.getColorAtClick(e)
    };

    this.button.onclick = () => {this.wrapper.setAttribute('hidden', 'true');}
    this.setActiveColor(this.main.params.activeColor);
    this.input.onkeyup = () => {
      try {
        this.setActiveColor(this.input.value, true);
      }catch(e) {
        console.log(e);
      }
    }
  }

  open() {
    this.toolBtn = document.querySelector(`#${this.main.id} .color-diwget-btn`);
    this.wrapper.removeAttribute('hidden');
  }

  getColorAtClick(e) {
    let x = e.clientX - this.canvas.documentOffsetLeft;
    let y = e.clientY - this.canvas.documentOffsetTop;
    x = x < 1 && 1 || x;
    y = y < 1 && 1 || y;
    x = x > this.w && this.w - 1 || x;
    y = y > this.h && this.h - 1 || y;

    const p = this.ctx.getImageData(x, y, 1, 1).data;
    this.setActiveColor(RGBToHex(p[0], p[1], p[2]));
  }

  handleMouseMove(e) {
    if (this.selecting) {
      this.getColorAtClick(e)
    }
  }

  handleMouseUp(e) {
    this.selecting = false;
  }

  setActiveColor(color, ignoreUpdateText) {
    this.input.style.color = reversedColor(color);
    this.input.style['background-color'] = color;
    if (this.toolBtn != undefined) {
      this.toolBtn.style['background-color'] = color;
    }
    if (ignoreUpdateText == undefined) {
      this.input.value = color;
    }
    this.color = color;
  }

  static html() {
    return '<div class="ptro-color-widget-wrapper" hidden>' +
      '<div class="ptro-color-widget">' +
      '<div class="ptro-pallet">' +
      '<canvas></canvas>' +
      '<div class="ptro-colors"></div>' +
      '<div class="ptro-color-edit">' +
      '<input type="text"/>' +
      '<button class="named-btn">Close</button>' +
      '</div>' +
      '</div>' +

      '</div>' +
      '</div>';
  }


}