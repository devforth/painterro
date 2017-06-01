'use strict';

import '../css/styles.css';
import '../css/icons/styles.css';




class PainterroProc {


  /**
   *
   * @param params
   */
  constructor(params) {
    this.buttons = [{
      name: 'crop',
      activate: () => {
        this.cropper.topl = [30, 30];
        this.cropper.bottoml = [230, 230];

        this.cropper.l.style.left = '0';
        this.cropper.l.style.top = '0';
        this.cropper.l.style.bottom = '0';
        this.cropper.l.style.width = `${this.cropper.topl[0]}px`;
        this.cropper.l.removeAttribute('hidden');

        this.cropper.r.style.left = `${this.cropper.bottoml[0]}px`;
        this.cropper.r.style.top = '0';
        this.cropper.r.style.bottom = '0';
        this.cropper.r.style.right = '0';
        this.cropper.r.removeAttribute('hidden');

        this.cropper.t.style.left = `${this.cropper.topl[0]}px`;
        this.cropper.t.style.top = '0';
        this.cropper.t.style.width = `${this.cropper.bottoml[0] - this.cropper.topl[0]}px`;
        this.cropper.t.style.height = `${this.cropper.topl[1]}px`;
        this.cropper.t.removeAttribute('hidden');

        this.cropper.b.style.left = `${this.cropper.topl[0]}px`;
        this.cropper.b.style.top = `${this.cropper.bottoml[1]}px`;
        this.cropper.b.style.width = `${this.cropper.bottoml[0] - this.cropper.topl[0]}px`;
        this.cropper.b.style.bottom = '0';
        this.cropper.b.removeAttribute('hidden');


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

    const cropper = `<div class="ptro-crp-el">
<div class="ptro-crp-l cropper-area" hidden></div>
<div class="ptro-crp-r cropper-area" hidden></div>
<div class="ptro-crp-t cropper-area" hidden></div>
<div class="ptro-crp-b cropper-area" hidden></div>
<div class="ptro-crp-tlh cropper-handler" hidden></div>
<div class="ptro-crp-trh cropper-handler" hidden></div>
<div class="ptro-crp-blh cropper-handler" hidden></div>
<div class="ptro-crp-brh cropper-handler" hidden></div></div>`;

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

    this.wrapper = document.querySelector(`#${this.id} .painterro-wrapper`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.cropper = {
      el: document.querySelector(`#${this.id} .ptro-crp-el`),
      l: document.querySelector(`#${this.id} .ptro-crp-l`),
      r: document.querySelector(`#${this.id} .ptro-crp-r`),
      t: document.querySelector(`#${this.id} .ptro-crp-t`),
      b: document.querySelector(`#${this.id} .ptro-crp-b`),
    };


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