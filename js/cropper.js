export class PainterroCropper {

  constructor(main, selectionCallback) {
    this.main = main;
    this.canvas = main.canvas;
    this.selectionCallback = selectionCallback;
    this.cropper = {
      el: main.toolContainer,
      rect: document.querySelector(`#${main.id} .ptro-crp-rect`),
    };
  }

  static code() {
    return '<div class="ptro-crp-rect" hidden>' +
        '<div class="ptro-crp-l cropper-handler" ></div><div class="ptro-crp-r cropper-handler" ></div>' +
        '<div class="ptro-crp-t cropper-handler" ></div><div class="ptro-crp-b cropper-handler" ></div>' +
        '<div class="ptro-crp-tl cropper-handler" ></div><div class="ptro-crp-tr cropper-handler" ></div>' +
        '<div class="ptro-crp-bl cropper-handler" ></div><div class="ptro-crp-br cropper-handler" ></div>' +
      '</div>';
  }

  activate() {
    this.cropper.activated = true;
    this.selectionCallback(false);
  }

  doCrop() {
    const img = new Image;
    img.onload = () => {
      this.main.resize(
        this.cropper.bottoml[0] - this.cropper.topl[0],
        this.cropper.bottoml[1] - this.cropper.topl[1]);
      this.main.ctx.drawImage(img,
        - this.cropper.topl[0], - this.cropper.topl[1]);
      this.main.adjustSizeFull();
      this.main.worklog.captureState();
    };
    img.src = this.canvas.toDataURL();
  }

  reCalcCropperCords() {
    const ratio = this.canvas.clientWidth / this.canvas.getAttribute('width');
    this.cropper.topl = [
      Math.round( (this.cropper.rect.documentOffsetLeft - this.cropper.el.documentOffsetLeft + 1) / ratio ),
      Math.round( (this.cropper.rect.documentOffsetTop - this.cropper.el.documentOffsetTop + 1) / ratio )];

    this.cropper.bottoml = [
      Math.round( this.cropper.topl[0] + (this.cropper.rect.clientWidth) / ratio ),
      Math.round( this.cropper.topl[1] + (this.cropper.rect.clientHeight) / ratio )];

    console.log('recalced cords', ratio, this.cropper.topl, this.cropper.bottoml);
  }

  procMouseDown(event) {
    const mainClass = event.target.classList[0];
      const mousDownCallbacks = {
        'ptro-crp-el': () => {
          if (this.cropper.activated) {
            const x = event.clientX - this.cropper.el.documentOffsetLeft + this.main.wrapper.scrollLeft;
            const y = event.clientY - this.cropper.el.documentOffsetTop + this.main.wrapper.scrollTop;

            this.setLeft(x);
            this.setTop(y);
            this.setRight(this.cropper.el.clientWidth - x);
            this.setBottom(this.cropper.el.clientHeight - y);

            this.reCalcCropperCords();
            this.cropper.rect.removeAttribute('hidden');
            this.cropper.resizingB = true;
            this.cropper.resizingR = true;
          }
        },
        'ptro-crp-rect': () => {
          this.cropper.moving = true;
          this.cropper.xHandle = event.clientX - this.cropper.rect.documentOffsetLeft + this.main.wrapper.scrollLeft;
          this.cropper.yHandle = event.clientY - this.cropper.rect.documentOffsetTop + this.main.wrapper.scrollTop;
        },
        'ptro-crp-tr': () => {
          this.cropper.resizingT = true;
          this.cropper.resizingR = true;
        },
        'ptro-crp-br': () => {
          this.cropper.resizingB = true;
          this.cropper.resizingR = true;
        },
        'ptro-crp-bl': () => {
          this.cropper.resizingB = true;
          this.cropper.resizingL = true;
        },
        'ptro-crp-tl': () => {
          this.cropper.resizingT = true;
          this.cropper.resizingL = true;
        },
        'ptro-crp-t': () => {
          this.cropper.resizingT = true;
        },
        'ptro-crp-r': () => {
          this.cropper.resizingR = true;
        },
        'ptro-crp-b': () => {
          this.cropper.resizingB = true;
        },
        'ptro-crp-l': () => {
          this.cropper.resizingL = true;
        },
      };
      if (mainClass in mousDownCallbacks) {
        mousDownCallbacks[mainClass]();
      }
  }

  setLeft(v) {
    this.left = v;
    this.cropper.rect.style.left = `${v}px`;
  }

  setRight(v) {
    this.right = v;
    this.cropper.rect.style.right = `${v}px`;
  }

  setTop(v) {
    this.top = v;
    this.cropper.rect.style.top = `${v}px`;
  }

  setBottom(v) {
    this.bottom = v;
    this.cropper.rect.style.bottom = `${v}px`;
  }

  procMouseMove(event) {
    if (this.cropper.moving ) {
      let newLeft = event.clientX - this.cropper.el.documentOffsetLeft - this.cropper.xHandle + this.main.wrapper.scrollLeft;
      if (newLeft < -1) {
        newLeft = -1;
      } else if (newLeft + this.cropper.rect.clientWidth > this.cropper.el.clientWidth - 1) {
        newLeft = this.cropper.el.clientWidth - this.cropper.rect.clientWidth - 1;
      }
      const hDelta = newLeft - this.left;
      this.setLeft(newLeft);
      this.setRight(this.right - hDelta);

      let newTop = event.clientY - this.cropper.el.documentOffsetTop - this.cropper.yHandle + this.main.wrapper.scrollTop;
      if (newTop < -1) {
        newTop = -1;
      } else if (newTop + this.cropper.rect.clientHeight > this.cropper.el.clientHeight - 1) {
        newTop = this.cropper.el.clientHeight - this.cropper.rect.clientHeight - 1;
      }
      const vDelta = newTop - this.top;
      this.setTop(newTop);
      this.setBottom(this.bottom - vDelta);
      this.reCalcCropperCords();
    } else {
      if (this.cropper.resizingL) {
        const absLeft = this.fixCropperLeft(event.clientX + this.main.wrapper.scrollLeft);
        this.setLeft(absLeft - this.cropper.el.documentOffsetLeft);
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingR) {
        const absRight = this.fixCropperRight(event.clientX + this.main.wrapper.scrollLeft);
        this.setRight(
          this.cropper.el.clientWidth + this.cropper.el.documentOffsetLeft - absRight);
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingT) {
        const absTop = this.fixCropperTop(event.clientY + this.main.wrapper.scrollTop);
        this.setTop(absTop - this.cropper.el.documentOffsetTop);
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingB) {
        const absBottom = this.fixCropperBottom(event.clientY + this.main.wrapper.scrollTop);
        this.setBottom(
          this.cropper.el.clientHeight + this.cropper.el.documentOffsetTop - absBottom);
        this.reCalcCropperCords();
      }

    }
  }

  procMoseUp() {
    if (this.cropper.activated) {
      this.selectionCallback(this.cropper.rect.clientWidth > 0 && this.cropper.rect.clientHeight > 0);
    }
    this.cropper.moving = false;
    this.cropper.resizingT = false;
    this.cropper.resizingR = false;
    this.cropper.resizingB = false;
    this.cropper.resizingL = false;
  }

  draw() {
    if (this.cropper.topl) {
      const ratio = this.canvas.clientWidth / this.canvas.getAttribute('width');
      this.setLeft(this.cropper.topl[0] * ratio);
      this.setTop(this.cropper.topl[1] * ratio);
      this.setRight(this.cropper.el.clientWidth - (this.cropper.bottoml[0] - this.cropper.topl[0]) * ratio);
      this.setBottom(this.cropper.el.clientHeight - (this.cropper.bottoml[1] - this.cropper.topl[1]) * ratio);
    }
  }

  /* fixers */
  fixCropperLeft(newLeft) {
    const absLeftMiddle = this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth;
    if (newLeft < this.cropper.el.documentOffsetLeft - 1) {
      return this.cropper.el.documentOffsetLeft - 1;
    } else if (newLeft > absLeftMiddle) {
      newLeft = absLeftMiddle;
      if (this.cropper.resizingL) {
        this.cropper.resizingL = false;
        this.cropper.resizingR = true;
      }
    }
    return newLeft;
  }

  fixCropperRight(newRight) {
    const absRightLimit = this.cropper.el.documentOffsetLeft + this.cropper.el.clientWidth + 1;
    if (newRight > absRightLimit) {
      return absRightLimit;
    } else if (newRight < this.cropper.rect.documentOffsetLeft) {
      newRight = this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth;
      if (this.cropper.resizingR) {
        this.cropper.resizingR = false;
        this.cropper.resizingL = true;
      }
    }
    return newRight;
  }

  fixCropperTop(newTop) {
    const absTopMiddle = this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight;
    if (newTop < this.cropper.el.documentOffsetTop - 1) {
      return this.cropper.el.documentOffsetTop - 1;
    } else if (newTop > absTopMiddle) {
      newTop = absTopMiddle;
      if (this.cropper.resizingT) {
        this.cropper.resizingT = false;
        this.cropper.resizingB = true;
      }
    }
    return newTop;
  }

  fixCropperBottom(newBottom) {
    const absBottomLimit = this.cropper.el.documentOffsetTop + this.cropper.el.clientHeight + 1;
    if (newBottom > absBottomLimit) {
      return absBottomLimit;
    } else if (newBottom < this.cropper.rect.documentOffsetTop) {
      newBottom = this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight;
      if (this.cropper.resizingB) {
        this.cropper.resizingB = false;
        this.cropper.resizingT = true;
      }
    }
    return newBottom;
  }
}