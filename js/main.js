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
      name: 'crop'
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
    this.baseEl.innerHTML = '<div class="painterro-wrapper">' +
      '<canvas></canvas></div>' +
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
            } else {
              this.activeBtn = undefined;
            }
          };
    }

    this.wrapper = document.querySelector(`#${this.id} .painterro-wrapper`);
    this.canvas = document.querySelector(`#${this.id} canvas`);

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