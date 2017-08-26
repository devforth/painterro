export default class ZoomHelper {
  constructor(main) {
    this.main = main;
    this.zomer = main.wrapper.querySelector('.ptro-zoomer');
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
    this.periodW = 8;

    this.fullW = this.captW * (this.periodW);
    this.halfFullW = this.fullW / 2;
    this.zomer.setAttribute('width', this.fullW);
    this.zomer.setAttribute('height', this.fullW);
    this.cursor = this.wrapper.style.cursor;
  }

  handleMouseMove(e) {
    if (this.main.colorPicker.choosing && !e.altKey) {
      if (!this.shown) {
        this.shown = true;
        this.zomer.style.display = 'block';
        this.cursor = this.wrapper.style.cursor;
        this.wrapper.style.cursor = 'none';
      }
      const scale = this.main.getScale();
      const cord = [
        (e.clientX - this.main.elLeft()) + this.main.scroller.scrollLeft,
        (e.clientY - this.main.elTop()) + this.main.scroller.scrollTop,
      ];

      let x = cord[0] * scale;
      x = x < 1 ? 1 : x;
      x = x > this.main.size.w - 1 ? this.main.size.w - 1 : x;
      let y = cord[1] * scale;
      y = y < 1 ? 1 : y;
      y = y > this.main.size.h - 1 ? this.main.size.h - 1 : y;

      const captW = this.captW;
      const periodW = this.periodW;

      for (let i = 0; i < captW; i += 1) {
        for (let j = 0; j < captW; j += 1) {
          const d = this.ctx.getImageData((x + i) - this.middle, (y + j) - this.middle, 1, 1);
          for (let ii = 0; ii < periodW; ii += 1) {
            for (let jj = 0; jj < periodW; jj += 1) {
              if (ii === periodW - 1 || jj === periodW - 1) {
                if ((i === this.middle && j === this.middle) ||
                  (i === this.middle && j === this.middle - 1 && jj === periodW - 1) ||
                  (i === this.middle - 1 && j === this.middle && ii === periodW - 1)) {
                  this.zomerCtx.putImageData(
                    this.gridColorRed, (i * periodW) + ii,
                    (j * periodW) + jj);
                } else {
                  this.zomerCtx.putImageData(
                    this.gridColor, (i * periodW) + ii,
                    (j * periodW) + jj);
                }
              } else {
                this.zomerCtx.putImageData(d, (i * periodW) + ii, (j * periodW) + jj);
              }
            }
          }
        }
      }
      this.zomer.style.left = `${e.clientX - this.wrapper.documentOffsetLeft - this.halfFullW}px`;
      this.zomer.style.top = `${e.clientY - this.wrapper.documentOffsetTop - this.halfFullW}px`;
    } else if (this.shown) {
      this.hideZoomHelper();
    }
  }

  hideZoomHelper() {
    this.zomer.style.display = 'none';
    this.wrapper.style.cursor = this.cursor;
    this.shown = false;
  }

  static html() {
    return '<canvas class="ptro-zoomer" width="" height="0"></canvas>';
  }
}
