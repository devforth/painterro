'use strict';

import '../css/styles.css';
import '../css/bar-styles.css';
import '../css/icons/iconfont.css';

import { PainterroCropper } from './cropper';
import { WorkLog } from './worklog';
import { genId, addDocumentObjectHelpers } from './utils';
import { PrimitiveTool } from './primitive';
import { ColorPicker } from './colorPicker';
import { setDefaults } from './params';
import { Translation } from './translation';
import { ZoomHelper } from './zoomHelper';
import { TextTool } from './text';
import { Resizer } from './resizer';

const tr = (n) => Translation.get().tr(n);

class PainterroProc {

  /**
   * @param params
   */
  constructor(params) {
    addDocumentObjectHelpers();
    this.params = setDefaults(params);

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
        name: tr('apply'),
        type: 'btn',
        action: () => {
          this.cropper.doCrop();
          this.closeActiveTool();
        }
      }, {
        name: tr('cancel'),
        type: 'btn',
        action: () => {
          this.closeActiveTool();
        }
      }],
      eventListner: () => this.cropper
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
          max: 99,
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
      eventListner: () => this.primitiveTool
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
          max: 99,
          action: () => {
            const width = document.getElementById(this.activeTool.controls[2].id).value;
            this.primitiveTool.setLineWidth(width);
          },
          getValue: () => {
            return this.primitiveTool.lineWidth;
          }
        },
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('rect');
      },
      eventListner: () => this.primitiveTool
    }, {
      name: 'ellipse',
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
          max: 99,
          action: () => {
            const width = document.getElementById(this.activeTool.controls[2].id).value;
            this.primitiveTool.setLineWidth(width);
          },
          getValue: () => {
            return this.primitiveTool.lineWidth;
          }
        },
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('ellipse');
      },
      eventListner: () => this.primitiveTool
    }, {
      name: 'brush',
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
          max: 99,
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
        this.primitiveTool.activate('brush');
      },
      eventListner: () => this.primitiveTool
    }, {
      name: 'text',
      controls: [
        {
          type: 'color',
          title: 'textColor',
          titleFull: 'textColorFull',
          target: 'line',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line, (c) => {
              this.textTool.setFontColor(c.alphaColor);
            });
          }
        }, {
          type: 'int',
          title: 'fontSize',
          titleFull: 'fontSizeFull',
          target: 'fontSize',
          min: 1,
          max: 200,
          action: () => {
            const width = document.getElementById(this.activeTool.controls[1].id).value;
            this.textTool.setFontSize(width);
          },
          getValue: () => {
            return this.textTool.fontSize;
          }
        }, {
          type: 'dropdown',
          title: 'fontName',
          titleFull: 'fontNameFull',
          target: 'fontName',
          action: () => {
            const dropdown = document.getElementById(this.activeTool.controls[2].id);
            const font = dropdown.value;
            this.textTool.setFont(font);
          },
          getValue: () => {
            return this.textTool.getFont();
          },
          getAvilableValues: () => {
            return this.textTool.getFonts()
          }
        }, {
          name: tr('apply'),
          type: 'btn',
          action: () => {
            this.textTool.apply();
            this.closeActiveTool();
          }
        }, {
          name: tr('cancel'),
          type: 'btn',
          action: () => {
            this.textTool.cancel();
            this.closeActiveTool();
          }
        }
      ],
      activate: () => {
        this.textTool.setFontColor(this.colorWidgetState.line.alphaColor);
        this.toolContainer.style.cursor = 'crosshair';
        this.textTool.activate();
      },
      close: () => {
        this.textTool.cancel()
      },
      eventListner: () => this.textTool
    }, {
      name: 'rotate',
      activate: () => {
        const tmpData = this.canvas.toDataURL();
        const w = this.size.w;
        const h = this.size.h;
        this.resize(h, w);

        this.ctx.save();
        this.ctx.translate(h / 2, w / 2);
        this.ctx.rotate(90 * Math.PI / 180);
        const img = new Image;
        img.onload = () => {
          this.ctx.drawImage(img, -w / 2, -h/2);
          this.adjustSizeFull();
          this.ctx.restore();
          this.worklog.captureState();
          this.closeActiveTool();
        };
        img.src = tmpData;

      },
    }, {
      name: 'resize',
      activate: () => {
        this.resizer.open();
      },
      close: () => {
        this.resizer.close();
      }
    }, {
      name: 'save',
      right: true,
      activate: () => {
        this.save();
        this.closeActiveTool();
      },
    }, {
      name: 'open',
      right: true,
      activate: () => {
        this.closeActiveTool();
        document.getElementById('ptro-file-input').click();
        document.getElementById('ptro-file-input').onchange = (event) => {
          const files = event.target.files || event.dataTransfer.files;
          if (!files.length) {
            return;
          }
          this.openFile(files[0])
        }
      },
    }, {
      name: 'close',
      right: true,
      activate: () => {
        this.closeActiveTool();
        this.hide();
      },
    },];

    this.toolByName = {};
    for (let t of this.tools) {
      this.toolByName[t.name] = t;
    }
    this.activeTool = undefined;
    this.zoom = false;
    this.ratioRelation = undefined;
    this.id = this.params.id;
    this.bgColor = this.params.backgroundFillColor;

    if (this.id === undefined) {
      this.id = genId();
      this.holderId = genId();
      document.body.innerHTML += `<div id='${this.holderId}' class="ptro-holder-wrapper">` +
        `<div id='${this.id}' class="ptro-holder"></div></div>`;
      this.baseEl = document.getElementById(this.id);
      this.holderEl = document.getElementById(this.holderId);
    } else {
      this.baseEl = document.getElementById(this.id);
      this.holderEl = null;
    }
    let bar = '';
    let rightBar = '';
    for(let b of this.tools.filter((t) => !this.params.hiddenTools.includes(t.name))) {
      const id = genId();
      b.buttonId = id;
      const btn =  `<button class="ptro-icon-btn ptro-color-control" title="${tr('tools.'+b.name)}" `+
        `id="${id}" >`+
          `<i class="ptro-icon ptro-icon-${b.name}"></i></button>`;
      if (b.right) {
        rightBar += btn;
      } else {
        bar += btn;
      }
    }

    const cropper = `<div class="ptro-crp-el">${PainterroCropper.code()}${TextTool.code()}</div>`;

    this.baseEl.innerHTML =
      `<div class="ptro-wrapper" id="ptro-wrapper-${this.id}">` +
        `<canvas id="ptro-canvas-${this.id}"></canvas>` +
        cropper +
        ColorPicker.html() +
        ZoomHelper.html() +
        Resizer.html() +
      '</div>' +
      '<div class="ptro-bar ptro-color-main">' +
        '<span>' + bar + '</span>' +
        '<span class="tool-controls"></span>' +
        '<span class="ptro-bar-right">' + rightBar + '</span>' +
        '<span class="ptro-info"></span>' +
        '<input id="ptro-file-input" type="file" style="display: none;" accept="image/x-png,image/gif,image/jpeg" />' +
      '</div>' +
      `<style>${this.params.styles}</style>`;

    this.saveBtn = document.getElementById(this.toolByName.save.buttonId);
    if (this.saveBtn) {
      this.saveBtn.setAttribute('disabled', true);
      this.changedHandler = () => {
        this.saveBtn.removeAttribute('disabled');
      };
    }

    this.body = document.body;
    this.wrapper = document.querySelector(`#${this.id} .ptro-wrapper`);
    this.bar = document.querySelector(`#${this.id} .ptro-bar`);
    this.info = document.querySelector(`#${this.id} .ptro-info`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.toolControls = document.querySelector(`#${this.id} .tool-controls`);
    this.toolContainer = document.querySelector(`#${this.id} .ptro-crp-el`);
    this.zoomHelper = new ZoomHelper(this);
    this.cropper = new PainterroCropper(this, (notEmpty) => {
      if (notEmpty) {
        document.getElementById(this.toolByName.crop.controls[0].id).removeAttribute('disabled');
      } else {
        document.getElementById(this.toolByName.crop.controls[0].id).setAttribute('disabled', 'true');
      }
    });
    this.resizer = new Resizer(this);
    this.primitiveTool = new PrimitiveTool(this);
    this.primitiveTool.setLineWidth(this.params.defaultLineWidth);
    this.worklog = new WorkLog(this);
    this.textTool = new TextTool(this);
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

    for(let b of this.tools.filter((t) => !this.params.hiddenTools.includes(t.name))) {
      this._getBtnEl(b).onclick = () => {
        const currentActive = this.activeTool;
        this.closeActiveTool();
        if (currentActive !== b) {
          this.activeTool = b;
          this._getBtnEl(b).className += ' ptro-color-active-control';
          let ctrls = '';
          for (let ctl of b.controls || []) {
            ctl.id = genId();
            if (ctl.title) {
              ctrls += `<span class="ptro-tool-ctl-name" title="${tr(ctl.titleFull)}">${tr(ctl.title)}</span>`
            }
            if (ctl.type === 'btn') {
              ctrls += `<button class="ptro-color-control ${ctl.icon?'ptro-icon-btn':'ptro-named-btn'}" ` +
                `id=${ctl.id}>${ctl.icon && ('<i class="ptro-icon ptro-icon-'+ctl.icon+'></i>') || ''}` +
                `<p>${ctl.name || ''}</p></button>`;
            } else if (ctl.type === 'color') {
              ctrls += `<button id=${ctl.id} data-id='${ctl.target}' `+
                `style="background-color: ${this.colorWidgetState[ctl.target].alphaColor}" ` +
                `class="color-diwget-btn ptro-bordered-btn"></button>`+
                  '<span class="ptro-btn-color-bg">' +
                    '<span></span><span></span><span></span><span></span>' +
                    '<span></span><span></span><span></span><span></span>' +
                  '</span>' +
                  '<span class="color-diwget-btn-substrate"></span>';
            } else if (ctl.type === 'int') {
              ctrls += `<input id=${ctl.id} class="ptro-input" type="number" min="${ctl.min}" max="${ctl.max}" ` +
                `data-id='${ctl.target}'/>`
            } else if (ctl.type === 'dropdown') {
              let options = '';
              for (let o of ctl.getAvilableValues()) {
                options += `<option ${ctl.target === 'fontName' && ('style=\'font-family:'+o.value+'\'') || ''}` +
                  ` value='${o.value}'>${o.name}</option>`;
              }
              ctrls += `<select id=${ctl.id} class="ptro-input" ` +
                `data-id='${ctl.target}'>${options}</select>`
            }
          }
          this.toolControls.innerHTML = ctrls;
          for (let ctl of b.controls || []) {
            if (ctl.type === 'int') {
              document.getElementById(ctl.id).value = ctl.getValue();
              document.getElementById(ctl.id).oninput = ctl.action;
            } else if (ctl.type === 'dropdown') {
              document.getElementById(ctl.id).onchange = ctl.action;
            } else {
              document.getElementById(ctl.id).onclick = ctl.action;
            }
          }
          b.activate();
        }
      };
    }

    this.imageSaver = {
       /**
       * Returns image as base64 data url
       * @param {string} type - type of data url, default image/png
       */
      asDataURL: (type) => {
        if (type === undefined) {
          return this.canvas.toDataURL();
        } else {
          return this.canvas.toDataURL(type);
        }
      }
    }

    this.initEventHandlers();
    this.clear();
    this.hide();
  }

  save () {
    const btn = document.getElementById(this.toolByName.save.buttonId);
    const icon = document.querySelector(`#${this.toolByName.save.buttonId} > i`);
    btn && (btn.setAttribute('disabled', 'true'));
    icon && (icon.className = 'ptro-icon ptro-icon-loading ptro-spinning')

    if (this.params.saveHandler !== undefined) {
      this.params.saveHandler(this.imageSaver, (hide) => {
        if (hide === true) {
          this.hide()
        }
        icon && (icon.className = 'ptro-icon ptro-icon-save');
        //btn && (btn.removeAttribute('disabled'));
      })
    } else {
      console.error("No saveHandler defined, please check documentation")
      icon && (icon.className = 'ptro-icon ptro-icon-save');
      //btn && (btn.removeAttribute('disabled'))
    }
    return this;
  }

  closeActiveTool () {
    if (this.activeTool !== undefined) {
      if (this.activeTool.close !== undefined) {
        this.activeTool.close();
      }
      this.toolControls.innerHTML = '';
      this._getBtnEl(this.activeTool).className =
        this._getBtnEl(this.activeTool).className.replace(' ptro-color-active-control', '');
      this.activeTool = undefined;
    }
  }

  handleToolEvent(eventHandler, event) {
    if (this.activeTool && this.activeTool.eventListner) {
      const listner = this.activeTool.eventListner();
      listner[eventHandler] && listner[eventHandler](event);
    }
  }

  initEventHandlers() {
    this.documentHandlers = {
      'mousedown': (e) => {
        if (this.shown) {
          if (this.colorPicker.handleMouseDown(e) !== true) {
            this.handleToolEvent('handleMouseDown', e);
          }
        }
      },
      'mousemove': (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseMove', e);
          this.colorPicker.handleMouseMove(e);
          this.zoomHelper.handleMouseMove(e);
        }
      },
      'mouseup': (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseUp', e);
          this.colorPicker.handleMouseUp(e);
        }
      },
      'mousewheel': (e) => {
        if (this.shown) {
          if (e.ctrlKey) {
            this.zoom = e.wheelDelta > 0;
            this.adjustSizeFull();
            e.preventDefault();
          }
        }
      },
      'keydown': (e) => {
        if (this.shown) {
          const evt = window.event ? event : e;
          if (
            (evt.keyCode == 89 && evt.ctrlKey) ||  // 89 is 'y' key
            (evt.keyCode == 90 && evt.ctrlKey && evt.shiftKey)) {  // 90 is 'z' key
            this.worklog.redoState();
          } else if (evt.keyCode == 90 && evt.ctrlKey) {
            this.worklog.undoState();
          }
        }
      },
      'paste': (event) => {
        if (this.shown) {
          const items = (event.clipboardData || event.originalEvent.clipboardData).items;
          for (let item of items) {
            if (item.kind === 'file' && item.type.split('/')[0] === "image") {
              this.openFile(item.getAsFile());
            }
          }
        }
      },
      'dragover': (event) => {
        if (this.shown) {
          const mainClass = event.target.classList[0];
          if (mainClass === 'ptro-crp-el' || mainClass === 'ptro-bar') {
            this.bar.className = 'ptro-bar ptro-color-main ptro-bar-dragover';
          }
          event.preventDefault();
        }
      },
      'dragleave': (event) => {
        if (this.shown) {
          this.bar.className = 'ptro-bar ptro-color-main';
        }
      },
      'drop': (event) => {
        if (this.shown) {
          this.bar.className = 'ptro-bar ptro-color-main';
          event.preventDefault();
          this.openFile(event.dataTransfer.files[0])
        }
      }
    };

    this.windowHandlers = {
      'resize': () => {
        if (this.shown) {
          this.adjustSizeFull();
          this.syncToolElement();
        }
      }
    };

    for (let key of Object.keys(this.documentHandlers)) {
       document.addEventListener(key, this.documentHandlers[key]);
    }

    for (let key of Object.keys(this.windowHandlers)) {
       window.addEventListener(key, this.windowHandlers[key]);
    }
  }

  loadImage (source) {
    const img = new Image;
    img.onload = () => {
      this.resize(img.naturalWidth, img.naturalHeight);
      this.ctx.drawImage(img, 0, 0);
      this.adjustSizeFull();
      this.worklog.captureState();
    };
    img.src = source;
  }

  show (openImage) {
    this.shown = true;
    this.baseEl.removeAttribute('hidden');
    if (this.holderEl) {
      this.holderEl.removeAttribute('hidden');
    }
    if (typeof openImage === 'string') {
      this.loadImage(openImage)
    } else {
      if (openImage !== false) {
        this.clear();
      }
    }
    return this;
  }

  hide () {
    this.shown = false;
    this.baseEl.setAttribute('hidden', true);
    if (this.holderEl) {
      this.holderEl.setAttribute('hidden', true);
    }
    return this;
  }

  openFile(f) {
    this.loadImage(URL.createObjectURL(f));
  }

  getScale() {
    return this.canvas.getAttribute('width') / this.canvas.offsetWidth;
  }
  adjustSizeFull() {
    if (this.size.w > this.wrapper.documentClientWidth || this.size.h > this.wrapper.documentClientHeight) {
      const ratio = this.wrapper.documentClientWidth / this.wrapper.documentClientHeight;

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
        this.wrapper.className = 'ptro-wrapper ptro-v-aligned';
      } else {
        this.wrapper.style['overflow'] = 'scroll';
        this.canvas.style.width = 'auto';
        this.canvas.style.height = 'auto';
        this.ratioRelation = 0;
        this.wrapper.className = 'ptro-wrapper';
      }
    } else {
      this.wrapper.style['overflow'] = 'hidden';
      this.canvas.style.width = 'auto';
      this.canvas.style.height = 'auto';
      this.wrapper.className = 'ptro-wrapper ptro-v-aligned';
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
    const w = this.params.defaultSize.width === 'fill' && this.wrapper.clientWidth || this.params.defaultSize.width;
    const h = this.params.defaultSize.height === 'fill' && this.wrapper.clientHeight || this.params.defaultSize.height;
    this.resize(w, h);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fill();
    this.worklog.captureState(true);
    this.syncToolElement();
    this.adjustSizeFull();
  }

  _getBtnEl(b) {
    return document.getElementById(b.buttonId);
  }
}

module.exports = function (params) {
  return new PainterroProc(params);
};