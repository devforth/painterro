import { tr } from './translation';
import { genId, KEYS, imgToDataURL } from './utils';

export default class Inserter {
  constructor(main) {
    this.main = main;
    const extendObj = {
      extend_top: {
        internalName: 'extend_top',
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          const newH = oldH + img.naturalHeight;
          const newW = Math.max(oldW, img.naturalWidth);
          const tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
          this.main.resize(newW, newH);
          this.main.clearBackground();
          this.ctx.putImageData(tmpData, 0, img.naturalHeight);
          this.main.adjustSizeFull();
          if (img.naturalWidth < oldW) {
            const offset = Math.round((oldW - img.naturalWidth) / 2);
            this.main.select.placeAt(offset, 0, offset, oldH, img);
          } else {
            this.main.select.placeAt(0, 0, 0, oldH, img);
          }
          this.worklog.captureState();
        },
      },
      extend_left: {
        internalName: 'extend_left',
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          const newW = oldW + img.naturalWidth;
          const newH = Math.max(oldH, img.naturalHeight);
          const tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
          this.main.resize(newW, newH);
          this.main.clearBackground();
          this.ctx.putImageData(tmpData, img.naturalWidth, 0);
          this.main.adjustSizeFull();
          if (img.naturalHeight < oldH) {
            const offset = Math.round((oldH - img.naturalHeight) / 2);
            this.main.select.placeAt(0, offset, oldW, offset, img);
          } else {
            this.main.select.placeAt(0, 0, oldW, 0, img);
          }
          this.worklog.captureState();
        },
      },
      extend_right: {
        internalName: 'extend_right',
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          const newW = oldW + img.naturalWidth;
          const newH = Math.max(oldH, img.naturalHeight);
          const tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
          this.main.resize(newW, newH);
          this.main.clearBackground();
          this.ctx.putImageData(tmpData, 0, 0);
          this.main.adjustSizeFull();
          if (img.naturalHeight < oldH) {
            const offset = Math.round((oldH - img.naturalHeight) / 2);
            this.main.select.placeAt(oldW, offset, 0, offset, img);
          } else {
            this.main.select.placeAt(oldW, 0, 0, 0, img);
          }
          this.worklog.captureState();
        },
      },
      extend_down: {
        internalName: 'extend_down',
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          const newH = oldH + img.naturalHeight;
          const newW = Math.max(oldW, img.naturalWidth);
          const tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
          this.main.resize(newW, newH);
          this.main.clearBackground();
          this.ctx.putImageData(tmpData, 0, 0);
          this.main.adjustSizeFull();
          if (img.naturalWidth < oldW) {
            const offset = Math.round((oldW - img.naturalWidth) / 2);
            this.main.select.placeAt(offset, oldH, offset, 0, img);
          } else {
            this.main.select.placeAt(0, oldH, 0, 0, img);
          }
          this.worklog.captureState();
        },
      },
    };
    const fitObj = {
      replace_all: {
        internalName: 'fit',
        handle: (img) => {
          if (this.main.params.backplateImgUrl) {
            this.main.params.backplateImgUrl = undefined;
            this.main.tabelCell.style.background = '';
            this.main.canvas.style.backgroundColor = `${this.main.params.backgroundFillColor}ff`;
            this.pasteOptions = Object.assign({}, fitObj, extendObj);
            this.activeOption = this.pasteOptions;
            this.main.wrapper.querySelector('.ptro-paster-select-wrapper').remove();
            this.main.wrapper.insertAdjacentHTML('beforeend', this.html());
            this.init(main);
          }
          this.main.fitImage(img, this.mimetype);
        },
      },
      paste_over: {
        internalName: 'over',
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          if (img.naturalHeight <= oldH && img.naturalWidth <= oldW) {
            this.main.select.placeAt(
              0, 0,
              oldW - img.naturalWidth,
              oldH - img.naturalHeight, img);
          } else if (img.naturalWidth / img.naturalHeight > oldW / oldH) {
            const newH = oldW * (img.naturalHeight / img.naturalWidth);
            this.main.select.placeAt(0, 0, 0, oldH - newH, img);
          } else {
            const newW = oldH * (img.naturalWidth / img.naturalHeight);
            this.main.select.placeAt(0, 0, oldW - newW, 0, img);
          }
          this.worklog.captureState();
        },
      },
    };
    if (this.main.params.backplateImgUrl) {
      this.pasteOptions = Object.assign({}, fitObj);
      this.activeOption = this.pasteOptions;
      return;
    }
    this.pasteOptions = Object.assign({}, fitObj, extendObj);
    this.activeOption = this.pasteOptions;
  }

  init(main) {
    this.CLIP_DATA_MARKER = 'painterro-image-data';
    this.ctx = main.ctx;
    this.main = main;
    this.worklog = main.worklog;
    this.selector = main.wrapper.querySelector('.ptro-paster-select-wrapper');
    this.cancelChoosing();
    this.img = null;
    this.mimetype = null; // mime of pending image
    this.getAvailableOptions().forEach((k) => {
      const o = this.pasteOptions[k];
      this.main.getElemByIdSafe(o.id).onclick = () => {
        if (this.loading) {
          this.doLater = o.handle;
        } else {
          o.handle(this.img);
        }
        this.cancelChoosing();
      };
    });
    this.loading = false;
    this.doLater = null;
  }

  insert(x, y, w, h) {
    this.main.ctx.drawImage(this.tmpImg, x, y, w, h);
    this.main.worklog.reCaptureState();
  }

  cancelChoosing() {
    this.selector.setAttribute('hidden', '');
    this.waitChoice = false;
  }

  loaded(img, mimetype) {
    this.img = img;
    this.mimetype = mimetype;
    this.loading = false;
    if (this.doLater) {
      this.doLater(img);
      this.doLater = null;
    }
  }

  getAvailableOptions() {
    if (this.main.params.how_to_paste_actions) {
      // filter out only to selected
      return Object.keys(this.activeOption).filter(
        actionName => this.main.params.how_to_paste_actions.includes(actionName),
      );
    }
    return Object.keys(this.activeOption);
  }

  handleOpen(src, mimetype) {
    this.startLoading();
    const handleIt = (source) => {
      const img = new Image();
      const empty = this.main.worklog.clean;
      const replaceAllImmediately = empty && this.main.params.replaceAllOnEmptyBackground;
      img.onload = () => {
        if (replaceAllImmediately) {
          this.main.fitImage(img, mimetype);
        } else {
          this.loaded(img, mimetype);
        }
        this.finishLoading();
      };
      img.onerror = () => {
        if (typeof this.main.params.onImageFailedOpen === 'function') {
          this.main.params.onImageFailedOpen();
        }
      };
      // img.crossOrigin = '*'; TODO: try to identify CORS issues earlier?
      img.src = source;
      if (!replaceAllImmediately) {
        const availableOptions = this.getAvailableOptions();
        if (availableOptions.length !== 1) {
          this.selector.removeAttribute('hidden');
          this.waitChoice = true;
        } else {
          this.doLater = this.activeOption[availableOptions[0]].handle;
        }
      }
    };

    if (src.indexOf('data') !== 0) {
      imgToDataURL(src, (dataUrl) => { // if CORS will not allow,
        // better see error in console than have different canvas mode
        handleIt(dataUrl);
      }, () => {
        if (typeof this.main.params.onImageFailedOpen === 'function') {
          this.main.params.onImageFailedOpen();
        }
      });
    } else {
      handleIt(src);
    }
  }

  handleKeyDown(evt) {
    if (this.waitChoice && evt.keyCode === KEYS.esc) {
      this.cancelChoosing();
      return true;
    }
    if (this.waitChoice && event.keyCode === KEYS.enter) {
      return true; // mark as handled - user might expect doing save by enter
    }
    return false;
  }

  startLoading() {
    this.loading = true;
    if (this.main.toolByName.open.buttonId) {
      const btn = this.main.getElemByIdSafe(this.main.toolByName.open.buttonId);
      if (btn) {
        btn.setAttribute('disabled', 'true');
      }
      const icon = this.main.doc.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
      if (icon) {
        icon.className = 'ptro-icon ptro-icon-loading ptro-spinning';
      }
    }
  }

  finishLoading() {
    if (this.main.toolByName.open.buttonId) {
      const btn = this.main.getElemByIdSafe(this.main.toolByName.open.buttonId);
      if (btn) {
        btn.removeAttribute('disabled');
      }
      const icon = this.main.doc.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
      if (icon) {
        icon.className = 'ptro-icon ptro-icon-open';
      }
    }
    if (this.main.params.onImageLoaded) {
      this.main.params.onImageLoaded();
    }
  }

  static get(main) {
    if (main.inserter) {
      return main.inserter;
    }
    main.inserter = new Inserter(main);
    return main.inserter;
  }

  static controlObjToString(o, btnClassName = '') {
    const tempObj = o;
    tempObj.id = genId();
    return `<button type="button" id="${o.id}" class="ptro-selector-btn ptro-color-control ${btnClassName}">` +
    `<div><i class="ptro-icon ptro-icon-paste_${o.internalName}"></i></div>` +
    `<div>${tr(`pasteOptions.${o.internalName}`)}</div>` +
    '</button>';
  }

  html() {
    const bcklOptions = this.main.params.backplateImgUrl;
    let fitControls = '';
    let extendControls = '';
    this.getAvailableOptions().forEach((k) => {
      if (k === 'replace_all' || k === 'paste_over') {
        fitControls += `<div class="ptro-paster-fit">
          ${Inserter.controlObjToString(this.pasteOptions[k], 'ptro-selector-fit')}
        <div class="ptro-paster-wrapper-label">
          ${tr(`pasteOptions.${this.pasteOptions[k].internalName}`)}
        </div></div>`;
      } else {
        extendControls += Inserter.controlObjToString(this.pasteOptions[k], 'ptro-selector-extend');
      }
    });
    return '<div class="ptro-paster-select-wrapper" hidden><div class="ptro-paster-select ptro-v-middle">' +
      '<div class="ptro-in ptro-v-middle-in">' +
      ` <div class="ptro-paster-wrappers-fits">
        ${fitControls}
        ${bcklOptions || !extendControls ? '' : `
          <div class="ptro-paster-select-wrapper-extends">
            <div class="ptro-paster-extends-items">
              ${extendControls}
            </div>
            <div class="ptro-paster-wrapper-label">${tr('pasteOptions.extend')}</div>
          </div>`}
        </div>
      </div></div></div>`;
  }
}

