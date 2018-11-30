import { tr } from './translation';
import { genId, KEYS, copyToClipboard, imgToDataURL } from './utils';

let instance = null;
export default class Inserter {
  constructor() {
    this.pasteOptions = {
      fit: {
        handle: (img) => {
          this.main.fitImage(img);
        },
      },
      extend_down: {
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
      extend_right: {
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
      over: {
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
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      this.main.doc.getElementById(o.id).onclick = () => {
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

  loaded(img) {
    this.img = img;
    this.loading = false;
    if (this.doLater) {
      this.doLater(img);
      this.doLater = null;
    }
  }

  handleOpen(src) {
    this.startLoading();
    const handleIt = (source) => {
      const img = new Image();
      const empty = this.main.worklog.clean;
      img.onload = () => {
        if (empty) {
          this.main.fitImage(img);
        } else {
          this.loaded(img);
        }
        this.finishLoading();
      };
      img.src = source;
      if (!empty) {
        if (Object.keys(this.activeOption).length !== 1) {
          this.selector.removeAttribute('hidden');
          this.waitChoice = true;
        } else {
          this.doLater = this.activeOption[Object.keys(this.activeOption)[0]].handle;
        }
      }
    };

    if (src.indexOf('data') !== 0) {
      imgToDataURL(src, (dataUrl) => { // if CORS will not allow,
        // better see error in console than have different canvas mode
        handleIt(dataUrl);
      });
    } else {
      handleIt(src);
    }
  }

  handleKeyDown(evt) {
    if (this.waitChoice && evt.keyCode === KEYS.esc) {
      this.cancelChoosing();
    }
    if (!this.waitChoice && !this.main.select.imagePlaced && this.main.select.shown &&
        evt.keyCode === KEYS.c && (evt.ctrlKey || evt.metaKey)) {
      const a = this.main.select.area;
      const w = a.bottoml[0] - a.topl[0];
      const h = a.bottoml[1] - a.topl[1];
      const tmpCan = this.main.doc.createElement('canvas');
      tmpCan.width = w;
      tmpCan.height = h;
      const tmpCtx = tmpCan.getContext('2d');
      tmpCtx.drawImage(this.main.canvas, -a.topl[0], -a.topl[1]);
      copyToClipboard(this.CLIP_DATA_MARKER);
      try {
        localStorage.setItem(this.CLIP_DATA_MARKER, tmpCan.toDataURL());
      } catch (e) {
        console.error(`Unable save image to localstorage: ${e}`);
      }
    }
  }

  startLoading() {
    this.loading = true;
    const btn = this.main.doc.getElementById(this.main.toolByName.open.buttonId);
    const icon = this.main.doc.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.setAttribute('disabled', 'true');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-loading ptro-spinning';
    }
  }

  finishLoading() {
    const btn = this.main.doc.getElementById(this.main.toolByName.open.buttonId);
    const icon = this.main.doc.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.removeAttribute('disabled');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-open';
    }
  }

  static get() {
    if (instance) {
      return instance;
    }
    instance = new Inserter();
    return instance;
  }

  activeOptions(actOpt) {
    const po = Object.keys(this.pasteOptions);
    po.forEach((i) => {
      let b = false;
      actOpt.forEach((k) => {
        if (i === k) {
          b = true;
        }
      });
      if (b === false) {
        delete this.pasteOptions[i];
      }
    });
    this.activeOption = this.pasteOptions;
  }

  html() {
    let buttons = '';
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      o.id = genId();
      buttons += `<button type="button" id="${o.id}" class="ptro-selector-btn ptro-color-control">` +
        `<div><i class="ptro-icon ptro-icon-paste_${k}"></i></div>` +
        `<div>${tr(`pasteOptions.${k}`)}</div>` +
      '</button>';
    });
    return '<div class="ptro-paster-select-wrapper" hidden><div class="ptro-paster-select ptro-v-middle">' +
      '<div class="ptro-in ptro-v-middle-in">' +
      `<div class="ptro-paste-label">${tr('pasteOptions.how_to_paste')}</div>${
        buttons}</div></div></div>`;
  }
}
export function setActivePasteOptions(a) {
  return Inserter.get().activeOptions(a);
}
