import isMobile from 'ismobilejs';

import '../css/styles.css';
import '../css/bar-styles.css';
import '../css/icons/ptroiconfont.css';

import PainterroSelecter from './selecter';
import WorkLog from './worklog';
import { genId, addDocumentObjectHelpers, KEYS, trim,
  getScrollbarWidth, distance, logError } from './utils';
import PrimitiveTool from './primitive';
import ColorPicker, { HexToRGB, rgbToHex } from './colorPicker';
import { setDefaults, setParam } from './params';
import { tr } from './translation';
import ZoomHelper from './zoomHelper';
import TextTool from './text';
import Resizer from './resizer';
import Inserter from './inserter';
import Settings from './settings';
import ControlBuilder from './controlbuilder';
import PaintBucket from './paintBucket';

class PainterroProc {
  constructor(params) {

    addDocumentObjectHelpers();

    this.getElemByIdSafe = (id) => {
      if (!id) {
        throw new Error(`Can't get element with id=${id}, please create an issue here, we will easily fx it: https://github.com/devforth/painterro/issues/`);
      }
      return document.getElementById(id);
    };

    this.tools = [{
      name: 'select',
      hotkey: 's',
      activate: () => {
        if (this.initText) this.wrapper.click();
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
      hotkey: 'c',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.select.doCrop();
        this.closeActiveTool();
      },
    }, {
      name: 'pixelize',
      hotkey: 'p',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.select.doPixelize();
        this.closeActiveTool();
      },
    }, {
      name: 'line',
      hotkey: 'l',
      controls: [
        () => ({
          type: 'color',
          title: 'lineColor',
          target: 'line',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          },
        }),
        () => this.controlBuilder.buildLineWidthControl(1),
        () => this.controlBuilder.buildShadowOnControl(2),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('line');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'arrow',
      hotkey: 'a',
      controls: [
        () => ({
          type: 'color',
          title: 'lineColor',
          target: 'line',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          },
        }),
        () => this.controlBuilder.buildArrowLengthControl(1),
        () => this.controlBuilder.buildShadowOnControl(2),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('arrow');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'rect',
      controls: [
        () => ({
          type: 'color',
          title: 'lineColor',
          titleFull: 'lineColorFull',
          target: 'line',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          },
        }),
        () => ({
          type: 'color',
          title: 'fillColor',
          titleFull: 'fillColorFull',
          target: 'fill',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.fill);
          },
        }),
        () => this.controlBuilder.buildLineWidthControl(2),
        () => this.controlBuilder.buildShadowOnControl(3),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('rect');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'ellipse',
      controls: [
        () => ({
          type: 'color',
          title: 'lineColor',
          titleFull: 'lineColorFull',
          target: 'line',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          },
        }),
        () => ({
          type: 'color',
          title: 'fillColor',
          titleFull: 'fillColorFull',
          target: 'fill',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.fill);
          },
        }),
        () => this.controlBuilder.buildLineWidthControl(2),
        () => this.controlBuilder.buildShadowOnControl(3),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('ellipse');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'brush',
      hotkey: 'b',
      controls: [
        () => ({
          type: 'color',
          title: 'lineColor',
          target: 'line',
          titleFull: 'lineColorFull',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line);
          },
        }),
        () => this.controlBuilder.buildLineWidthControl(1),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('brush');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'eraser',
      controls: [
        () => this.controlBuilder.buildEraserWidthControl(0),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('eraser');
      },
      eventListner: () => this.primitiveTool,
    }, {
      name: 'text',
      hotkey: 't',
      controls: [
        () => ({
          type: 'color',
          title: 'textColor',
          titleFull: 'textColorFull',
          target: 'line',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.line, (c) => {
              this.textTool.setFontColor(c.alphaColor);
            });
          },
        }),
        () =>this.controlBuilder.buildFontSizeControl(1),
        () => ({
          type: 'dropdown',
          title: 'fontName',
          titleFull: 'fontNameFull',
          target: 'fontName',
          action: () => {
            const dropdown = this.getElemByIdSafe(this.activeTool.controls[2].id);
            const font = dropdown.value;
            this.textTool.setFont(font);
          },
          getValue: () => this.textTool.getFont(),
          getAvailableValues: () => this.textTool.getFonts(),
        }),
        () => ({
          type: 'bool',
          title: 'fontIsBold',
          titleFull: 'fontIsBoldFull',
          target: 'fontIsBold',
          action: () => {
            const btn = this.getElemByIdSafe(this.activeTool.controls[3].id);
            const state = !(btn.getAttribute('data-value') === 'true');
            this.textTool.setFontIsBold(state);
            setParam('defaultFontBold', state);
            btn.setAttribute('data-value', state ? 'true' : 'false'); // invert
          },
          getValue: () => this.textTool.isBold,
        }),
        () => ({
          type: 'bool',
          title: 'fontIsItalic',
          titleFull: 'fontIsItalicFull',
          target: 'fontIsItalic',
          action: () => {
            const btn = this.getElemByIdSafe(this.activeTool.controls[4].id);
            const state = !(btn.getAttribute('data-value') === 'true'); // invert
            this.textTool.setFontIsItalic(state);
            setParam('defaultFontItalic', state);
            btn.setAttribute('data-value', state ? 'true' : 'false');
          },
          getValue: () => this.textTool.isItalic,
        }),
        () => ({
          type: 'bool',
          title: 'fontStrokeAndShadow',
          titleFull: 'fontStrokeAndShadowFull',
          target: 'fontStrokeAndShadow',
          action: () => {
            const btn = this.getElemByIdSafe(this.activeTool.controls[5].id);
            const nextState = !(btn.getAttribute('data-value') === 'true');
            this.textTool.setStrokeOn(nextState);
            setParam('defaultTextStrokeAndShadow', nextState);
            btn.setAttribute('data-value', nextState ? 'true' : 'false');
          },
          getValue: () => this.textTool.strokeOn,
        }),
      ],
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.textTool.setFontColor(this.colorWidgetState.line.alphaColor);
        // this.textTool.setStrokeColor(this.colorWidgetState.stroke.alphaColor);
        this.toolContainer.style.cursor = 'crosshair';
      },
      close: () => {
        this.textTool.close();
      },
      eventListner: () => this.textTool,
    }, {
      name: 'rotate',
      hotkey: 'r',
      activate: () => {
        if (this.initText) {
          this.wrapper.click();
        }
        const w = this.size.w;
        const h = this.size.h;
        const tmpData = this.ctx.getImageData(0, 0, this.size.w, this.size.h);
        const tmpCan = this.doc.createElement('canvas');
        tmpCan.width = w;
        tmpCan.height = h;
        tmpCan.getContext('2d').putImageData(tmpData, 0, 0);
        this.resize(h, w);
        this.ctx.save();
        this.ctx.translate(h / 2, w / 2);
        this.ctx.rotate((90 * Math.PI) / 180);
        this.ctx.drawImage(tmpCan, -w / 2, -h / 2);
        this.adjustSizeFull();
        this.ctx.restore();
        this.worklog.captureState();
        this.closeActiveTool();
      },
    }, {
      name: 'resize',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.resizer.open();
      },
      close: () => {
        this.resizer.close();
      },
      eventListner: () => this.resizer,
    },
    {
      name: 'undo',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.worklog.undoState();
      },
      eventListner: () => this.resizer,
    },
    {
      name: 'redo',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.worklog.redoState();
      },
      eventListner: () => this.resizer,
    },
    {
      name: 'settings',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.settings.open();
      },
      close: () => {
        this.settings.close();
      },
      eventListner: () => this.settings,
    },
    {
      name: 'zoomout',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.zoomButtonActive = true;
        const canvas = this.canvas;
        const gbr = canvas.getBoundingClientRect();
        const e = {
          wheelDelta: -120,
          clientX: gbr.right / 2,
          clientY: gbr.bottom / 2,
        };

        this.curCord = [
          (e.clientX - this.elLeft()) + this.scroller.scrollLeft,
          (e.clientY - this.elTop()) + this.scroller.scrollTop,
        ];

        const scale = this.getScale();
        this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];

        this.zoomImage(e);
      },
    },
    {
      name: 'zoomin',
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.zoomButtonActive = true;
        const canvas = this.canvas;
        const gbr = canvas.getBoundingClientRect();
        const e = {
          wheelDelta: 120,
          clientX: gbr.right / 2,
          clientY: gbr.bottom / 2,
        };

        this.curCord = [
          (e.clientX - this.elLeft()) + this.scroller.scrollLeft,
          (e.clientY - this.elTop()) + this.scroller.scrollTop,
        ];

        const scale = this.getScale();
        this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];

        this.zoomImage(e);
      },
    },

    {
      name: 'bucket',
      hotkey: 'f',
      controls: [
        () => ({
          type: 'color',
          title: 'fillColor',
          target: 'fill',
          titleFull: 'fillColorFull',
          action: () => {
            this.colorPicker.open(this.colorWidgetState.fill);
          },
        }),
      ],
      activate: () => {
        // this.clear();
        // this.closeActiveTool();
        this.toolContainer.style.cursor = 'crosshair';
        this.primitiveTool.activate('bucket');
      },
      eventListner: () => this.paintBucket,
    },

    {
      name: 'clear',
      activate: () => {
        this.clear();
        this.closeActiveTool();
      },
    },

    {
      name: 'save',
      right: true,
      hotkey: () => this.params.saveByEnter ? 'enter' : false,
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.save();
        this.closeActiveTool();
      },
    }, {
      name: 'open',
      right: true,
      activate: () => {
        if (this.initText) this.wrapper.click();
        this.closeActiveTool();
        const input = this.getElemByIdSafe(this.fileInputId);
        input.onchange = (event) => {
          const files = event.target.files || event.dataTransfer.files;
          if (!files.length) {
            return;
          }
          this.openFile(files[0]);
          input.value = ''; // to allow reopen
        };
        input.click();
      },
    }, {
      name: 'close',
      hotkey: () => this.params.hideByEsc ? 'esc' : false,
      right: true,
      activate: () => {
        if (this.initText) this.wrapper.click();
        const doClose = () => {
          this.closeActiveTool();
          this.close();
          this.hide();
        };

        if (this.params.onBeforeClose) {
          this.params.onBeforeClose(this.hasUnsaved, doClose);
        } else {
          doClose();
        }
      },
    }];

    this.params = setDefaults(params, this.tools.map(t => t.name));    
    
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
      bg: {
        target: 'bg',
        palleteColor: this.params.backgroundFillColor,
        alpha: this.params.backgroundFillColorAlpha,
        alphaColor: this.params.backgroundFillAlphaColor,
      },
      // stroke: {
      //   target: 'stroke',
      //   palleteColor: this.params.textStrokeColor,
      //   alpha: this.params.textStrokeColorAlpha,
      //   alphaColor: this.params.textStrokeAlphaColor,
      // },
    };
    this.currentBackground = this.colorWidgetState.bg.alphaColor;
    this.currentBackgroundAlpha = this.colorWidgetState.bg.alpha;


    this.controlBuilder = new ControlBuilder(this);

    this.isMobile = isMobile.any;
    this.toolByName = {};
    this.toolByKeyCode = {};
    this.tools.forEach((t) => {
      if (t.controls) {
        t.controls = t.controls.map(t => t());
      }
      this.toolByName[t.name] = t;
      if (t.hotkey instanceof Function) {
        t.hotkey = t.hotkey();
      }

      if (t.hotkey && !this.params.hiddenTools.includes(t.name)) {
        if (!KEYS[t.hotkey]) {
          throw new Error(`Key code for ${t.hotkey} not defined in KEYS`);
        }
        this.toolByKeyCode[KEYS[t.hotkey]] = t;
      }
    });
    this.activeTool = undefined;
    this.zoom = false;
    this.ratioRelation = undefined;
    this.id = this.params.id;
    this.saving = false;

    if (this.id === undefined) {
      this.id = genId();
      this.holderId = genId();
      this.holderEl = document.createElement('div');
      this.holderEl.id = this.holderId;
      this.holderEl.className = 'ptro-holder-wrapper';
      document.body.appendChild(this.holderEl);
      this.holderEl.innerHTML = `<div id='${this.id}' class="ptro-holder"></div>`;
      this.baseEl = this.getElemByIdSafe(this.id);
    } else {
      this.baseEl = this.getElemByIdSafe(this.id);
      this.holderEl = null;
    }
    let bar = '';
    let rightBar = '';
    this.tools.filter(t => !this.params.hiddenTools.includes(t.name)).forEach((b) => {
      const id = genId();
      b.buttonId = id;
      const hotkey = b.hotkey ? ` [${b.hotkey.toUpperCase()}]` : '';
      const btn = `<button type="button" class="ptro-icon-btn ptro-color-control" title="${tr(`tools.${b.name}`)}${hotkey}" ` +
        `id="${id}" >` +
        `<i class="ptro-icon ptro-icon-${b.name}"></i></button>`;
      if (b.right) {
        rightBar += btn;
      } else {
        bar += btn;
      }
    });

    this.inserter = Inserter.get(this);

    const cropper = '<div class="ptro-crp-el">' +
      `${PainterroSelecter.code()}${TextTool.code()}</div>`;

    this.loadedName = '';
    this.doc = document;
    this.wrapper = this.doc.createElement('div');
    this.wrapper.id = `${this.id}-wrapper`;
    this.wrapper.className = 'ptro-wrapper';
    this.wrapper.innerHTML =
      '<div class="ptro-scroller">' +
        '<div class="ptro-center-table">' +
          '<div class="ptro-center-tablecell">' +
            `<canvas id="${this.id}-canvas"></canvas>` +
            `<div class="ptro-substrate"></div>${cropper}` +
          '</div>' +
        '</div>' +
      `</div>${
        ColorPicker.html() +
        ZoomHelper.html() +
        Resizer.html() +
        Settings.html(this) +
        this.inserter.html()}`;
    this.baseEl.appendChild(this.wrapper);
    this.scroller = this.doc.querySelector(`#${this.id}-wrapper .ptro-scroller`);
    this.bar = this.doc.createElement('div');
    this.bar.id = `${this.id}-bar`;
    this.bar.className = 'ptro-bar ptro-color-main';
    this.fileInputId = genId();
    this.bar.innerHTML =
      `<div>${bar}` +
      '<span class="ptro-tool-controls"></span>' +
      '<span class="ptro-info"></span>' +
      `<span class="ptro-bar-right">${rightBar}</span>` +
      `<input id="${this.fileInputId}" type="file" style="display: none" value="none" accept="image/x-png,image/png,image/gif,image/jpeg" /></div>`;
    if (this.isMobile) {
      this.bar.style['overflow-x'] = 'auto';
    }

    this.baseEl.appendChild(this.bar);
    const style = this.doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = this.params.styles;
    this.baseEl.appendChild(style);

    // this.baseEl.innerHTML = '<iframe class="ptro-iframe"></iframe>';
    // this.iframe = this.baseEl.getElementsByTagName('iframe')[0];
    // this.doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
    // this.doc.body.innerHTML = html;
    this.saveBtn = this.baseEl.querySelector(`#${this.toolByName.save.buttonId}`);
    if (this.toolByName.save.buttonId && this.saveBtn) {
      this.saveBtn.setAttribute('disabled', 'true');
    }
    this.body = this.doc.body;
    this.info = this.doc.querySelector(`#${this.id}-bar .ptro-info`);
    this.canvas = this.doc.querySelector(`#${this.id}-canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.toolControls = this.doc.querySelector(`#${this.id}-bar .ptro-tool-controls`);
    this.toolContainer = this.doc.querySelector(`#${this.id}-wrapper .ptro-crp-el`);
    this.substrate = this.doc.querySelector(`#${this.id}-wrapper .ptro-substrate`);
    this.zoomHelper = new ZoomHelper(this);
    this.zoomButtonActive = false;
    this.select = new PainterroSelecter(this, (notEmpty) => {
      [this.toolByName.crop, this.toolByName.pixelize].forEach((c) => {
        this.setToolEnabled(c, notEmpty);
      });
    });
    if (this.params.backplateImgUrl) {
      this.tabelCell = this.canvas.parentElement;
      this.tabelCell.style.backgroundImage = `url(${this.params.backplateImgUrl})`;
      this.tabelCell.style.backgroundRepeat = 'no-repeat';
      this.tabelCell.style.backgroundPosition = 'center center';
      const img = new Image();
      img.onload = () => {
        this.resize(img.naturalWidth, img.naturalHeight);
        this.adjustSizeFull();
        this.worklog.captureState();
        this.tabelCell.style.backgroundSize = `${window.getComputedStyle(this.substrate).width} ${window.getComputedStyle(this.substrate).height}`;
      };
      img.src = this.params.backplateImgUrl;
    }
    this.resizer = new Resizer(this);
    this.settings = new Settings(this);
    this.primitiveTool = new PrimitiveTool(this);
    this.primitiveTool.setShadowOn(this.params.defaultPrimitiveShadowOn);
    this.primitiveTool.setLineWidth(this.params.defaultLineWidth);
    this.primitiveTool.setArrowLength(this.params.defaultArrowLength);
    this.primitiveTool.setEraserWidth(this.params.defaultEraserWidth);
    this.primitiveTool.setPixelSize(this.params.defaultPixelSize);
    this.hasUnsaved = false;
    this.worklog = new WorkLog(this, (state) => {
      if (this.saveBtn && !state.initial) {
        this.saveBtn.removeAttribute('disabled');
        this.hasUnsaved = true;
      }
      this.setToolEnabled(this.toolByName.undo, !state.first);
      this.setToolEnabled(this.toolByName.redo, !state.last);
      if (this.params.onChange) {
        this.params.onChange.call(this, {
          image: this.imageSaver,
          operationsDone: this.worklog.current.prevCount,
          realesedMemoryOperations: this.worklog.clearedCount,
        });
      }
    });
    this.inserter.init(this);
    this.paintBucket = new PaintBucket(this);
    this.textTool = new TextTool(this);
    this.colorPicker = new ColorPicker(this, (widgetState) => {
      this.colorWidgetState[widgetState.target] = widgetState;
      this.doc.querySelector(
        `#${this.id} .ptro-color-btn[data-id='${widgetState.target}']`).style['background-color'] =
        widgetState.alphaColor;
      const palletRGB = HexToRGB(widgetState.palleteColor);
      if (palletRGB !== undefined) {
        widgetState.palleteColor = rgbToHex(palletRGB.r, palletRGB.g, palletRGB.b);
        if (widgetState.target === 'line') {
          setParam('activeColor', widgetState.palleteColor);
          setParam('activeColorAlpha', widgetState.alpha);
        } else if (widgetState.target === 'fill') {
          setParam('activeFillColor', widgetState.palleteColor);
          setParam('activeFillColorAlpha', widgetState.alpha);
        } else if (widgetState.target === 'bg') {
          setParam('backgroundFillColor', widgetState.palleteColor);
          setParam('backgroundFillColorAlpha', widgetState.alpha);
        } else if (widgetState.target === 'stroke') {
          setParam('textStrokeColor', widgetState.palleteColor);
          setParam('textStrokeColorAlpha', widgetState.alpha);
        }
      }
    });

    this.defaultTool = this.toolByName[this.params.defaultTool];

    this.tools.filter(t => this.params.hiddenTools.indexOf(t.name) === -1).forEach((b) => {
      this.getBtnEl(b).onclick = () => {
        if (b === this.defaultTool && this.activeTool === b) {
          return;
        }
        const currentActive = this.activeTool;
        this.closeActiveTool(true);
        if (currentActive !== b) {
          this.setActiveTool(b);
        } else {
          this.setActiveTool(this.defaultTool);
        }
      };
      this.getBtnEl(b).ontouch = this.getBtnEl(b).onclick;
    });

    this.getBtnEl(this.defaultTool).click();

    this.imageSaver = {
      /**
       * Returns image as base64 data url
       * @param {string} type - type of data url, default image/png
       * @param {string} quality - number from 0 to 1, works for `image/jpeg` or `image/webp`
       */
      asDataURL: (type, quality) => {
        let realType = type;
        if (realType === undefined) {
          if (this.loadedImageType) {
            realType = this.loadedImageType;
          } else {
            realType = 'image/png';
          }
        }
        return this.getAsUri(realType, quality);
      },
      asBlob: (type, quality) => {
        let realType = type;
        if (realType === undefined) {
          if (this.loadedImageType) {
            realType = this.loadedImageType;
          } else {
            realType = 'image/png';
          }
        }
        const uri = this.getAsUri(realType, quality);
        const byteString = atob(uri.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i += 1) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {
          type: realType,
        });
      },
      getOriginalMimeType: () => this.loadedImageType,
      hasAlphaChannel: () => {
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        for (let i = 3, n = data.length; i < n; i += 4) {
          if (data[i] < 255) {
            return true;
          }
        }
        return false;
      },
      suggestedFileName: (type) => {
        let realType = type;
        if (realType === undefined) {
          realType = 'png';
        }
        return `${(this.loadedName || `image-${genId()}`)}.${realType}`;
      },
      getWidth: () => this.size.w,
      getHeight: () => this.size.h,
    };

    this.initEventHandlers();
    this.hide();
    this.zoomFactor = 1;
  }

  setToolEnabled(tool, state) {
    if (tool.buttonId) {
      const btn = this.getElemByIdSafe(tool.buttonId);
      if (state) {
        btn.removeAttribute('disabled');
      } else {
        btn.setAttribute('disabled', 'true');
      }
    }
  }
  getAsUri(type, quality) {
    let realQuality = quality;
    if (realQuality === undefined) {
      realQuality = 0.92;
    }
    return this.canvas.toDataURL(type, realQuality);
  }

  getBtnEl(tool) {
    return this.getElemByIdSafe(tool.buttonId);
  }

  save() {
    if (this.saving) {
      return this;
    }
    this.saving = true;
    const btn = this.baseEl.querySelector(`#${this.toolByName.save.buttonId}`);
    const icon = this.baseEl.querySelector(`#${this.toolByName.save.buttonId} > i`);
    if (this.toolByName.save.buttonId && btn) {
      btn.setAttribute('disabled', 'true');
    }
    this.hasUnsaved = false;

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
      logError('No saveHandler defined, please check documentation');
      if (icon) {
        icon.className = 'ptro-icon ptro-icon-save';
      }
      this.saving = false;
    }
    return this;
  }

  close() {
    if (this.params.onClose !== undefined) {
      this.params.onClose();
    }
  }

  closeActiveTool(doNotSelect) {
    if (this.activeTool !== undefined) {
      if (this.activeTool.close !== undefined) {
        this.activeTool.close();
      }
      this.toolControls.innerHTML = '';
      const btnEl = this.getBtnEl(this.activeTool);
      if (btnEl) {
        btnEl.className =
        this.getBtnEl(this.activeTool).className.replace(' ptro-color-active-control', '');
      }
      this.activeTool = undefined;
    }
    if (doNotSelect !== true) {
      this.setActiveTool(this.defaultTool);
    }
  }

  handleToolEvent(eventHandler, event) {
    if (this.select.imagePlaced || this.select.area.activated) {
      return this.select[eventHandler](event);
    }
    if (this.activeTool && this.activeTool.eventListner) {
      const listner = this.activeTool.eventListner();
      if (listner[eventHandler]) {
        return listner[eventHandler](event);
      }
    }
    
    return false;
  }

  handleClipCopyEvent(evt) {
    let handled = false;
    const clipFormat = 'image/png';
    if (evt.keyCode === KEYS.c && (evt.ctrlKey || evt.metaKey)) {
      console.log('handing copy')
      if (!this.inserter.waitChoice && !this.select.imagePlaced && this.select.shown) {
        const a = this.select.area;
        const w = a.bottoml[0] - a.topl[0];
        const h = a.bottoml[1] - a.topl[1];
        const tmpCan = this.doc.createElement('canvas');
        tmpCan.width = w;
        tmpCan.height = h;
        const tmpCtx = tmpCan.getContext('2d');
        tmpCtx.drawImage(this.canvas, -a.topl[0], -a.topl[1]);
        tmpCan.toBlob((b) => {
          /* eslint no-undef: "off" */
          navigator.clipboard.write([new ClipboardItem({ [clipFormat]: b })]);
        }, clipFormat, 1.0);
        handled = true;
      } else {
        this.canvas.toBlob((b) => {
          /* eslint no-undef: "off" */
          navigator.clipboard.write([new ClipboardItem({ [clipFormat]: b })]);
        }, clipFormat, 1.0);
        handled = true;
      }
    }
    return handled;
  }
  zoomImage({ wheelDelta, clientX, clientY }, forceWheenDelta) {
    let whD = wheelDelta;
    if (forceWheenDelta !== undefined) {
      whD = 1;
    }
    let minFactor = 1;
    if (this.size.w > this.wrapper.documentClientWidth) {
      minFactor = Math.min(minFactor, this.wrapper.documentClientWidth / this.size.w);
    }
    if (this.size.h > this.wrapper.documentClientHeight) {
      minFactor = Math.min(minFactor, this.wrapper.documentClientHeight / this.size.h);
    }
    if (!this.zoom && this.zoomFactor > minFactor) {
      this.zoomFactor = minFactor;
    }
    this.zoomFactor += Math.sign(whD) * 0.2;
    if (this.zoomFactor < minFactor) {
      this.zoom = false;
      this.zoomFactor = minFactor;
    } else {
      this.zoom = true;
    }
    this.adjustSizeFull();
    this.select.adjustPosition();
    if (this.zoom) {
      this.scroller.scrollLeft = (this.curCord[0] / this.getScale()) -
        (clientX - this.wrapper.documentOffsetLeft);
      this.scroller.scrollTop = (this.curCord[1] / this.getScale()) -
        (clientY - this.wrapper.documentOffsetTop);
    }
  }
  initEventHandlers() {
    this.documentHandlers = {
      mousedown: (e) => {
        if (this.shown) {
          if (this.worklog.empty &&
             (e.target.className.indexOf('ptro-crp-el') !== -1 ||
              e.target.className.indexOf('ptro-icon') !== -1 ||
              e.target.className.indexOf('ptro-named-btn') !== -1)) {
            this.clearBackground(); // clear initText
          }
          if (this.colorPicker.handleMouseDown(e) !== true) {
            this.handleToolEvent('handleMouseDown', e);
          }
        }
      },
      touchstart: (e) => {
        if (e.touches.length === 1) {
          e.clientX = e.changedTouches[0].clientX;
          e.clientY = e.changedTouches[0].clientY;
          this.documentHandlers.mousedown(e);
        } else if (e.touches.length === 2) {
          const fingersDist = distance({
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
          }, {
            x: e.changedTouches[1].clientX,
            y: e.changedTouches[1].clientY,
          });
          this.lastFingerDist = fingersDist;
        }
      },
      touchend: (e) => {
        e.clientX = e.changedTouches[0].clientX;
        e.clientY = e.changedTouches[0].clientY;
        this.documentHandlers.mouseup(e);
      },
      touchmove: (e) => {
        if (e.touches.length === 1) {
          e.clientX = e.changedTouches[0].clientX;
          e.clientY = e.changedTouches[0].clientY;
          this.documentHandlers.mousemove(e);
        } else if (e.touches.length === 2) {
          const fingersDist = distance({
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
          }, {
            x: e.changedTouches[1].clientX,
            y: e.changedTouches[1].clientY,
          });

          if (fingersDist > this.lastFingerDist) {
            this.documentHandlers.wheel(e, 1, true);
          } else if (fingersDist < this.lastFingerDist) {
            this.documentHandlers.wheel(e, 1, true);
          }
          this.lastFingerDist = fingersDist;
          e.stopPropagation();
          if (!this.zoomButtonActive) e.preventDefault();
        }
      },
      mousemove: (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseMove', e);
          this.colorPicker.handleMouseMove(e);
          this.zoomHelper.handleMouseMove(e);
          this.curCord = [
            (e.clientX - this.elLeft()) + this.scroller.scrollLeft,
            (e.clientY - this.elTop()) + this.scroller.scrollTop,
          ];
          const scale = this.getScale();
          this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];
          if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'button'
        && e.target.tagName.toLowerCase() !== 'i' && e.target.tagName.toLowerCase() !== 'select') {
            if (!this.zoomButtonActive) e.preventDefault();
          }
        }
      },
      mouseup: (e) => {
        if (this.shown) {
          this.handleToolEvent('handleMouseUp', e);
          this.colorPicker.handleMouseUp(e);
        }
      },
      wheel: (e, forceWheenDelta, forceCtrlKey) => {
        if (this.shown) {
          if (forceCtrlKey !== undefined ? forceCtrlKey : e.ctrlKey) {
            this.zoomImage(e, forceWheenDelta);
            e.preventDefault();
          }
        }
      },
      keydown: (e) => {
        console.log('event.target !== document.body', event.target, document.body);
        const argetEl = event.target;
        const ignoreForSelectors = ['input', 'textarea', 'div[contenteditable]'];

        if (ignoreForSelectors.some(selector => argetEl.matches(selector))) {
          return; // ignore all elemetents which could be focused
        }
        if (this.shown) {
          if (this.colorPicker.handleKeyDown(e)) {
            return;
          }
          if (this.handleClipCopyEvent(e)) {
            return;
          }
          const evt = window.event ? event : e;
          if (this.handleToolEvent('handleKeyDown', evt)) {
            return;
          }
          if (
            (evt.keyCode === KEYS.y && evt.ctrlKey) ||
            (evt.keyCode === KEYS.z && evt.ctrlKey && evt.shiftKey)) {
            this.worklog.redoState();
            e.preventDefault();
            if (this.params.userRedo) {
              this.params.userRedo.call();
            }
          } else if (evt.keyCode === KEYS.z && evt.ctrlKey) {
            this.worklog.undoState();
            e.preventDefault();
            if (this.params.userUndo) {
              this.params.userUndo.call();
            }
          }
          if (this.toolByKeyCode[event.keyCode]) {
            this.getBtnEl(this.toolByKeyCode[event.keyCode]).click();
            e.stopPropagation();
            e.preventDefault();
          }
          if (this.saveBtn) {
            if (evt.keyCode === KEYS.s && evt.ctrlKey) {
              if (this.initText) this.wrapper.click();
              this.save();
              evt.preventDefault();
            }
          }
        }
      },
      paste: (event) => {
        if (this.initText) this.wrapper.click();
        if (this.shown) {
          const items = (event.clipboardData || event.originalEvent.clipboardData).items;
          Object.keys(items).forEach((k) => {
            const item = items[k];
            if (item.kind === 'file' && item.type.split('/')[0] === 'image') {
              this.openFile(item.getAsFile());
              event.preventDefault();
              event.stopPropagation();
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
          const file = event.dataTransfer.files[0];
          if (file) {
            this.openFile(file);
          } else {
            const text = event.dataTransfer.getData('text/html');
            const srcRe = /src.*?=['"](.+?)['"]/;
            const srcMatch = srcRe.exec(text);
            this.inserter.handleOpen(srcMatch[1]);
          }
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
    this.listenersInstalled = false;
  }

  attachEventHandlers() {
    if (this.listenersInstalled) {
      return;
    }
    // passive: false fixes Unable to preventDefault inside passive event
    // listener due to target being treated as passive
    Object.keys(this.documentHandlers).forEach((key) => {
      this.doc.addEventListener(key, this.documentHandlers[key], { passive: false });
    });

    Object.keys(this.windowHandlers).forEach((key) => {
      window.addEventListener(key, this.windowHandlers[key], { passive: false });
    });
    this.listenersInstalled = true;
  }

  removeEventHandlers() {
    if (!this.listenersInstalled) {
      return;
    }
    Object.keys(this.documentHandlers).forEach((key) => {
      this.doc.removeEventListener(key, this.documentHandlers[key]);
    });
    Object.keys(this.windowHandlers).forEach((key) => {
      window.removeEventListener(key, this.windowHandlers[key]);
    });

    this.listenersInstalled = false;
  }

  elLeft() {
    return this.toolContainer.documentOffsetLeft + this.scroller.scrollLeft;
  }

  elTop() {
    return this.toolContainer.documentOffsetTop + this.scroller.scrollTop;
  }

  fitImage(img, mimetype) {
    this.loadedImageType = mimetype;
    this.resize(img.naturalWidth, img.naturalHeight);
    this.ctx.drawImage(img, 0, 0);
    this.zoomFactor = (this.wrapper.documentClientHeight / this.size.h) - 0.2;
    this.adjustSizeFull();
    this.worklog.captureState();
  }

  loadImage(source, mimetype) {
    this.inserter.handleOpen(source, mimetype);
  }

  show(openImage, originalMime) {
    this.shown = true;
    this.scrollWidth = getScrollbarWidth();
    if (this.isMobile) {
      this.origOverflowY = this.body.style['overflow-y'];
      if (this.params.fixMobilePageReloader) {
        this.body.style['overflow-y'] = 'hidden';
      }
    }
    this.baseEl.removeAttribute('hidden');
    if (this.holderEl) {
      this.holderEl.removeAttribute('hidden');
    }
    if (typeof openImage === 'string') {
      this.loadedName = trim(
        (openImage.substring(openImage.lastIndexOf('/') + 1) || '').replace(/\..+$/, ''));

      this.loadImage(openImage, originalMime);
    } else if (openImage !== false) {
      this.clear();
    }
    this.attachEventHandlers();
    return this;
  }

  hide() {
    if (this.isMobile) {
      this.body.style['overflow-y'] = this.origOverflowY;
    }
    this.shown = false;
    this.baseEl.setAttribute('hidden', '');
    if (this.holderEl) {
      this.holderEl.setAttribute('hidden', '');
    }
    this.removeEventHandlers();
    if (this.params.onHide !== undefined) {
      this.params.onHide();
    }
    return this;
  }

  doScale({width, height, scale}) {
    if (scale) {
      if (width || height) {
        throw new Error(`You can't pass width or height and scale at the same time`)
      }
      this.resizer.newW = Math.round(this.size.w * scale);
      this.resizer.newH = Math.round(this.size.h * scale);

    } else {
      if (scale) {
        throw new Error(`You can't pass width or height and scale at the same time`)
      }
      this.resizer.newW = width || Math.round(this.size.w * (height / this.size.h));
      this.resizer.newH = height || Math.round(this.size.h * (width / this.size.w));
    }
    this.resizer.scaleButton.onclick();
  }

  openFile(f) {
    if (!f) {
      return;
    }
    this.loadedName = trim((f.name || '').replace(/\..+$/, ''));
    const dataUrl = (window.URL ? window.URL : window.webkitURL).createObjectURL(f);
    this.loadImage(dataUrl, f.type);
  }

  getScale() {
    return this.canvas.getAttribute('width') / this.canvas.offsetWidth;
  }

  adjustSizeFull() {
    const ratio = this.wrapper.documentClientWidth / this.wrapper.documentClientHeight;
    if (this.zoom === false) {
      if (this.size.w > this.wrapper.documentClientWidth ||
        this.size.h > this.wrapper.documentClientHeight) {
        const newRelation = ratio < this.size.ratio;
        this.ratioRelation = newRelation;
        if (newRelation) {
          this.canvas.style.width = `${this.wrapper.clientWidth}px`;
          this.canvas.style.height = 'auto';
        } else {
          this.canvas.style.width = 'auto';
          this.canvas.style.height = `${this.wrapper.clientHeight}px`;
        }
        this.scroller.style.overflow = 'hidden';
      } else {
        this.scroller.style.overflow = 'hidden';
        this.canvas.style.width = 'auto';
        this.canvas.style.height = 'auto';
        this.ratioRelation = 0;
      }
    } else {
      this.scroller.style.overflow = 'scroll';
      this.canvas.style.width = `${this.size.w * this.zoomFactor}px`;
      this.canvas.style.height = `${this.size.h * this.zoomFactor}px`;
      this.ratioRelation = 0;
    }
    this.syncToolElement();
    this.select.draw();
  }

  resize(x, y) {
    this.info.innerHTML = `${x}<span>x</span>${y}<br>${(this.originalMime || 'png').replace('image/', '')}`;
    this.size = {
      w: x,
      h: y,
      ratio: x / y,
    };
    this.canvas.setAttribute('width', this.size.w);
    this.canvas.setAttribute('height', this.size.h);
  }

  syncToolElement() {
    const w = Math.round(this.canvas.documentClientWidth);
    const l = this.canvas.offsetLeft;
    const h = Math.round(this.canvas.documentClientHeight);
    const t = this.canvas.offsetTop;
    this.toolContainer.style.left = `${l}px`;
    this.toolContainer.style.width = `${w}px`;
    this.toolContainer.style.top = `${t}px`;
    this.toolContainer.style.height = `${h}px`;
    this.substrate.style.left = `${l}px`;
    this.substrate.style.width = `${w}px`;
    this.substrate.style.top = `${t}px`;
    this.substrate.style.height = `${h}px`;
  }

  clear() {
    const w = this.params.defaultSize.width === 'fill' ? this.wrapper.clientWidth : this.params.defaultSize.width;
    const h = this.params.defaultSize.height === 'fill' ? this.wrapper.clientHeight : this.params.defaultSize.height;
    this.resize(w, h);
    this.clearBackground();
    this.worklog.captureState(true);
    this.worklog.clean = true;
    this.syncToolElement();
    this.adjustSizeFull();

    if (this.params.initText && this.worklog.empty) {
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#fff';
      const initTexts = this.wrapper.querySelectorAll('.init-text');
      if (initTexts.length > 0) {
        initTexts.forEach((text) => {
          text.remove();
        });
      }
      this.initText = document.createElement('div');
      this.initText.classList.add('init-text');
      this.wrapper.append(this.initText);
      this.initText.innerHTML = '<div style="pointer-events: none;position:absolute;top:50%;width:100%;left: 50%; transform: translate(-50%, -50%)">' +
        `${this.params.initText}</div>`;
      this.initText.style.left = '0';
      this.initText.style.top = '0';
      this.initText.style.right = '0';
      this.initText.style.bottom = '0';
      this.initText.style.pointerEvents = 'none';
      this.initText.style['text-align'] = 'center';
      this.initText.style.position = 'absolute';
      this.initText.style.color = this.params.initTextColor;
      this.initText.style['font-family'] = this.params.initTextStyle.split(/ (.+)/)[1];
      this.initText.style['font-size'] = this.params.initTextStyle.split(/ (.+)/)[0];

      this.wrapper.addEventListener('click', () => {
        this.initText.remove();
        this.initText = null;
      }, { once: true });
    }
  }

  clearBackground() {
    this.ctx.beginPath();
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.ctx.rect(0, 0, this.size.w, this.size.h);
    this.ctx.fillStyle = this.currentBackground;
    this.ctx.fill();
  }

  setActiveTool(b) {
    this.activeTool = b;
    
    this.zoomButtonActive = false;
    const btnEl = this.getBtnEl(this.activeTool);
    if (btnEl) {
      btnEl.className += ' ptro-color-active-control';
    }
    let ctrls = '';
    (b.controls || []).forEach((ctl) => {
      ctl.id = genId();
      if (ctl.title) {
        ctrls += `<span class="ptro-tool-ctl-name" title="${tr(ctl.titleFull)}">${tr(ctl.title)}</span>`;
      }
      if (ctl.type === 'btn') {
        ctrls += `<button type="button" ${ctl.hint ? `title="${tr(ctl.hint)}"` : ''} class="ptro-color-control ${ctl.icon ? 'ptro-icon-btn' : 'ptro-named-btn'}" ` +
          `id=${ctl.id}>${ctl.icon ? `<i class="ptro-icon ptro-icon-${ctl.icon}"></i>` : ''}` +
          `<p>${ctl.name || ''}</p></button>`;
      } else if (ctl.type === 'color') {
        ctrls += `<button type="button" id=${ctl.id} data-id='${ctl.target}' ` +
          `style="background-color: ${this.colorWidgetState[ctl.target].alphaColor}" ` +
          'class="color-diwget-btn ptro-color-btn ptro-bordered-btn ptro-color-control"></button>' +
          '<span class="ptro-btn-color-checkers-bar"></span>';
      } else if (ctl.type === 'int') {
        ctrls += `<input id=${ctl.id} class="ptro-input" type="number" min="${ctl.min}" max="${ctl.max}" ` +
          `data-id='${ctl.target}'/>`;
      } else if (ctl.type === 'bool') {
        ctrls += `<button id=${ctl.id} class="ptro-input ptro-check" data-value="false" type="button" ` +
          `data-id='${ctl.target}'></button>`;
      } else if (ctl.type === 'dropdown') {
        let options = '';
        ctl.getAvailableValues().forEach((o) => {
          options += `<option ${o.extraStyle ? `style='${o.extraStyle}'` : ''}` +
            ` value='${o.value}' ${o.title ? `title='${o.title}'` : ''}>${o.name}</option>`;
        });
        ctrls += `<select id=${ctl.id} class="ptro-input" ` +
          `data-id='${ctl.target}'>${options}</select>`;
      }
    });
    this.toolControls.innerHTML = ctrls;
    (b.controls || []).forEach((ctl) => {
      if (ctl.type === 'int') {
        this.getElemByIdSafe(ctl.id).value = ctl.getValue();
        this.getElemByIdSafe(ctl.id).oninput = ctl.action;
      } else if (ctl.type === 'bool') {
        this.getElemByIdSafe(ctl.id).setAttribute('data-value', ctl.getValue() ? 'true' : 'false');
        this.getElemByIdSafe(ctl.id).onclick = ctl.action;
      } else if (ctl.type === 'dropdown') {
        this.getElemByIdSafe(ctl.id).onchange = ctl.action;
        this.getElemByIdSafe(ctl.id).value = ctl.getValue();
      } else {
        this.getElemByIdSafe(ctl.id).onclick = ctl.action;
      }
    });
    b.activate();
  }
}

export default params => new PainterroProc(params);
