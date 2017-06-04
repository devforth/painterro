'use strict';

import '../css/styles.css';
import '../css/icons/styles.css';

import { PainterroCropper } from './cropper';
import { WorkLog } from './worklog';
import { genId, addDocumentOffset } from './utils';


class PainterroProc {

  /**
   * @param params
   */
  constructor(params) {
    addDocumentOffset();
    this.tools = [{
      name: 'crop',
      activate: () => {
        this.toolEl.style.cursor = 'crosshair';
        console.log("call act", this.tools[0].controls);
        this.cropper.activate();
        this.cropper.draw();
      },
      close: () => {
        this.cropper.cropper.activated = false;
        this.cropper.cropper.rect.setAttribute('hidden', 'true');
        this.toolEl.style.cursor = 'auto';
      },
      controls: [{
        name: 'Apply',
        type: 'btn',
        action: () => {
          const img = new Image;
          img.onload = () => {
            this.resize(
              this.cropper.cropper.bottoml[0] - this.cropper.cropper.topl[0],
              this.cropper.cropper.bottoml[1] - this.cropper.cropper.topl[1]);
            this.ctx.drawImage(img,
              - this.cropper.cropper.topl[0], - this.cropper.cropper.topl[1]);
            this.adjustSizeFull();
            this.worklog.captureState();
          };
          img.src = this.canvas.toDataURL();
          this.closeActiveTool();
        }
      }, {
        name: 'Cancel',
        type: 'btn',
        action: () => {
          this.closeActiveTool();
        }
      }]
    }, {
      name: 'line',
      controls: ''
    }, {
      name: 'rect',
      controls: ''
    }, {
      name: 'pipette',
      controls: ''
    }];
    this.activeBtn = undefined;

    this.ratioRelation = undefined;
    this.id = params.id;
    this.bgColor = params.backgroundFillColor || '#fff';
    this.baseEl = document.getElementById(this.id);

    let bar = '';
    for(let b of this.tools) {
      bar += `<button class="icon-btn" id="${this.id}-ptrobtn-${b.name}">`+
          `<i class="icon icon-${b.name}"></i></button>`;
    }

    const cropper = `<div class="ptro-crp-el"><div class="ptro-crp-rect" hidden>
<div class="ptro-crp-l cropper-handler" ></div><div class="ptro-crp-r cropper-handler" ></div>
<div class="ptro-crp-t cropper-handler" ></div><div class="ptro-crp-b cropper-handler" ></div>
<div class="ptro-crp-tl cropper-handler" ></div><div class="ptro-crp-tr cropper-handler" ></div>
<div class="ptro-crp-bl cropper-handler" ></div><div class="ptro-crp-br cropper-handler" ></div></div></div>`;

    this.baseEl.innerHTML = `<div class="painterro-wrapper" id="ptro-wrapper-${this.id}">` +
      `<canvas id="ptro-canvas-${this.id}"></canvas>` + cropper +
      '</div>' +
      '<div class="painterro-bar"><span>' + bar + '</span><span class="tool-controls"></span>' +
      '<span class="painterro-info"></span>' +
      '</div>';

    this.body = document.body;
    this.wrapper = document.querySelector(`#${this.id} .painterro-wrapper`);
    this.info = document.querySelector(`#${this.id} .painterro-info`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.toolControls = document.querySelector(`#${this.id} .tool-controls`);
    this.toolEl = document.querySelector(`#${this.id} .ptro-crp-el`);
    this.cropper = new PainterroCropper(this.id, this.canvas, this.toolEl, (notEmpty) => {
      if (notEmpty) {
        document.getElementById(this.tools[0].controls[0].id).removeAttribute('disabled');
      } else {
        document.getElementById(this.tools[0].controls[0].id).setAttribute('disabled', 'true');
      }
    });
    this.worklog = new WorkLog(this);


    for(let b of this.tools) {
      this._getBtnEl(b).onclick = () => {
        const currentActive = this.activeBtn;
        this.closeActiveTool();
        if (currentActive !== b) {
          this.activeBtn = b;
          this._getBtnEl(b).className += ' btn-active';
          let ctrls = '';
          for (let ctl of b.controls) {
            ctl.id = genId();
            if (ctl.type === 'btn') {
              ctrls += `<button class="${ctl.icon?'icon-btn':'named-btn'}" ` +
                `id=${ctl.id}>${ctl.icon && ('<i class="icon icon-'+ctl.icon+'></i>') || ''}` +
                `<p>${ctl.name || ''}</p></button>`;
            }
          }
          this.toolControls.innerHTML = ctrls;
          for (let ctl of b.controls) {
            document.getElementById(ctl.id).onclick = ctl.action;
          }
          b.activate();
        }
      };
    }

    this.initCallbacks();
    this.clear();
  }

  closeActiveTool() {
    if (this.activeBtn !== undefined) {
      if (this.activeBtn.close !== undefined) {
        this.activeBtn.close();
      }
      this.toolControls.innerHTML = '';
      this._getBtnEl(this.activeBtn).className =
        this._getBtnEl(this.activeBtn).className.replace(' btn-active', '');
      this.activeBtn = undefined;
    }
  }

  initCallbacks() {
    this.body.onmousedown = (event) => {
      this.cropper.procMouseDown(event);
    };
    document.onmousemove = (event) => {
      this.cropper.procMouseMove(event);
    };
    document.onmouseup = (event) => {
      this.cropper.procMoseUp()
    };

    document.onkeydown = (e) => {
      const evt = window.event ? event : e;
      if (
        (evt.keyCode == 89 && evt.ctrlKey) ||  // 89 is 'y' key
        (evt.keyCode == 90 && evt.ctrlKey && evt.shiftKey) ){  // 90 is 'z' key
          console.log('ctl+y');
          this.worklog.redoState();
      } else if (evt.keyCode == 90 && evt.ctrlKey) {
          console.log('ctl+z');
          this.worklog.undoState();
      }
    };
    document.onpaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.split('/')[0] === "image") {
          const img = new Image;
          img.onload = () => {
            this.resize(img.naturalWidth, img.naturalHeight);
            this.ctx.drawImage(img, 0, 0);
            this.adjustSizeFull();
            this.worklog.captureState();
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
    console.log((this.size.w > this.wrapper.clientWidth || this.size.h > this.wrapper.clientHeight), this.size.w > this.wrapper.clientWidth, this.size.h > this.wrapper.clientHeight,
      this.wrapper.clientWidth, this.wrapper.clientHeight);
    if (this.size.w > this.wrapper.clientWidth || this.size.h > this.wrapper.clientHeight) {
      const ratio = this.wrapper.clientWidth / this.wrapper.clientHeight;
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
    } else {
      this.canvas.style.width = 'auto';
      this.canvas.style.height = 'auto';
      this.ratioRelation = 0;
    }
    this.cropper.draw();
  }

  resize(x, y) {
    this.info.innerHTML = `${x} x ${y}`;
    this.size = {
      w: x,
      h: y,
      ratio: x/y
    };
    this.canvas.setAttribute('width', this.size.w);
    this.canvas.setAttribute('height', this.size.h);
  }

  clear() {
    this.resize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fill();
    this.worklog.captureState();
  }

  _getBtnEl(b) {
    return document.getElementById(`${this.id}-ptrobtn-${b.name}`);
  }
}

module.exports = function (params) {
  return new PainterroProc(params);
};