import { clearSelection, KEYS } from './utils';

export default class PainterroSelecter {
  constructor(main, selectionCallback) {
    this.main = main;
    this.canvas = main.canvas;
    this.wrapper = main.wrapper;
    this.ctx = main.ctx;
    this.areaionCallback = selectionCallback;
    this.shown = false;
    this.area = {
      el: main.toolContainer,
      rect: document.querySelector(`#${main.id} .ptro-crp-rect`),
    };
    this.imagePlaced = false;
    this.areaionCallback(false);
  }

  static code() {
    return '<div class="ptro-crp-rect" hidden>' +
      '<div class="ptro-crp-l select-handler"></div><div class="ptro-crp-r select-handler"></div>' +
      '<div class="ptro-crp-t select-handler"></div><div class="ptro-crp-b select-handler"></div>' +
      '<div class="ptro-crp-tl select-handler"></div><div class="ptro-crp-tr select-handler"></div>' +
      '<div class="ptro-crp-bl select-handler"></div><div class="ptro-crp-br select-handler"></div>' +
      '</div>';
  }

  activate() {
    this.area.activated = true;
    this.areaionCallback(false);
  }

  doCrop() {
    const imgData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
    this.main.resize(
      this.area.bottoml[0] - this.area.topl[0],
      this.area.bottoml[1] - this.area.topl[1]);
    this.main.ctx.putImageData(imgData, -this.area.topl[0], -this.area.topl[1]);
    this.main.adjustSizeFull();
    this.main.worklog.captureState();
  }

  doPixelize() {
    const c = this.area.topl;
    const size = [
      this.area.bottoml[0] - c[0], // width
      this.area.bottoml[1] - c[1],
    ];

    this.pixelizePixelSize = this.main.params.pixelizePixelSize;

    if (this.pixelizePixelSize.slice(-1) === '%') {
      this.pixelSize = (Math.min(size[0], size[1]) / (100.0 / this.pixelizePixelSize.slice(0, -1)));
    } else if (this.pixelizePixelSize.slice(-2).toLowerCase() === 'px') {
      this.pixelSize = this.pixelizePixelSize.slice(0, -2);
    } else {
      this.pixelSize = this.pixelizePixelSize;
    }


    if (this.pixelSize < 2) {
      this.pixelSize = 2; // prevent errors
    }

    if (size[1] < size[0]) {
      this.pixelSizeY = this.pixelSize;
      const desiredHorPxs = Math.round(size[0] / this.pixelSizeY);
      this.pixelSizeX = (size[0] * 1.0) / desiredHorPxs;
    } else {
      this.pixelSizeX = this.pixelSize;
      const desiredVerPxs = Math.round(size[1] / this.pixelSizeX);
      this.pixelSizeY = (size[1] * 1.0) / desiredVerPxs;
    }
    const pxData = [];
    const pxSize = [size[0] / this.pixelSizeX, size[1] / this.pixelSizeY];
    for (let i = 0; i < pxSize[0]; i += 1) {
      const row = [];
      for (let j = 0; j < pxSize[1]; j += 1) {
        row.push([0, 0, 0, 0, 0]);
      }
      pxData.push(row);
    }
    const data = this.ctx.getImageData(c[0], c[1], size[0], size[1]);
    for (let i = 0; i < size[0]; i += 1) {
      for (let j = 0; j < size[1]; j += 1) {
        const ii = Math.floor(i / this.pixelSizeX);
        const jj = Math.floor(j / this.pixelSizeY);
        const base = ((j * size[0]) + i) * 4;
        pxData[ii][jj][0] += data.data[base];
        pxData[ii][jj][1] += data.data[base + 1];
        pxData[ii][jj][2] += data.data[base + 2];
        pxData[ii][jj][3] += data.data[base + 3];
        pxData[ii][jj][4] += 1;
      }
    }
    for (let i = 0; i < pxSize[0]; i += 1) {
      for (let j = 0; j < pxSize[1]; j += 1) {
        const s = pxData[i][j][4];
        this.ctx.fillStyle = `rgba(
${Math.round(pxData[i][j][0] / s)}, 
${Math.round(pxData[i][j][1] / s)}, 
${Math.round(pxData[i][j][2] / s)}, 
${Math.round(pxData[i][j][3] / s)})`;
        const baseX = c[0] + (i * this.pixelSizeX);
        const baseY = c[1] + (j * this.pixelSizeY);
        this.ctx.fillRect(baseX, baseY, this.pixelSizeX, this.pixelSizeY);
      }
    }
    this.main.worklog.captureState();
  }

