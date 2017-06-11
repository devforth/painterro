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
      Math.round( (this.cropper.rect.documentOffsetLeft - this.cropper.el.documentOffsetLeft) / ratio ),
      Math.round( (this.cropper.rect.documentOffsetTop - this.cropper.el.documentOffsetTop) / ratio )];

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
            this.cropper.rect.style.left = event.clientX - this.cropper.el.documentOffsetLeft + this.main.wrapper.scrollLeft;
            this.cropper.rect.style.top = event.clientY - this.cropper.el.documentOffsetTop + this.main.wrapper.scrollTop;
            this.cropper.rect.style.width = '0px';
            this.cropper.rect.style.height = '0px';
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

  procMouseMove(event) {
    if (this.cropper.moving ) {
      let newLeft = event.clientX - this.cropper.el.documentOffsetLeft - this.cropper.xHandle + this.main.wrapper.scrollLeft;
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft + this.cropper.rect.clientWidth > this.cropper.el.clientWidth - 2) {
        newLeft = this.cropper.el.clientWidth - this.cropper.rect.clientWidth - 2;
      }
      this.cropper.rect.style.left = newLeft;
      let newTop = event.clientY - this.cropper.el.documentOffsetTop - this.cropper.yHandle + this.main.wrapper.scrollTop;
      if (newTop < 0) {
        newTop = 0;
      } else if (newTop + this.cropper.rect.clientHeight > this.cropper.el.clientHeight - 2) {
        newTop = this.cropper.el.clientHeight - this.cropper.rect.clientHeight - 2;
      }
      this.cropper.rect.style.top = newTop;
      this.reCalcCropperCords();
    } else {
      if (this.cropper.resizingR) {
        this.cropper.rect.style.width = `${
          this.fixCropperWidth(event.clientX - this.cropper.rect.documentOffsetLeft + this.main.wrapper.scrollLeft)}px`;
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingB) {
        this.cropper.rect.style.height = `${
          this.fixCropperHeight(event.clientY - this.cropper.rect.documentOffsetTop + this.main.wrapper.scrollTop)}px`;
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingL) {
        const origAbsRight = this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth;
        const absLeft = this.fixCropperLeft(event.clientX + this.main.wrapper.scrollLeft);
        this.cropper.rect.style.left = `${absLeft - this.cropper.el.documentOffsetLeft}px`;
        this.cropper.rect.style.width = `${origAbsRight - absLeft}px`;
        this.reCalcCropperCords();
      }
      if (this.cropper.resizingT) {
        const origTop = this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight;
        const absTop = this.fixCropperTop(event.clientY + this.main.wrapper.scrollTop);
        this.cropper.rect.style.top = `${absTop - this.cropper.el.documentOffsetTop}px`;
        this.cropper.rect.style.height = `${origTop - absTop}px`;
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
      const ratio = this.canvas.offsetWidth / this.canvas.getAttribute('width');
      this.cropper.rect.style.left = `${this.cropper.topl[0] * ratio}px`;
      this.cropper.rect.style.top = `${this.cropper.topl[1] * ratio}px`;
      this.cropper.rect.style.width = `${(this.cropper.bottoml[0] - this.cropper.topl[0]) * ratio}px`;
      this.cropper.rect.style.height = `${(this.cropper.bottoml[1] - this.cropper.topl[1]) * ratio}px`;
    }
  }

  /* fixers */
  fixCropperLeft(newLeft) {
    if (newLeft < this.cropper.el.documentOffsetLeft - 1) {
      return this.cropper.el.documentOffsetLeft - 1;
    } else if (newLeft > this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth) {
      newLeft = this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth;
      if (this.cropper.resizingL) {
        this.cropper.resizingL = false;
        this.cropper.resizingR = true;
      }
    }
    return newLeft;
  }

  fixCropperTop(newTop) {
    if (newTop < this.cropper.el.documentOffsetTop - 1) {
      return this.cropper.el.documentOffsetTop - 1;
    } else if (newTop > this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight) {
      newTop = this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight;
      if (this.cropper.resizingT) {
        this.cropper.resizingT = false;
        this.cropper.resizingB = true;
      }
    }
    return newTop;
  }

  fixCropperWidth(newWidth) {
    if (this.cropper.rect.documentOffsetLeft + newWidth > this.cropper.el.documentOffsetLeft + this.cropper.el.clientWidth - 1) {
        return this.cropper.el.documentOffsetLeft + this.cropper.el.clientWidth - this.cropper.rect.documentOffsetLeft - 1;
    } else if (newWidth < 0) {
      if (this.cropper.resizingR) {
        this.cropper.resizingR = false;
        this.cropper.resizingL = true;
      }
      return 0;
    }
    return newWidth;
  }

  fixCropperHeight(newHeight) {
    if (this.cropper.rect.documentOffsetTop + newHeight > this.cropper.el.documentOffsetTop + this.cropper.el.clientHeight - 1) {
        return this.cropper.el.documentOffsetTop + this.cropper.el.clientHeight - this.cropper.rect.documentOffsetTop - 1;
    } else if (newHeight < 0) {
      if (this.cropper.resizingB) {
        this.cropper.resizingB = false;
        this.cropper.resizingT = true;
      }
      return 0;
    }
    return newHeight;
  }

}