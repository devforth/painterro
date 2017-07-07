import {clearSelection} from './utils';

export class PainterroSelecter {

  constructor(main, selectionCallback) {
    this.main = main;
    this.canvas = main.canvas;
    this.ctx = main.ctx;
    this.areaionCallback = selectionCallback;
    this.area = {
      el: main.toolContainer,
      rect: document.querySelector(`#${main.id} .ptro-crp-rect`),
    };
  }

  static code() {
    return '<div class="ptro-crp-rect" hidden>' +
      '<div class="ptro-crp-l select-handler" ></div><div class="ptro-crp-r select-handler" ></div>' +
      '<div class="ptro-crp-t select-handler" ></div><div class="ptro-crp-b select-handler" ></div>' +
      '<div class="ptro-crp-tl select-handler" ></div><div class="ptro-crp-tr select-handler" ></div>' +
      '<div class="ptro-crp-bl select-handler" ></div><div class="ptro-crp-br select-handler" ></div>' +
      '</div>';
  }

  activate() {
    this.area.activated = true;
    this.areaionCallback(false);
  }

  doCrop() {
    const img = new Image;
    img.onload = () => {
      this.main.resize(
        this.area.bottoml[0] - this.area.topl[0],
        this.area.bottoml[1] - this.area.topl[1]);
      this.main.ctx.drawImage(img,
        -this.area.topl[0], -this.area.topl[1]);
      this.main.adjustSizeFull();
      this.main.worklog.captureState();
    };
    img.src = this.canvas.toDataURL();
  }

  doPixelize() {
    const c = this.area.topl;
    const size = [
      this.area.bottoml[0] - this.area.topl[0],
      this.area.bottoml[1] - this.area.topl[1]
    ];

    this.pixelSize = (Math.min(size[0], size[1]) / 5);
    let pxData = [];
    const pxSize = [size[0] / this.pixelSize, size[1] / this.pixelSize];
    for (let i = 0; i < pxSize[0]; i++) {
      let row = [];
      for (let j = 0; j < pxSize[1]; j++) {
        row.push([0, 0, 0, 0, 0])
      }
      pxData.push(row);
    }
    const data = this.ctx.getImageData(c[0], c[1], size[0], size[1]);
    for (let i = 0; i < size[0]; i++) {
      for (let j = 0; j < size[1]; j++) {
        const ii = Math.floor(i / this.pixelSize);
        const jj = Math.floor(j / this.pixelSize);
        pxData[ii][jj][0] += data.data[(j * size[0] + i) * 4];
        pxData[ii][jj][1] += data.data[(j * size[0] + i) * 4 + 1];
        pxData[ii][jj][2] += data.data[(j * size[0] + i) * 4 + 2];
        pxData[ii][jj][3] += data.data[(j * size[0] + i) * 4 + 3];
        pxData[ii][jj][4] += 1;
      }
    }
    let d = new ImageData(1, 1);
    for (let i = 0; i < pxSize[0]; i++) {
      for (let j = 0; j < pxSize[1]; j++) {
        const s = pxData[i][j][4];
        d.data[0] = pxData[i][j][0] / s;
        d.data[1] = pxData[i][j][1] / s;
        d.data[2] = pxData[i][j][2] / s;
        d.data[3] = pxData[i][j][3] / s;
        for (let k = 0; k < this.pixelSize; k++) {
          for (let n = 0; n < this.pixelSize; n++) {
            this.ctx.putImageData(
              d,
              c[0] + i * this.pixelSize + k,
              c[1] + j * this.pixelSize + n);
          }
        }

      }
    }
    this.main.worklog.captureState();
  }

