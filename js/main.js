'use strict';

import '../css/styles.css';
import '../css/icons/styles.css';

Object.defineProperty( Element.prototype, 'documentOffsetTop', {
    get: function () {
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
    }
} );

Object.defineProperty( Element.prototype, 'documentOffsetLeft', {
    get: function () {
        return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
    }
} );


class PainterroProc {


  /**
   *
   * @param params
   */
  constructor(params) {
    this.buttons = [{
      name: 'crop',
      activate: () => {
        this.cropper.el.style.cursor = 'crosshair';
        this.cropper.activated = true;
        this.drawCropper();
      }
    }, {
      name: 'line'
    }, {
      name: 'rect'
    }, {
      name: 'pipette'
    }];
    this.activeBtn = undefined;

    this.ratioRelation = undefined;
    this.id = params.id;
    this.bgColor = params.backgroundFillColor || '#fff';

    this.baseEl = document.getElementById(this.id);

    let bar = '';
    for(let b of this.buttons) {
      bar += `<button class="icon-btn" id="${this.id}-ptrobtn-${b.name}">
<i class="icon icon-${b.name}"></i></button>`;
    }

    const cropper = `<div class="ptro-crp-el" ><div class="ptro-crp-rect" hidden>
<div class="ptro-crp-l cropper-handler" ></div>
<div class="ptro-crp-r cropper-handler" ></div>
<div class="ptro-crp-t cropper-handler" ></div>
<div class="ptro-crp-b cropper-handler" ></div>
<div class="ptro-crp-tl cropper-handler" ></div>
<div class="ptro-crp-tr cropper-handler" ></div>
<div class="ptro-crp-bl cropper-handler" ></div>
<div class="ptro-crp-br cropper-handler" ></div></div></div>`;

    this.baseEl.innerHTML = `<div class="painterro-wrapper" id="ptro-wrapper-${this.id}">` +
      `<canvas id="ptro-canvas-${this.id}"></canvas>` + cropper +
      '</div>' +
      '<div class="painterro-bar">' + bar + '</div>';

    for(let b of this.buttons) {
       this._getBtnEl(b).onclick =
         () => {
            if (this.activeBtn !== undefined) {
              this._getBtnEl(this.activeBtn).className =
                this._getBtnEl(this.activeBtn).className.replace(' btn-active', '');
            }
            if (this.activeBtn !== b) {
              this.activeBtn = b;
              this._getBtnEl(b).className += ' btn-active';
              b.activate();

            } else {
              this.activeBtn = undefined;
            }
          };
    }

    this.body = document.body;
    this.wrapper = document.querySelector(`#${this.id} .painterro-wrapper`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.cropper = {
      el: document.querySelector(`#${this.id} .ptro-crp-el`),
      rect: document.querySelector(`#${this.id} .ptro-crp-rect`),
    };
    this.initCallbacks();
    this.resize(this.wrapper.offsetWidth, this.wrapper.offsetHeight);
    this.ctx = this.canvas.getContext('2d');

    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fill();
    const ctx = this.ctx;
    const obj = this;

    document.onpaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.split('/')[0] === "image") {
          const img = new Image;
          img.onload = function() {
              //ctx.scale(2,2);
              obj.resize(img.naturalWidth, img.naturalHeight);
              ctx.drawImage(img, 0, 0);
              obj.adjustSizeFull();
          };
          img.src = URL.createObjectURL(item.getAsFile());
        }
      }
    };

    window.onresize = () => {
      this.adjustSizeFull();
    };
  }

  reCalcCropperCords() {
    const ratio = this.canvas.offsetWidth / this.canvas.getAttribute('width');
    this.cropper.topl = [
      (this.cropper.rect.documentOffsetLeft - this.cropper.el.documentOffsetLeft) / ratio,
      (this.cropper.rect.documentOffsetTop - this.cropper.el.documentOffsetTop) / ratio];

    this.cropper.bottoml = [
      this.cropper.topl[0] + (this.cropper.rect.clientWidth) / ratio,
      this.cropper.topl[1] + (this.cropper.rect.clientHeight) / ratio]
  }
  initCallbacks() {
    this.body.onmousedown= (event) => {
      console.log(event);
      const mainClass = event.target.classList[0];
      const mousDownCallbacks = {
        'ptro-crp-el': () => {
          if (this.cropper.activated) {
            this.cropper.rect.style.left = event.clientX - this.cropper.el.documentOffsetLeft;
            this.cropper.rect.style.top = event.clientY - this.cropper.el.documentOffsetTop;
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
          this.cropper.xHandle = event.clientX - this.cropper.rect.documentOffsetLeft;
          this.cropper.yHandle = event.clientY - this.cropper.rect.documentOffsetTop;
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
    };
    document.onmousemove = (event) => {
      if (this.cropper !== undefined && this.cropper.moving ) {
        let newLeft = event.clientX - this.cropper.el.documentOffsetLeft - this.cropper.xHandle;
        if (newLeft < 0) {
          newLeft = 0;
        } else if (newLeft + this.cropper.rect.clientWidth >= this.cropper.el.clientWidth - 1) {
          newLeft = this.cropper.el.clientWidth - this.cropper.rect.clientWidth - 2;
        }
        this.cropper.rect.style.left = newLeft;
        let newTop = event.clientY - this.cropper.el.documentOffsetTop - this.cropper.yHandle;
        if (newTop < 0) {
          newTop = 0;
        } else if (newTop + this.cropper.rect.clientHeight >= this.cropper.el.clientHeight - 1) {
          newTop = this.cropper.el.clientHeight - this.cropper.rect.clientHeight - 2;
        }
        this.cropper.rect.style.top = newTop;
        this.reCalcCropperCords();
      } else {
        if (this.cropper.resizingR) {
          this.cropper.rect.style.width = `${
            this.fixCropperWidth(event.clientX - this.cropper.rect.documentOffsetLeft)}px`;
          this.reCalcCropperCords();
        }
        if (this.cropper.resizingB) {
          this.cropper.rect.style.height = `${
            this.fixCropperHeight(event.clientY - this.cropper.rect.documentOffsetTop)}px`;
          this.reCalcCropperCords();
        }
        if (this.cropper.resizingL) {
          const origRight = this.cropper.rect.documentOffsetLeft + this.cropper.rect.clientWidth;
          const absLeft = this.fixCropperLeft(event.clientX);
          this.cropper.rect.style.left = `${absLeft - this.cropper.el.documentOffsetLeft}px`;
          this.cropper.rect.style.width = `${origRight - absLeft}px`;
          this.reCalcCropperCords();
        }
        if (this.cropper.resizingT) {
          const origTop = this.cropper.rect.documentOffsetTop + this.cropper.rect.clientHeight;
          const absTop = this.fixCropperTop(event.clientY);
          this.cropper.rect.style.top = `${absTop - this.cropper.el.documentOffsetTop}px`;
          this.cropper.rect.style.height = `${origTop - absTop}px`;
          this.reCalcCropperCords();
        }

      }
    };
    document.onmouseup = (event) => {
        this.cropper.moving = false;
        this.cropper.resizingT = false;
        this.cropper.resizingR = false;
        this.cropper.resizingB = false;
        this.cropper.resizingL = false;
    }
  }

  fixCropperLeft(newLeft) {
    if (newLeft < this.cropper.el.documentOffsetLeft) {
      return this.cropper.el.documentOffsetLeft;
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
    if (newTop < this.cropper.el.documentOffsetTop) {
      return this.cropper.el.documentOffsetTop;
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
        return this.cropper.el.documentOffsetLeft + this.cropper.el.clientWidth - this.cropper.rect.documentOffsetLeft - 2;
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
        return this.cropper.el.documentOffsetTop + this.cropper.el.clientHeight - this.cropper.rect.documentOffsetTop - 2;
    } else if (newHeight < 0) {
      if (this.cropper.resizingB) {
        this.cropper.resizingB = false;
        this.cropper.resizingT = true;
      }
      return 0;
    }
    return newHeight;
  }

  adjustSizeFull() {
    const ratio = this.wrapper.offsetWidth / this.wrapper.offsetHeight;
    let newRelation = ratio < this.size.ratio;
    if (newRelation !== this.ratioRelation) {
      this.ratioRelation = newRelation;
      if (newRelation) {
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
      } else {
        this.canvas.style.width = 'auto';
        this.canvas.style.height = '100%';
      }
    }
    this.drawCropper();
  }

  drawCropper() {
    this.cropper.el.style.left = this.canvas.offsetLeft;
    this.cropper.el.style.top = this.canvas.offsetTop;
    this.cropper.el.style.width = this.canvas.clientWidth;
    this.cropper.el.style.height = this.canvas.clientHeight;

    if (this.cropper.topl) {
      const ratio = this.canvas.offsetWidth / this.canvas.getAttribute('width');
      this.cropper.rect.style.left = `${this.cropper.topl[0] * ratio}px`;
      this.cropper.rect.style.top = `${this.cropper.topl[1] * ratio}px`;
      this.cropper.rect.style.width = `${
        (this.cropper.bottoml[0] - this.cropper.topl[0]) * ratio}px`;
      this.cropper.rect.style.height = `${
        (this.cropper.bottoml[1] - this.cropper.topl[1]) * ratio}px`;
    }

  }
  resize(x, y) {
    this.size = {
      w: x,
      h: y,
      ratio: x/y
    };
    this.canvas.setAttribute('width', this.size.w);
    this.canvas.setAttribute('height', this.size.h);
  }

  _getBtnEl(b) {
    return document.getElementById(`${this.id}-ptrobtn-${b.name}`);
  }
}

module.exports = function (params) {
  return new PainterroProc(params);
};