  doClearArea() {
    this.ctx.beginPath();
    this.ctx.clearRect(
      this.area.topl[0], this.area.topl[1],
      this.area.bottoml[0] - this.area.topl[0], this.area.bottoml[1] - this.area.topl[1]);
    this.ctx.rect(this.area.topl[0], this.area.topl[1],
      this.area.bottoml[0] - this.area.topl[0], this.area.bottoml[1] - this.area.topl[1]);
    this.ctx.fillStyle = this.main.currentBackground;
    this.ctx.fill();
    this.main.worklog.captureState();
  }

  selectAll() {
    this.setLeft(0);
    this.setRight(0);
    this.setBottom(0);
    this.setTop(0);
    this.show();
    this.reCalcCropperCords();
    if (this.area.activated) {
      this.areaionCallback(!this.imagePlaced &&
        this.area.rect.clientWidth > 0 &&
        this.area.rect.clientHeight > 0);
    }
  }

  getScale() {
    return this.canvas.clientWidth / this.canvas.getAttribute('width');
  }

  reCalcCropperCords() {
    const ratio = this.getScale();
    this.area.topl = [
      Math.round(((this.rectLeft() - this.main.elLeft())) / ratio),
      Math.round(((this.rectTop() - this.main.elTop())) / ratio)];

    this.area.bottoml = [
      Math.round(this.area.topl[0] + ((this.area.rect.clientWidth + 2) / ratio)),
      Math.round(this.area.topl[1] + ((this.area.rect.clientHeight + 2) / ratio))];
  }

  adjustPosition() {
    if (!this.shown) {
      return;
    }
    const ratio = this.getScale();
    this.setLeft(this.area.topl[0] * ratio);
    this.setTop(this.area.topl[1] * ratio);
    this.setRight(0);
    this.setRight(this.canvas.clientWidth - (this.area.bottoml[0] * ratio));
    this.setBottom(this.canvas.clientHeight - (this.area.bottoml[1] * ratio));
  }

  placeAt(l, t, r, b, img) {

    if (this.imagePlaced) {
      // for case when user inserts multiple images one after another without finishing placing them
      this.finishPlacing();
    }

    this.main.closeActiveTool(true);
    this.main.setActiveTool(this.main.defaultTool);
    const scale = this.getScale();
    this.setLeft(l * scale);
    this.setTop(t * scale);
    this.setRight(r * scale);
    this.setBottom(b * scale);
    const tmpCan = document.createElement('canvas');
    tmpCan.width = img.naturalWidth;
    tmpCan.height = img.naturalHeight;
    const tmpCtx = tmpCan.getContext('2d');
    tmpCtx.drawImage(img, 0, 0);
    this.placedData = tmpCan.toDataURL('image/png');
    const lowScale = 1000 / Math.max(img.naturalWidth, img.naturalHeight);
    if (lowScale >= 1) {
      this.placedDataLow = this.placedData;
    } else {
      tmpCan.width = img.naturalWidth * lowScale;
      tmpCan.height = img.naturalHeight * lowScale;
      tmpCtx.scale(lowScale, lowScale);
      tmpCtx.drawImage(img, 0, 0);
      this.placedDataLow = tmpCan.toDataURL('image/png');
    }
    this.main.select.area.rect.style['background-image'] = `url(${this.placedData})`;
    this.show();
    this.reCalcCropperCords();
    this.imagePlaced = true;
    this.main.select.activate();
    this.placedRatio = img.naturalWidth / img.naturalHeight;
  }

  finishPlacing() {
    this.imagePlaced = false;
    this.main.select.area.rect.style['background-image'] = 'none';
    this.main.inserter.insert(
      this.area.topl[0],
      this.area.topl[1],
      this.area.bottoml[0] - this.area.topl[0],
      this.area.bottoml[1] - this.area.topl[1]);
    this.area.activated = false;
  }

  cancelPlacing() {
    this.imagePlaced = false;
    this.main.select.area.rect.style['background-image'] = 'none';
    this.hide();
    this.main.worklog.undoState();
  }

  handleKeyDown(evt) {
    if (this.main.inserter.handleKeyDown(evt)) {
      return true;
    }
    if (this.shown && this.imagePlaced) {
      if (evt.keyCode === KEYS.enter) {
        this.finishPlacing();
        return true;
      } else if (evt.keyCode === KEYS.esc) {
        this.cancelPlacing();
        return true;
      }
    } else if (this.shown && evt.keyCode === KEYS.del) {
      this.doClearArea();
      return true;
    } else if (evt.keyCode === KEYS.a && evt.ctrlKey) {
      this.selectAll();
      event.preventDefault();
      return true;
    } else if (evt.keyCode === KEYS.esc && this.shown) {
      this.hide();
      return true;
    }
    return false;
  }