  reCalcCropperCords() {
    const ratio = this.canvas.clientWidth / this.canvas.getAttribute('width');
    this.area.topl = [
      Math.round((this.area.rect.documentOffsetLeft - this.area.el.documentOffsetLeft + 1) / ratio),
      Math.round((this.area.rect.documentOffsetTop - this.area.el.documentOffsetTop + 1) / ratio)];

    this.area.bottoml = [
      Math.round(this.area.topl[0] + (this.area.rect.clientWidth) / ratio),
      Math.round(this.area.topl[1] + (this.area.rect.clientHeight) / ratio)];

    // console.log('recalced cords', ratio, this.area.topl, this.area.bottoml);
  }

  handleMouseDown(event) {
    const mainClass = event.target.classList[0];
    const mousDownCallbacks = {
      'ptro-crp-el': () => {
        if (this.area.activated) {
          const x = event.clientX - this.area.el.documentOffsetLeft + this.main.wrapper.scrollLeft;
          const y = event.clientY - this.area.el.documentOffsetTop + this.main.wrapper.scrollTop;

          this.setLeft(x);
          this.setTop(y);
          this.setRight(this.area.el.clientWidth - x);
          this.setBottom(this.area.el.clientHeight - y);

          this.reCalcCropperCords();
          this.area.rect.removeAttribute('hidden');
          this.area.resizingB = true;
          this.area.resizingR = true;
        }
      },
      'ptro-crp-rect': () => {
        this.area.moving = true;
        this.area.xHandle = event.clientX - this.area.rect.documentOffsetLeft + this.main.wrapper.scrollLeft;
        this.area.yHandle = event.clientY - this.area.rect.documentOffsetTop + this.main.wrapper.scrollTop;
      },
      'ptro-crp-tr': () => {
        this.area.resizingT = true;
        this.area.resizingR = true;
      },
      'ptro-crp-br': () => {
        this.area.resizingB = true;
        this.area.resizingR = true;
      },
      'ptro-crp-bl': () => {
        this.area.resizingB = true;
        this.area.resizingL = true;
      },
      'ptro-crp-tl': () => {
        this.area.resizingT = true;
        this.area.resizingL = true;
      },
      'ptro-crp-t': () => {
        this.area.resizingT = true;
      },
      'ptro-crp-r': () => {
        this.area.resizingR = true;
      },
      'ptro-crp-b': () => {
        this.area.resizingB = true;
      },
      'ptro-crp-l': () => {
        this.area.resizingL = true;
      },
    };
    if (mainClass in mousDownCallbacks) {
      mousDownCallbacks[mainClass]();
    }
  }

  setLeft(v) {
    this.left = v;
    this.area.rect.style.left = `${v}px`;
  }

  setRight(v) {
    this.right = v;
    this.area.rect.style.right = `${v}px`;
  }

  setTop(v) {
    this.top = v;
    this.area.rect.style.top = `${v}px`;
  }

  setBottom(v) {
    this.bottom = v;
    this.area.rect.style.bottom = `${v}px`;
  }

  handleMouseMove(event) {
    if (this.area.moving) {
      let newLeft = event.clientX - this.area.el.documentOffsetLeft - this.area.xHandle + this.main.wrapper.scrollLeft;
      if (newLeft < -1) {
        newLeft = -1;
      } else if (newLeft + this.area.rect.clientWidth > this.area.el.clientWidth - 1) {
        newLeft = this.area.el.clientWidth - this.area.rect.clientWidth - 1;
      }
      const hDelta = newLeft - this.left;
      this.setLeft(newLeft);
      this.setRight(this.right - hDelta);

      let newTop = event.clientY - this.area.el.documentOffsetTop - this.area.yHandle + this.main.wrapper.scrollTop;
      if (newTop < -1) {
        newTop = -1;
      } else if (newTop + this.area.rect.clientHeight > this.area.el.clientHeight - 1) {
        newTop = this.area.el.clientHeight - this.area.rect.clientHeight - 1;
      }
      const vDelta = newTop - this.top;
      this.setTop(newTop);
      this.setBottom(this.bottom - vDelta);
      this.reCalcCropperCords();
    } else {
      if (this.area.resizingL) {
        const absLeft = this.fixCropperLeft(event.clientX + this.main.wrapper.scrollLeft);
        this.setLeft(absLeft - this.area.el.documentOffsetLeft);
        this.reCalcCropperCords();
      }
      if (this.area.resizingR) {
        const absRight = this.fixCropperRight(event.clientX + this.main.wrapper.scrollLeft);
        this.setRight(
          this.area.el.clientWidth + this.area.el.documentOffsetLeft - absRight);
        this.reCalcCropperCords();
      }
      if (this.area.resizingT) {
        const absTop = this.fixCropperTop(event.clientY + this.main.wrapper.scrollTop);
        this.setTop(absTop - this.area.el.documentOffsetTop);
        this.reCalcCropperCords();
      }
      if (this.area.resizingB) {
        const absBottom = this.fixCropperBottom(event.clientY + this.main.wrapper.scrollTop);
        this.setBottom(
          this.area.el.clientHeight + this.area.el.documentOffsetTop - absBottom);
        this.reCalcCropperCords();
      }

    }
  }

