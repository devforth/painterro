'use strict';

import '../css/styles.css';
import '../css/icons/styles.css';

import { PainterroCropper } from './cropper';
import { WorkLog } from './worklog';
import { genId, addDocumentOffset } from './utils';
import { PrimitiveTool } from './primitive';
import { ColorPicker } from './colorPicker';
import { setDefaults } from './params';
import { Translation } from './translation';
import { ZoomHelper } from './zoomHelper';

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
        this.toolContainer.style.cursor = 'crosshair';
        this.cropper.activate();
        this.cropper.draw();
      },
      close: () => {
        this.cropper.cropper.activated = false;
        this.cropper.cropper.rect.setAttribute('hidden', 'true');
        this.toolContainer.style.cursor = 'auto';
      },
      controls: [{
        name: 'Apply',
        type: 'btn',
        action: () => {
          this.cropper.doCrop();
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
          target: 'line',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          }
        }, {
          type: 'int',
          title: 'lineWidth',
          titleFull: 'lineWidthFull',
          target: 'lineWidth',
          min: 1,
          max: 50,
          action: () => {
            const width = document.getElementById(this.activeTool.controls[1].id);
            this.primitiveTool.setLineWidth(width.value);
          },
          getValue: () => {
            return this.primitiveTool.lineWidth;
          }
        }
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
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
          target: 'line',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          }
        }, {
          type: 'color',
          title: 'fillColor',
          titleFull: 'fillColorFull',
          target: 'fill',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.fill);
          }
        }, {
          type: 'int',
          title: 'lineWidth',
          titleFull: 'lineWidthFull',
          target: 'lineWidth',
          min: 1,
          max: 50,
          action: () => {
            const width = document.getElementById(this.activeTool.controls[2].id);
            this.primitiveTool.setLineWidth(width.value);
          },
          getValue: () => {
            return this.primitiveTool.lineWidth;
          }
        }
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('rect');
      },
      handlers: {
        md: (e) => this.primitiveTool.procMouseDown(e),
        mu: (e) => this.primitiveTool.procMoseUp(e),
        mm: (e) => this.primitiveTool.procMouseMove(e)
      }
    }, ];
    this.activeTool = undefined;
    this.zoom = false;
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
        ColorPicker.html() +
        ZoomHelper.html() +
      '</div>' +
      '<div class="painterro-bar">' +
        '<span>' + bar + '</span>' +
        '<span class="tool-controls"></span>' +
        '<span class="ptro-info"></span>' +
      '</div>';

    this.body = document.body;
    this.wrapper = document.querySelector(`#${this.id} .painterro-wrapper`);
    this.info = document.querySelector(`#${this.id} .ptro-info`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.toolControls = document.querySelector(`#${this.id} .tool-controls`);
    this.toolContainer = document.querySelector(`#${this.id} .ptro-crp-el`);
    this.zoomHelper = new ZoomHelper(this);
    this.cropper = new PainterroCropper(this, (notEmpty) => {
      if (notEmpty) {
        document.getElementById(this.tools[0].controls[0].id).removeAttribute('disabled');
      } else {
        document.getElementById(this.tools[0].controls[0].id).setAttribute('disabled', 'true');
      }
    });
    this.primitiveTool = new PrimitiveTool(this);
    this.primitiveTool.setLineWidth(this.params.defaultLineWidth)
    this.worklog = new WorkLog(this);
    this.colorPicker = new ColorPicker(this, (widgetState) => {
      this.colorWidgetState[widgetState.target] = widgetState;
      document.querySelector(
        `#${this.id} .color-diwget-btn[data-id='${widgetState.target}']`).style['background-color'] =
          widgetState.alphaColor;
    });
    this.colorWidgetState = {
      line: {
        target: 'line',
        palleteColor: this.params.activeColor,
        alpha: this.params.activeColorAlpha,
        alphaColor: this.params.activeAlphaColor
      },
      fill: {
        target: 'fill',
        palleteColor: this.params.activeFillColor,
        alpha: this.params.activeFillColorAlpha,
        alphaColor: this.params.activeFillAlphaColor
      }
    };

    this.tr = (n) => Translation.get().tr(n);

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
              ctrls += `<button id=${ctl.id} data-id='${ctl.target}' `+
                `style="background-color: ${this.colorWidgetState[ctl.target].alphaColor}" ` +
                `class="color-diwget-btn"></button>`+
                  '<span class="ptro-btn-color-bg">' +
                    '<span></span><span></span><span></span><span></span>' +
                    '<span></span><span></span><span></span><span></span>' +
                  '</span>';
            } else if (ctl.type === 'int') {
              ctrls += `<input id=${ctl.id} class="ptro-input" type="number" min="${ctl.min}" max="${ctl.max}" ` +
                `data-id='${ctl.target}'/>`
            }
          }
          this.toolControls.innerHTML = ctrls;
          for (let ctl of b.controls) {
            if (ctl.type === 'int') {
              document.getElementById(ctl.id).value = ctl.getValue();
              document.getElementById(ctl.id).onclick = ctl.action;
              document.getElementById(ctl.id).onchange = ctl.action;
            } else {
              document.getElementById(ctl.id).onclick = ctl.action;
            }
          }
          b.activate();
        }
      };
    }
    this.initEventHandlers();
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

  initEventHandlers() {
    this.documentHandlers = {
      'mousedown': (e) => {
        if (this.colorPicker.handleMouseDown(e) !== true) {
          this.handleToolEvent('md', e);
        }
      },
      'mousemove': (e) => {
        this.handleToolEvent('mm', e);
        this.colorPicker.handleMouseMove(e);
        this.zoomHelper.handleMouseMove(e);
      },
      'mouseup': (e) => {
        this.handleToolEvent('mu', e);
        this.colorPicker.handleMouseUp(e);
      },
      'mousewheel': (e) => {
        if (e.ctrlKey) {
          this.zoom = e.wheelDelta > 0;
          this.adjustSizeFull();
          e.preventDefault();
        }
      },
      'keydown': (e) => {
        const evt = window.event ? event : e;
        if (
          (evt.keyCode == 89 && evt.ctrlKey) ||  // 89 is 'y' key
          (evt.keyCode == 90 && evt.ctrlKey && evt.shiftKey) ){  // 90 is 'z' key
            this.worklog.redoState();
        } else if (evt.keyCode == 90 && evt.ctrlKey) {
            this.worklog.undoState();
        }
      },
      'paste': (event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let item of items) {
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
      }
    };

    this.windowHandlers = {
      'resize': () => {
        this.adjustSizeFull();
        this.syncToolElement();
      }
    };

    for (let key of Object.keys(this.documentHandlers)) {
       document.addEventListener(key, this.documentHandlers[key]);
    }

    for (let key of Object.keys(this.windowHandlers)) {
       window.addEventListener(key, this.windowHandlers[key]);
    }

  }

  getScale() {
    return this.canvas.getAttribute('width') / this.canvas.offsetWidth;
  }
  adjustSizeFull() {
    if (this.size.w > this.wrapper.clientWidth || this.size.h > this.wrapper.clientHeight) {
      const ratio = this.wrapper.clientWidth / this.wrapper.clientHeight;

      if (this.zoom === false) {
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
        this.wrapper.style['overflow'] = 'hidden';
        this.wrapper.className = 'painterro-wrapper ptro-v-aligned';
      } else {
        this.wrapper.style['overflow'] = 'scroll';
        this.canvas.style.width = 'auto';
        this.canvas.style.height = 'auto';
        this.ratioRelation = 0;
        this.wrapper.className = 'painterro-wrapper';
      }
    } else {
      this.wrapper.style['overflow'] = 'hidden';
      this.canvas.style.width = 'auto';
      this.canvas.style.height = 'auto';
      this.wrapper.className = 'painterro-wrapper ptro-v-aligned';
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
    // save values before changing, changing one in toolContainer may lead to changing other in canvas
    const w = this.canvas.clientWidth;
    const l = this.canvas.offsetLeft;
    const h = this.canvas.clientHeight;
    const t = this.canvas.offsetTop;
    this.toolContainer.style.left = `${l}px`;
    this.toolContainer.style.width = `${w}px`;
    this.toolContainer.style.top = `${t}px`;
    this.toolContainer.style.height = `${h}px`;
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