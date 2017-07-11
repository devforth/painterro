import '../css/styles.css';
import '../css/bar-styles.css';
import '../css/icons/iconfont.css';

import PainterroSelecter from './selecter';
import WorkLog from './worklog';
import { genId, addDocumentObjectHelpers } from './utils';
import PrimitiveTool from './primitive';
import ColorPicker from './colorPicker';
import setDefaults from './params';
import Translation from './translation';
import ZoomHelper from './zoomHelper';
import TextTool from './text';
import Resizer from './resizer';

const tr = n => Translation.get().tr(n);

function getBtnEl(b) {
  return document.getElementById(b.buttonId);
}

class PainterroProc {
  constructor(params) {
    addDocumentObjectHelpers();
    this.params = setDefaults(params);

    this.tools = [{
      name: 'select',
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.select.activate();
        this.select.draw();
      },
      close: () => {
        this.select.close();
        this.toolContainer.style.cursor = 'auto';
      },
      eventListner: () => this.select,
    }, {
      name: 'crop',
      activate: () => {
        this.select.doCrop();
        this.closeActiveTool();
      },
    }, {
      name: 'pixelize',
      activate: () => {
        this.select.doPixelize();
        this.closeActiveTool();
      },
    }, {
      name: 'line',
      controls: [{
        type: 'color',
        title: 'lineColor',
        target: 'line',
        titleFull: 'lineColorFull',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.line);
        },
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
        getValue: () => this.primitiveTool.lineWidth,
      }],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('line');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'rect',
      controls: [{
        type: 'color',
        title: 'lineColor',
        titleFull: 'lineColorFull',
        target: 'line',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.line);
        },
      }, {
        type: 'color',
        title: 'fillColor',
        titleFull: 'fillColorFull',
        target: 'fill',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.fill);
        },
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
        getValue: () => this.primitiveTool.lineWidth,
      },
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('rect');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'ellipse',
      controls: [{
        type: 'color',
        title: 'lineColor',
        titleFull: 'lineColorFull',
        target: 'line',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.line);
        },
      }, {
        type: 'color',
        title: 'fillColor',
        titleFull: 'fillColorFull',
        target: 'fill',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.fill);
        },
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
        getValue: () => this.primitiveTool.lineWidth,
      },
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('ellipse');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'brush',
      controls: [{
        type: 'color',
        title: 'lineColor',
        target: 'line',
        titleFull: 'lineColorFull',
        action: () => {
          this.colorPicker.open(this.colorWidgetState.line);
        },
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
        getValue: () => this.primitiveTool.lineWidth,
      },
      ],
      activate: () => {
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('brush');
      },
      eventListner: () => this.primitiveTool,
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
          },
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
          getValue: () => this.textTool.fontSize,
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
          getValue: () => this.textTool.getFont(),
          getAvilableValues: () => TextTool.getFonts(),
        }, {
          name: tr('apply'),
          type: 'btn',
          action: () => {
            this.textTool.apply();
            this.closeActiveTool();
          },
        }, {
          name: tr('cancel'),
          type: 'btn',
          action: () => {
            this.textTool.cancel();
            this.closeActiveTool();
          },
        },
      ],
      activate: () => {
        this.textTool.setFontColor(this.colorWidgetState.line.alphaColor);
        this.toolContainer.style.cursor = 'crosshair';
      },
      close: () => {
        this.textTool.cancel();
      },
      eventListner: () => this.textTool,
    }, {
      name: 'rotate',
      activate: () => {
        const tmpData = this.canvas.toDataURL();
        const w = this.size.w;
        const h = this.size.h;
        this.resize(h, w);

        this.ctx.save();
        this.ctx.translate(h / 2, w / 2);
        this.ctx.rotate((90 * Math.PI) / 180);
        const img = new Image();
        img.onload = () => {
          this.ctx.drawImage(img, -w / 2, -h / 2);
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
      },
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
          this.openFile(files[0]);
        };
      },
    }, {
      name: 'close',
      right: true,
      activate: () => {
        this.closeActiveTool();
        this.hide();
      },
    }];

    this.toolByName = {};
    this.tools.forEach((t) => {
      this.toolByName[t.name] = t;
    });
    this.activeTool = undefined;
    this.zoom = false;
    this.ratioRelation = undefined;
    this.id = this.params.id;
    this.bgColor = this.params.backgroundFillColor;
    this.saving = false;

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
    this.tools.filter(t => this.params.hiddenTools.indexOf(t.name) === -1).forEach((b) => {
      const id = genId();
      b.buttonId = id;
      const btn = `<button class="ptro-icon-btn ptro-color-control" title="${tr(`tools.${b.name}`)}" ` +
        `id="${id}" >` +
        `<i class="ptro-icon ptro-icon-${b.name}"></i></button>`;
      if (b.right) {
        rightBar += btn;
      } else {
        bar += btn;
      }
    });

    const cropper = `<div class="ptro-crp-el">${PainterroSelecter.code()}${TextTool.code()}</div>`;

    this.baseEl.innerHTML =
      `${`<div class="ptro-wrapper" id="ptro-wrapper-${this.id}">` +
      `<canvas id="ptro-canvas-${this.id}"></canvas>`}${
        cropper
      }${ColorPicker.html()
      }${ZoomHelper.html()
      }${Resizer.html()
      }</div>` +
      '<div class="ptro-bar ptro-color-main">' +
      `<span>${bar}</span>` +
      '<span class="tool-controls"></span>' +
      `<span class="ptro-bar-right">${rightBar}</span>` +
      '<span class="ptro-info"></span>' +
      '<input id="ptro-file-input" type="file" style="display: none;" accept="image/x-png,image/gif,image/jpeg" />' +
      '</div>' +
      `<style>${this.params.styles}</style>`;

    this.saveBtn = document.getElementById(this.toolByName.save.buttonId);
    if (this.saveBtn) {
      this.saveBtn.setAttribute('disabled', 'true');
    }
    this.changedHandler = () => {
      if (this.saveBtn) {
        this.saveBtn.removeAttribute('disabled');
      }
    };
    this.body = document.body;
    this.wrapper = document.querySelector(`#${this.id} .ptro-wrapper`);
    this.bar = document.querySelector(`#${this.id} .ptro-bar`);
    this.info = document.querySelector(`#${this.id} .ptro-info`);
    this.canvas = document.querySelector(`#${this.id} canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.toolControls = document.querySelector(`#${this.id} .tool-controls`);
    this.toolContainer = document.querySelector(`#${this.id} .ptro-crp-el`);
    this.zoomHelper = new ZoomHelper(this);
    this.select = new PainterroSelecter(this, (notEmpty) => {
      [this.toolByName.crop, this.toolByName.pixelize].forEach((c) => {
        if (notEmpty) {
          document.getElementById(c.buttonId).removeAttribute('disabled');
        } else {
          document.getElementById(c.buttonId).setAttribute('disabled', 'true');
        }
      });
    });
    this.resizer = new Resizer(this);
    this.primitiveTool = new PrimitiveTool(this);
    this.primitiveTool.setLineWidth(this.params.defaultLineWidth);
    this.primitiveTool.setPixelSize(this.params.defaultPixelSize);
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
        alphaColor: this.params.activeAlphaColor,
      },
      fill: {
        target: 'fill',
        palleteColor: this.params.activeFillColor,
        alpha: this.params.activeFillColorAlpha,
        alphaColor: this.params.activeFillAlphaColor,
      },
    };


    this.tools.filter(t => this.params.hiddenTools.indexOf(t.name) === -1).forEach((b) => {
      getBtnEl(b).onclick = () => {
        if (b === this.toolByName.select && this.activeTool === b) {
          return;
        }
        const currentActive = this.activeTool;
        this.closeActiveTool(true);
        if (currentActive !== b) {
          this.setActiveTool(b);
        } else {
          this.setActiveTool(this.toolByName.select);
        }
      };
    });

    this.setActiveTool(this.toolByName.select);

    this.imageSaver = {
      /**
       * Returns image as base64 data url
       * @param {string} type - type of data url, default image/png
       * @param {string} quality - number from 0 to 1, works for `image/jpeg` or `image/webp`
       */
      asDataURL: (type, quality) => {
        let realType = type;
        if (realType === undefined) {
          realType = 'image/png';
        }
        return this.getAsUri(realType, quality);
      },
      asBlob: (type, quality) => {
        let realType = type;
        if (realType === undefined) {
          realType = 'image/png';
        }
        const uri = this.getAsUri(realType, quality);
        const byteString = atob(uri.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i += 1) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: realType });
      },
    };

    this.initEventHandlers();
    this.clear();
    this.hide();
  }

  getAsUri(type, quality) {
    let realQuality = quality;
    if (realQuality === undefined) {
      realQuality = 0.92;
    }
    return this.canvas.toDataURL(type, realQuality);
  }

  save() {
    if (this.saving) {
      return this;
    }
    this.saving = true;
    const btn = document.getElementById(this.toolByName.save.buttonId);
    const icon = document.querySelector(`#${this.toolByName.save.buttonId} > i`);
    if (btn) {
      btn.setAttribute('disabled', 'true');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-loading ptro-spinning';
    }

    if (this.params.saveHandler !== undefined) {
      this.params.saveHandler(this.imageSaver, (hide) => {
        if (hide === true) {
          this.hide();
        }
        if (icon) {
          icon.className = 'ptro-icon ptro-icon-save';
        }
        this.saving = false;
      });
    } else {
      console.error('No saveHandler defined, please check documentation');
      if (icon) {
        icon.className = 'ptro-icon ptro-icon-save';
      }
      this.saving = false;
    }
    return this;
  }

  closeActiveTool(doNotSelect) {
    if (this.activeTool !== undefined) {
      if (this.activeTool.close !== undefined) {
        this.activeTool.close();
      }
      this.toolControls.innerHTML = '';
      getBtnEl(this.activeTool).className =
        getBtnEl(this.activeTool).className.replace(' ptro-color-active-control', '');
      this.activeTool = undefined;
    }
    if (doNotSelect !== true) {
      this.setActiveTool(this.toolByName.select);
    }
  }

  handleToolEvent(eventHandler, event) {
    if (this.activeTool && this.activeTool.eventListner) {
      const listner = this.activeTool.eventListner();
      if (listner[eventHandler]) {
        listner[eventHandler](event);
      }
    }
  }

  initEventHandlers() {
    this.documentHandlers = {
      mousedown: (e) => {
        if (this.shown) {
          if (this.colorPicker.handleMouseDown(e) !== true) {
            this.handleToolEvent('handleMouseDown', e);
          }
        }
      },
      mousemove: (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseMove', e);
          this.colorPicker.handleMouseMove(e);
          this.zoomHelper.handleMouseMove(e);
        }
      },
      mouseup: (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseUp', e);
          this.colorPicker.handleMouseUp(e);
        }
      },
      mousewheel: (e) => {
        if (this.shown) {
          if (e.ctrlKey) {
            this.zoom = e.wheelDelta > 0;
            this.adjustSizeFull();
            e.preventDefault();
          }
        }
      },
      keydown: (e) => {
        if (this.shown) {
          const evt = window.event ? event : e;
          if (
            (evt.keyCode === 89 && evt.ctrlKey) || // 89 is 'y' key
            (evt.keyCode === 90 && evt.ctrlKey && evt.shiftKey)) { // 90 is 'z' key
            this.worklog.redoState();
          } else if (evt.keyCode === 90 && evt.ctrlKey) {
            this.worklog.undoState();
          }

          if (this.saveBtn) {
            if (evt.keyCode === 83 && evt.ctrlKey) { // 's' key pressed
              this.save();
              evt.preventDefault();
            }
          }
        }
      },
      paste: (event) => {
        if (this.shown) {
          const items = (event.clipboardData || event.originalEvent.clipboardData).items;
          Object.keys(items).forEach((k) => {
            const item = items[k];
            if (item.kind === 'file' && item.type.split('/')[0] === 'image') {
              this.openFile(item.getAsFile());
            }
          });
        }
      },
      dragover: (event) => {
        if (this.shown) {
          const mainClass = event.target.classList[0];
          if (mainClass === 'ptro-crp-el' || mainClass === 'ptro-bar') {
            this.bar.className = 'ptro-bar ptro-color-main ptro-bar-dragover';
          }
          event.preventDefault();
        }
      },
      dragleave: () => {
        if (this.shown) {
          this.bar.className = 'ptro-bar ptro-color-main';
        }
      },
      drop: (event) => {
        if (this.shown) {
          this.bar.className = 'ptro-bar ptro-color-main';
          event.preventDefault();
          this.openFile(event.dataTransfer.files[0]);
        }
      },
    };

    this.windowHandlers = {
      resize: () => {
        if (this.shown) {
          this.adjustSizeFull();
          this.syncToolElement();
        }
      },
    };

    Object.keys(this.documentHandlers).forEach((key) => {
      document.addEventListener(key, this.documentHandlers[key]);
    });

    Object.keys(this.windowHandlers).forEach((key) => {
      window.addEventListener(key, this.windowHandlers[key]);
    });
  }

  loadImage(source) {
    const img = new Image();
    img.onload = () => {
      this.resize(img.naturalWidth, img.naturalHeight);
      this.ctx.drawImage(img, 0, 0);
      this.adjustSizeFull();
      this.worklog.captureState();
    };
    img.src = source;
  }

  show(openImage) {
    this.shown = true;
    this.baseEl.removeAttribute('hidden');
    if (this.holderEl) {
      this.holderEl.removeAttribute('hidden');
    }
    if (typeof openImage === 'string') {
      this.loadImage(openImage);
    } else if (openImage !== false) {
      this.clear();
    }
    return this;
  }

  hide() {
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
    if (this.size.w > this.wrapper.documentClientWidth ||
        this.size.h > this.wrapper.documentClientHeight) {
      const ratio = this.wrapper.documentClientWidth / this.wrapper.documentClientHeight;

      if (this.zoom === false) {
        const newRelation = ratio < this.size.ratio;
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
        this.wrapper.style.overflow = 'hidden';
        this.wrapper.className = 'ptro-wrapper ptro-v-aligned';
      } else {
        this.wrapper.style.overflow = 'scroll';
        this.canvas.style.width = 'auto';
        this.canvas.style.height = 'auto';
        this.ratioRelation = 0;
        this.wrapper.className = 'ptro-wrapper';
      }
    } else {
      this.wrapper.style.overflow = 'hidden';
      this.canvas.style.width = 'auto';
      this.canvas.style.height = 'auto';
      this.wrapper.className = 'ptro-wrapper ptro-v-aligned';
      this.ratioRelation = 0;
    }
    this.syncToolElement();
    this.select.draw();
  }

  resize(x, y) {
    this.info.innerHTML = `${x} x ${y}`;
    this.size = {
      w: x,
      h: y,
      ratio: x / y,
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
    const w = this.params.defaultSize.width === 'fill' ? this.wrapper.clientWidth : this.params.defaultSize.width;
    const h = this.params.defaultSize.height === 'fill' ? this.wrapper.clientHeight : this.params.defaultSize.height;
    this.resize(w, h);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fill();
    this.worklog.captureState(true);
    this.syncToolElement();
    this.adjustSizeFull();
  }

  setActiveTool(b) {
    this.activeTool = b;
    getBtnEl(b).className += ' ptro-color-active-control';
    let ctrls = '';
    (b.controls || []).forEach((ctl) => {
      ctl.id = genId();
      if (ctl.title) {
        ctrls += `<span class="ptro-tool-ctl-name" title="${tr(ctl.titleFull)}">${tr(ctl.title)}</span>`;
      }
      if (ctl.type === 'btn') {
        ctrls += `<button ${ctl.hint ? `title="${tr(ctl.hint)}"` : ''} class="ptro-color-control ${ctl.icon ? 'ptro-icon-btn' : 'ptro-named-btn'}" ` +
          `id=${ctl.id}>${ctl.icon ? `<i class="ptro-icon ptro-icon-${ctl.icon}"></i>` : ''}` +
          `<p>${ctl.name || ''}</p></button>`;
      } else if (ctl.type === 'color') {
        ctrls += `<button id=${ctl.id} data-id='${ctl.target}' ` +
          `style="background-color: ${this.colorWidgetState[ctl.target].alphaColor}" ` +
          'class="color-diwget-btn ptro-bordered-btn"></button>' +
          '<span class="ptro-btn-color-bg">' +
          '<span></span><span></span><span></span><span></span>' +
          '<span></span><span></span><span></span><span></span>' +
          '</span>' +
          '<span class="color-diwget-btn-substrate"></span>';
      } else if (ctl.type === 'int') {
        ctrls += `<input id=${ctl.id} class="ptro-input" type="number" min="${ctl.min}" max="${ctl.max}" ` +
          `data-id='${ctl.target}'/>`;
      } else if (ctl.type === 'dropdown') {
        let options = '';
        ctl.getAvilableValues().forEach((o) => {
          options += `<option ${ctl.target === 'fontName' ? `style='font-family:${o.value}'` : ''}` +
            ` value='${o.value}'>${o.name}</option>`;
        });
        ctrls += `<select id=${ctl.id} class="ptro-input" ` +
          `data-id='${ctl.target}'>${options}</select>`;
      }
    });
    this.toolControls.innerHTML = ctrls;
    (b.controls || []).forEach((ctl) => {
      if (ctl.type === 'int') {
        document.getElementById(ctl.id).value = ctl.getValue();
        document.getElementById(ctl.id).oninput = ctl.action;
      } else if (ctl.type === 'dropdown') {
        document.getElementById(ctl.id).onchange = ctl.action;
      } else {
        document.getElementById(ctl.id).onclick = ctl.action;
      }
    });
    b.activate();
  }
}

module.exports = params => new PainterroProc(params);