  handleMouseUp() {
    if (this.area.activated) {
      this.areaionCallback(this.area.rect.clientWidth > 0 && this.area.rect.clientHeight > 0);
    }
    this.area.moving = false;
    this.area.resizingT = false;
    this.area.resizingR = false;
    this.area.resizingB = false;
    this.area.resizingL = false;
    clearSelection();
  }

  draw() {
    if (this.area.topl) {
      const ratio = this.canvas.clientWidth / this.canvas.getAttribute('width');
      this.setLeft(this.area.topl[0] * ratio);
      this.setTop(this.area.topl[1] * ratio);
      this.setRight(this.area.el.clientWidth - (this.area.bottoml[0] - this.area.topl[0]) * ratio);
      this.setBottom(this.area.el.clientHeight - (this.area.bottoml[1] - this.area.topl[1]) * ratio);
    }
  }

  /* fixers */
  fixCropperLeft(newLeft) {
    const absLeftMiddle = this.area.rect.documentOffsetLeft + this.area.rect.clientWidth;
    if (newLeft < this.area.el.documentOffsetLeft - 1) {
      return this.area.el.documentOffsetLeft - 1;
    } else if (newLeft > absLeftMiddle) {
      newLeft = absLeftMiddle;
      if (this.area.resizingL) {
        this.area.resizingL = false;
        this.area.resizingR = true;
      }
    }
    return newLeft;
  }

  fixCropperRight(newRight) {
    const absRightLimit = this.area.el.documentOffsetLeft + this.area.el.clientWidth + 1;
    if (newRight > absRightLimit) {
      return absRightLimit;
    } else if (newRight < this.area.rect.documentOffsetLeft) {
      newRight = this.area.rect.documentOffsetLeft + this.area.rect.clientWidth;
      if (this.area.resizingR) {
        this.area.resizingR = false;
        this.area.resizingL = true;
      }
    }
    return newRight;
  }

  fixCropperTop(newTop) {
    const absTopMiddle = this.area.rect.documentOffsetTop + this.area.rect.clientHeight;
    if (newTop < this.area.el.documentOffsetTop - 1) {
      return this.area.el.documentOffsetTop - 1;
    } else if (newTop > absTopMiddle) {
      newTop = absTopMiddle;
      if (this.area.resizingT) {
        this.area.resizingT = false;
        this.area.resizingB = true;
      }
    }
    return newTop;
  }

  fixCropperBottom(newBottom) {
    const absBottomLimit = this.area.el.documentOffsetTop + this.area.el.clientHeight + 1;
    if (newBottom > absBottomLimit) {
      return absBottomLimit;
    } else if (newBottom < this.area.rect.documentOffsetTop) {
      newBottom = this.area.rect.documentOffsetTop + this.area.rect.clientHeight;
      if (this.area.resizingB) {
        this.area.resizingB = false;
        this.area.resizingT = true;
      }
    }
    return newBottom;
  }
}