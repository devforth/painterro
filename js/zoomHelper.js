function passEvent(element, e) {
  console.log(e);
  let new_e = new MouseEvent(e.type, e)
  if (document.createEvent) {
    element.dispatchEvent(new_e);
  } else {
    element.fireEvent("on" + new_e.eventType, new_e);
  }
}

export class ZoomHelper {
  constructor(main) {
    this.main = main;
    this.zomer = document.querySelector(`#${this.main.id} .ptro-zoomer`);
    this.zomerCtx = this.zomer.getContext('2d');
    this.canvas = this.main.canvas;
    this.ctx = this.main.ctx;
    this.wrapper = this.main.wrapper;

    this.gridColor = this.zomerCtx.createImageData(1, 1);
    this.gridColor.data[0] = 255;
    this.gridColor.data[1] = 255;
    this.gridColor.data[2] = 255;
    this.gridColor.data[3] = 255;

    this.gridColorRed = this.zomerCtx.createImageData(1, 1);
    this.gridColorRed.data[0] = 255;
    this.gridColorRed.data[1] = 0;
    this.gridColorRed.data[2] = 0;
    this.gridColorRed.data[3] = 255;

    this.captW = 7;
    this.middle = Math.ceil(this.captW / 2) - 1;
    this.periodW = 14;

    this.fullW = this.captW * (this.periodW);
    this.halfFullW = this.fullW / 2;
    this.zomer.setAttribute('width', this.fullW );
    this.zomer.setAttribute('height', this.fullW );
    this.cursor = this.wrapper.style.cursor;
    this.zomer.onmousedown = (e) => {passEvent(this.wrapper, e)};
    this.zomer.onmousemove = (e) => {passEvent(this.wrapper, e)};
  }

  handleMouseMove(e) {
    if (e.altKey) {
      if (!this.shown) {
        this.shown = true;
        this.zomer.style.display="block";
        this.cursor = this.wrapper.style.cursor;
        this.wrapper.style.cursor = 'none';
      }
      const scale = this.main.getScale();

      let x = (e.clientX - this.canvas.documentOffsetLeft) * scale;
      x = x < 1 && 1 || x;
      x = x > this.main.size.w - 1 && this.main.size.w - 1 || x;
      let y = (e.clientY - this.canvas.documentOffsetTop) * scale;
      y = y < 1 && 1 || y;
      y = y > this.main.size.h - 1 && this.main.size.h - 1 || y;

      const captW = this.captW;
      const periodW = this.periodW;

      for (let i = 0; i < captW; i++) {
        for (let j = 0; j < captW; j++) {
          const d = this.ctx.getImageData(x + i - this.middle, y + j - this.middle, 1, 1);
          for (let ii = 0; ii < periodW; ii++) {
            for (let jj = 0; jj < periodW; jj++) {
              if (ii == periodW - 1 || jj == periodW - 1) {
                if ((i == this.middle && j == this.middle) ||
                  (i == this.middle && j == this.middle - 1 && jj == periodW - 1) ||
                  (i == this.middle - 1 && j == this.middle && ii == periodW - 1)) {
                  this.zomerCtx.putImageData(this.gridColorRed, i * periodW + ii, j * periodW + jj);
                } else {
                  this.zomerCtx.putImageData(this.gridColor, i * periodW + ii, j * periodW + jj);
                }
              } else {
                this.zomerCtx.putImageData(d, i * periodW + ii, j * periodW + jj);
              }
            }
          }
        }
      }
      this.zomer.style.left = e.clientX - this.wrapper.documentOffsetLeft - this.halfFullW;
      this.zomer.style.top = e.clientY - this.wrapper.documentOffsetTop - this.halfFullW;
    } else {
      if (this.shown) {
        this.zomer.style.display = "none";
        this.wrapper.style.cursor = this.cursor;
        this.shown = false;
      }
    }
  }


  static html() {
    return '<canvas class="ptro-zoomer" width="" height="0"></canvas>'
  }
}