import { tr } from './translation';
import { genId } from './utils';

export default class Inserter {
  constructor() {
    this.pasteOptions = {
      fit: {
        handle: (img) => {
          this.main.fitImage(img);
        },
      },
      extend_down: {},
      extend_right: {},
      over: {},
    };
  }

  init(main) {
    this.ctx = main.ctx;
    this.main = main;
    this.el = main.toolContainer;
    this.selector = this.el.querySelector('.ptro-paster-select');
    this.img = null;
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      document.getElementById(o.id).onclick = () => {
        if (this.loading) {
          this.doLater = o.handle;
        } else {
          o.handle(this.img);
        }
        this.selector.style.display = 'none';
      };
    });
    this.loading = false;
    this.doLater = null;
  }

  loaded(img) {
    this.img = img;
    this.loading = false;
    if (this.doLater) {
      this.doLater(img);
      this.doLater = null;
    }
  }

  handleOpen(source) {
    const img = new Image();
    const empty = this.main.worklog.empty;
    img.onload = () => {
      if (empty) {
        this.main.fitImage(img);
      } else {
        this.loaded(img);
      }
      this.finishLoading();
    };
    this.startLoading();
    img.src = source;
    if (!empty) {
      this.selector.style.display = 'inline-block';
    }
  }

  startLoading() {
    this.loading = true;
    const btn = document.getElementById(this.main.toolByName.open.buttonId);
    const icon = document.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.setAttribute('disabled', 'true');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-loading ptro-spinning';
    }
  }

  finishLoading() {
    const btn = document.getElementById(this.main.toolByName.open.buttonId);
    const icon = document.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.removeAttribute('disabled');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-open';
    }
  }

  code() {
    let buttons = '';
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      o.id = genId();
      buttons += `<button id="${o.id}" class="ptro-selector-btn ptro-color-control">` +
        `<div><i class="ptro-icon ptro-icon-paste_${k}"></i></div>` +
        `<div>${tr(`pasteOptions.${k}`)}</div>` +
      '</button>';
    });
    return `<div class="ptro-paster-select" style="display: none"><div class="ptro-in">${
      buttons
    }</div></div>`;
  }
}