  handleMouseDown(event) {

    const mainClass = event.target.classList[0];
    const mousDownCallbacks = {
      'ptro-crp-el': () => {
        if (this.area.activated) {
          if (this.imagePlaced) {
            this.finishPlacing();
          }
          const x = (event.clientX - this.main.elLeft()) +
            this.main.scroller.scrollLeft;
          const y = (event.clientY - this.main.elTop()) +
            this.main.scroller.scrollTop;

          this.setLeft(x);
          this.setTop(y);
          this.setRight(this.area.el.clientWidth - x);
          this.setBottom(this.area.el.clientHeight - y);

          this.reCalcCropperCords();
          this.area.resizingB = true;
          this.area.resizingR = true;
          this.hide();
        }
      },
      'ptro-crp-rect': () => {
        this.area.moving = true;
        this.area.xHandle = (event.clientX - this.rectLeft()) +
          this.main.scroller.scrollLeft;
        this.area.yHandle = (event.clientY - this.rectTop()) +
          this.main.scroller.scrollTop;
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
      if (this.imagePlaced) {
        this.main.select.area.rect.style['background-image'] = `url(${this.placedDataLow})`;
      }
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
    if (!this.area.activated) {
      return;
    }
    if (this.area.moving) {
      let newLeft = (event.clientX - this.main.elLeft() - this.area.xHandle)
        + this.main.scroller.scrollLeft;
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft + this.area.rect.clientWidth > this.area.el.clientWidth - 2) {
        newLeft = this.area.el.clientWidth - this.area.rect.clientWidth - 2;
      }
      const hDelta = newLeft - this.left;
      this.setLeft(newLeft);
      this.setRight(this.right - hDelta);

      let newTop = (event.clientY - this.main.elTop() - this.area.yHandle)
        + this.main.scroller.scrollTop;
      if (newTop < 0) {
        newTop = 0;
      } else if (newTop + this.area.rect.clientHeight > this.area.el.clientHeight - 2) {
        newTop = this.area.el.clientHeight - this.area.rect.clientHeight - 2;
      }
      const vDelta = newTop - this.top;
      this.setTop(newTop);
      this.setBottom(this.bottom - vDelta);
      this.reCalcCropperCords();
    } else {
      let resizing = false;
      if (this.area.resizingL) {
        resizing = true;
        const absLeft = this.fixCropperLeft(event.clientX + this.main.scroller.scrollLeft);
        this.setLeft(absLeft - this.main.elLeft());
        this.reCalcCropperCords();
      }
      if (this.area.resizingR) {
        resizing = true;
        const absRight = this.fixCropperRight(event.clientX + this.main.scroller.scrollLeft);
        this.setRight(
          (this.area.el.clientWidth + this.main.elLeft()) - absRight);
        this.reCalcCropperCords();
      }
      if (this.area.resizingT) {
        resizing = true;
        const absTop = this.fixCropperTop(event.clientY + this.main.scroller.scrollTop);
        this.setTop(absTop - this.main.elTop());
        this.reCalcCropperCords();
      }
      if (this.area.resizingB) {
        resizing = true;
        const absBottom = this.fixCropperBottom(event.clientY + this.main.scroller.scrollTop);
        this.setBottom(
          (this.area.el.clientHeight + this.main.elTop()) - absBottom);
        this.reCalcCropperCords();
      }
      if (this.imagePlaced && !(event.ctrlKey || event.shiftKey)) {
        if (this.area.resizingT) {
          if (this.area.resizingL) {
            this.leftKeepRatio();
          } else {
            this.rightKeepRatio();
          }
          this.topKeepRatio();
          this.reCalcCropperCords();
        }
        if (this.area.resizingB) {
          if (this.area.resizingL) {
            this.leftKeepRatio();
          } else {
            this.rightKeepRatio();
          }
          this.bottomKeepRatio();
          this.reCalcCropperCords();
        } if (this.area.resizingL) {
          if (this.area.resizingT) {
            this.topKeepRatio();
          } else {
            this.bottomKeepRatio();
          }
          this.leftKeepRatio();
          this.reCalcCropperCords();
        } if (this.area.resizingR) {
          if (this.area.resizingT) {
            this.topKeepRatio();
          } else {
            this.bottomKeepRatio();
          }
          this.rightKeepRatio();
          this.reCalcCropperCords();
        }
      }
      if (resizing && !this.shown) {
        this.show();
      }
      if (resizing) {
        clearSelection();
      }
    }
  }

  leftKeepRatio() {
    const newW = this.area.rect.clientHeight * this.placedRatio;
    const suggLeft = this.main.elLeft() +
      (this.area.el.clientWidth - this.right - newW - 2);
    const absLeft = this.fixCropperLeft(suggLeft);
    this.setLeft(absLeft - this.main.elLeft());
  }

  topKeepRatio() {
    const newH = this.area.rect.clientWidth / this.placedRatio;
    const absTop = this.fixCropperTop(
      this.main.elTop() + (this.area.el.clientHeight - this.bottom - newH - 2));
    this.setTop(absTop - this.main.elTop());
  }

  bottomKeepRatio() {
    const newH = this.area.rect.clientWidth / this.placedRatio;
    const absBottom = this.fixCropperBottom(
      this.main.elTop() +
      this.top + newH + 2);
    this.setBottom((this.area.el.clientHeight + this.main.elTop()) - absBottom);
  }

  rightKeepRatio() {
    const newW = this.area.rect.clientHeight * this.placedRatio;
    const absRight = this.fixCropperRight(
      this.main.elLeft() +
      this.left + newW + 2);
    this.setRight((this.area.el.clientWidth + this.main.elLeft()) - absRight);
  }

  show() {
    this.shown = true;
    this.area.rect.removeAttribute('hidden');
  }

  handleMouseUp() {
    if (this.area.activated) {
      this.areaionCallback(!this.imagePlaced && this.area.rect.clientWidth > 0
        && this.area.rect.clientHeight > 0);
    }
    this.area.moving = false;
    this.area.resizingT = false;
    this.area.resizingR = false;
    this.area.resizingB = false;
    this.area.resizingL = false;
    if (this.imagePlaced) {
      this.main.select.area.rect.style['background-image'] = `url(${this.placedData})`;
    }
  }

  close() {
    if (this.imagePlaced) {
      this.finishPlacing();
    }
    this.area.activated = false;
    this.hide();
  }

  hide() {
    this.area.rect.setAttribute('hidden', 'true');
    this.shown = false;
    this.areaionCallback(false);
  }

  draw() {
    if (this.area.topl) {
      const ratio = this.canvas.clientWidth / this.canvas.getAttribute('width');
      this.setLeft(this.area.topl[0] * ratio);
      this.setTop(this.area.topl[1] * ratio);
      this.setRight(this.area.el.clientWidth - (
        (this.area.bottoml[0] - this.area.topl[0]) * ratio));
      this.setBottom(this.area.el.clientHeight - (
        (this.area.bottoml[1] - this.area.topl[1]) * ratio));
    }
  }

  rectLeft() {
    return this.area.rect.documentOffsetLeft + this.main.scroller.scrollLeft;
  }

  rectTop() {
    return this.area.rect.documentOffsetTop + this.main.scroller.scrollTop;
  }

  /* fixers */
  fixCropperLeft(left) {
    let newLeft = left;
    const absLeftMiddle = this.rectLeft() + this.area.rect.clientWidth;
    if (newLeft < this.main.elLeft()) {
      return this.main.elLeft();
    } else if (newLeft > absLeftMiddle) {
      newLeft = absLeftMiddle;
      if (this.area.resizingL) {
        this.area.resizingL = false;
        this.area.resizingR = true;
      }
    }
    return newLeft;
  }

  fixCropperRight(right) {
    let newRight = right;
    const absRightLimit = this.main.elLeft() + this.area.el.clientWidth;
    if (newRight > absRightLimit) {
      return absRightLimit;
    } else if (newRight < this.rectLeft()) {
      newRight = this.rectLeft() +
        this.area.rect.clientWidth;
      if (this.area.resizingR) {
        this.area.resizingR = false;
        this.area.resizingL = true;
      }
    }
    return newRight;
  }

  fixCropperTop(top) {
    let newTop = top;
    const absTopMiddle = this.rectTop() + this.area.rect.clientHeight;
    if (newTop < this.main.elTop()) {
      return this.main.elTop();
    } else if (newTop > absTopMiddle) {
      newTop = absTopMiddle;
      if (this.area.resizingT) {
        this.area.resizingT = false;
        this.area.resizingB = true;
      }
    }
    return newTop;
  }

  fixCropperBottom(bottom) {
    let newBottom = bottom;
    const absBottomLimit = this.main.elTop() + this.area.el.clientHeight;
    if (newBottom > absBottomLimit) {
      return absBottomLimit;
    } else if (newBottom < this.rectTop()) {
      newBottom = this.rectTop() + this.area.rect.clientHeight;
      if (this.area.resizingB) {
        this.area.resizingB = false;
        this.area.resizingT = true;
      }
    }
    return newBottom;
  }
}
