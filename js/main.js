'use strict';

import '../css/styles.css';
import '../css/icons/styles.css';

import { PainterroCropper } from './cropper';
import { WorkLog } from './worklog';
import { genId, addDocumentOffset } from './utils';
import { PrimitiveTool } from './primitive';
import { ColorWidget } from './colorWidget';
import { setDefaults } from './params';
import { Translation } from './translation';

class PainterroProc {

  /**
   * @param params
   */
  constructor(params) {
    this.params = setDefaults(params);
    addDocumentOffset();
    this.tools = [{
      name: 'crop',
      activate: () => {
        this.toolEl.style.cursor = 'crosshair';
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
      }],
      handlers: {
        md: (e) => this.cropper.procMouseDown(e),
        mu: (e) => this.cropper.procMoseUp(e),
        mm: (e) => this.cropper.procMouseMove(e)
      }
    }, {
      name: 'line',
      controls: [{
          type: 'color',
          title: 'lineColor',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorWidget.open();
          }
        },
      ],
      activate: () => {
        this.toolEl.style.cursor = 'crosshair';
        this.primitiveTool.activate('line');
      },
      handlers: {
        md: (e) => this.primitiveTool.procMouseDown(e),
        mu: (e) => this.primitiveTool.procMoseUp(e),
        mm: (e) => this.primitiveTool.procMouseMove(e)
      }
    }, {
      name: 'rect',
      controls: [{
          type: 'color',
          title: 'lineColor',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorWidget.open();
          }
        },
      ],
      activate: () => {
        this.toolEl.style.cursor = 'crosshair';
        this.primitiveTool.activate('rect');
      },
      handlers: {
        md: (e) => this.primitiveTool.procMouseDown(e),
        mu: (e) => this.primitiveTool.procMoseUp(e),
        mm: (e) => this.primitiveTool.procMouseMove(e)
      }
    }, {
      name: 'pipette',
      controls: ''
    }];
    this.activeTool = undefined;

    this.ratioRelation = undefined;
    this.id = this.params.id;
    this.bgColor = this.params.backgroundFillColor;
    this.baseEl = document.getElementById(this.id);

    let bar = '';
    for(let b of this.tools) {
      bar += `<button class="icon-btn" id="${this.id}-ptrobtn-${b.name}">`+
          `<i class="icon icon-${b.name}"></i></button>`;
    }

    const cropper = `<div class="ptro-crp-el">${PainterroCropper.code()}</div>`;

    this.baseEl.innerHTML =
      `<div class="painterro-wrapper" id="ptro-wrapper-${this.id}">` +
        `<canvas id="ptro-canvas-${this.id}"></canvas>` +
        cropper +
        ColorWidget.html() +
      '</div>' +
      '<div class="painterro-bar">' +
        '<span>' + bar + '</span>' +
        '<span class="tool-controls"></span>' +
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
    this.primitiveTool = new PrimitiveTool(this);
    this.worklog = new WorkLog(this);
    this.colorWidget = new ColorWidget(this);
    this.translator = new Translation();
    this.tr = (n) => this.translator.tr(n);

    for(let b of this.tools) {
      this._getBtnEl(b).onclick = () => {
        const currentActive = this.activeTool;
        this.closeActiveTool();
        if (currentActive !== b) {
          this.activeTool = b;
          this._getBtnEl(b).className += ' btn-active';
          let ctrls = '';
          for (let ctl of b.controls) {
            ctl.id = genId();
            if (ctl.title) {
              ctrls += `<span class="ptro-tool-ctl-name" title="${this.tr(ctl.titleFull)}">${this.tr(ctl.title)}</span>`
            }
            if (ctl.type === 'btn') {
              ctrls += `<button class="${ctl.icon?'icon-btn':'named-btn'}" ` +
                `id=${ctl.id}>${ctl.icon && ('<i class="icon icon-'+ctl.icon+'></i>') || ''}` +
                `<p>${ctl.name || ''}</p></button>`;
            } else if (ctl.type === 'color') {
              ctrls += `<button id=${ctl.id} style="background-color: ${this.colorWidget.alphaColor}" class="color-diwget-btn"></button>`+
                  '<span class="ptro-btn-color-bg">' +
                  '<span></span><span></span><span></span><span></span>' +
                  '<span></span><span></span><span></span><span></span></span>';
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
    if (this.activeTool !== undefined) {
      if (this.activeTool.close !== undefined) {
        this.activeTool.close();
      }
      this.toolControls.innerHTML = '';
      this._getBtnEl(this.activeTool).className =
        this._getBtnEl(this.activeTool).className.replace(' btn-active', '');
      this.activeTool = undefined;
    }
  }

  handleToolEvent(eventName, event) {
    this.activeTool && this.activeTool.handlers &&
    this.activeTool.handlers[eventName] && this.activeTool.handlers[eventName](event);
  }
  initCallbacks() {
    this.body.onmousedown = (e) => {
      this.handleToolEvent('md', e);
    };
    document.onmousemove = (e) => {
      this.handleToolEvent('mm', e);
      this.colorWidget.handleMouseMove(e);
    };
    document.onmouseup = (e) => {
      this.handleToolEvent('mu', e);
      this.colorWidget.handleMouseUp(e);
    };
    document.onkeydown = (e) => {
      const evt = window.event ? event : e;
      if (
        (evt.keyCode == 89 && evt.ctrlKey) ||  // 89 is 'y' key
        (evt.keyCode == 90 && evt.ctrlKey && evt.shiftKey) ){  // 90 is 'z' key
          this.worklog.redoState();
      } else if (evt.keyCode == 90 && evt.ctrlKey) {
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
      this.syncToolElement();
    };
  }

  getScale() {
    return this.canvas.getAttribute('width') / this.canvas.offsetWidth;
  }
  adjustSizeFull() {
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
    this.syncToolElement();
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

  syncToolElement() {
    this.toolEl.style.left = this.canvas.offsetLeft;
    this.toolEl.style.top = this.canvas.offsetTop;
    this.toolEl.style.width = this.canvas.clientWidth;
    this.toolEl.style.height = this.canvas.clientHeight;
  }

  clear() {
    this.resize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fill();
    this.worklog.captureState();
    this.syncToolElement();
  }

  _getBtnEl(b) {
    return document.getElementById(`${this.id}-ptrobtn-${b.name}`);
  }
}

module.exports = function (params) {
  return new PainterroProc(params);
};