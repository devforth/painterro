import { tr } from './translation';
import { KEYS } from './utils';

export default class Resizer {
  constructor(main) {
    this.main = main;

    this.wrapper = main.wrapper.querySelector('.ptro-resize-widget-wrapper');
    this.inputW = main.wrapper.querySelector('.ptro-resize-widget-wrapper .ptro-resize-width-input');
    this.inputH = main.wrapper.querySelector('.ptro-resize-widget-wrapper .ptro-resize-heigth-input');

    this.inputWLimit = 10000;
    this.inputHLimit = 13000;

    this.linkButton = main.wrapper.querySelector('.ptro-resize-widget-wrapper button.ptro-link');
    this.linkButtonIcon = main.wrapper.querySelector('.ptro-resize-widget-wrapper button.ptro-link i');
    this.closeButton = main.wrapper.querySelector('.ptro-resize-widget-wrapper button.ptro-close');
    this.scaleButton = main.wrapper.querySelector('.ptro-resize-widget-wrapper button.ptro-scale');
    this.resizeButton = main.wrapper.querySelector('.ptro-resize-widget-wrapper button.ptro-resize');
    this.linked = true;
    this.closeButton.onclick = () => {
      this.startClose();
    };

    this.scaleButton.onclick = () => {
      if (!Resizer.validationZeroValue(this.newH, this.newW)) return;
      const origW = this.main.size.w;
      const origH = this.main.size.h;

      const tmpData = this.main.canvas.toDataURL();

      this.main.resize(this.newW, this.newH);

      this.main.ctx.save();
      // this.ctx.translate(h / 2, w / 2);
      this.main.ctx.scale(this.newW / origW, this.newH / origH);
      const img = new Image();
      img.onload = () => {
        this.main.ctx.drawImage(img, 0, 0);
        this.main.adjustSizeFull();
        this.main.ctx.restore();
        this.main.worklog.captureState();
        this.startClose();
      };
      img.src = tmpData;
    };

    this.resizeButton.onclick = () => {
      if (!Resizer.validationZeroValue(this.newH, this.newW)) return;
      const tmpData = this.main.canvas.toDataURL();
      this.main.resize(this.newW, this.newH);
      this.main.clearBackground();
      const img = new Image();
      img.onload = () => {
        this.main.ctx.drawImage(img, 0, 0);
        this.main.adjustSizeFull();
        this.main.worklog.captureState();
        this.startClose();
      };
      img.src = tmpData;
    };

    this.linkButton.onclick = () => {
      this.linked = !this.linked;
      if (this.linked) {
        this.linkButtonIcon.className = 'ptro-icon ptro-icon-linked';
      } else {
        this.linkButtonIcon.className = 'ptro-icon ptro-icon-unlinked';
      }
    };

    this.inputW.oninput = () => {
      const widthVal = Number(this.inputW.value);
      this.validationWidth(widthVal);
      if (this.linked) {
        const ratio = this.main.size.ratio;
        this.newH = Math.round(this.newW / ratio);
        this.validationHeight(this.newH);
        this.inputH.value = this.newH;
      }
    };
    this.inputH.oninput = () => {
      const heightVal = Number(this.inputH.value);
      this.validationHeight(heightVal);
      if (this.linked) {
        const ratio = this.main.size.ratio;
        this.newW = Math.round(this.newH * ratio);
        this.validationWidth(this.newW);
        this.inputW.value = +this.newW;
      }
    };
  }

  validationWidthValue(value) {
    return value <= this.inputWLimit;
  }

  validationHeightValue(value) {
    return value <= this.inputHLimit;
  }

  static validationEmptyValue(value) {
    return value !== '' || value !== '0';
  }

  static validationZeroValue(...args) {
    let isValid = true;
    args.forEach((v) => {
      isValid = !(v === 0) && isValid;
    });
    return isValid;
  }

  validationHeight(value) {
    if (this.validationHeightValue(value)) {
      this.newH = value;
    } else {
      this.inputH.value = this.inputHLimit;
      this.newH = this.inputHLimit;
      return;
    }

    if (Resizer.validationEmptyValue(value)) {
      this.newH = value;
    } else {
      this.inputH.value = 0;
      this.newH = 0;
    }
  }

  validationWidth(value) {
    if (this.validationWidthValue(value)) {
      this.newW = value;
    } else {
      this.inputW.value = this.inputWLimit;
      this.newW = this.inputWLimit;
      return;
    }

    if (Resizer.validationEmptyValue(value)) {
      this.newW = value;
    } else {
      this.inputW.value = '0';
      this.newW = 0;
    }
  }

  open() {
    this.wrapper.removeAttribute('hidden');
    this.opened = true;
    this.newW = this.main.size.w;
    this.newH = this.main.size.h;
    this.inputW.value = +this.newW;
    this.inputH.value = +this.newH;
  }

  close() {
    this.wrapper.setAttribute('hidden', 'true');
    this.opened = false;
  }

  startClose() {
    this.main.closeActiveTool();
  }

  handleKeyDown(event) {
    if (event.keyCode === KEYS.enter) {
      return true; // mark as handled - user might expect doing save by enter
    }
    if (event.keyCode === KEYS.esc) {
      this.startClose();
      return true;
    }
    return false;
  }

  static html() {
    return '' +
      '<div class="ptro-resize-widget-wrapper ptro-common-widget-wrapper ptro-v-middle" hidden>' +
        '<div class="ptro-resize-widget ptro-color-main ptro-v-middle-in">' +
          '<div style="display: inline-block">' +
            '<table>' +
              '<tr>' +
                `<td class="ptro-label ptro-resize-table-left">${tr('width')}</td>` +
                '<td>' +
                  '<input class="ptro-input ptro-resize-width-input" type="number" min="0" max="3000" step="1"/>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                `<td class="ptro-label ptro-resize-table-left">${tr('height')}</td>` +
                '<td>' +
                  '<input class="ptro-input ptro-resize-heigth-input" type="number" min="0" max="3000" step="1"/>' +
                '</td>' +
              '</tr>' +
            '</table>' +
          '</div>' +
          '<div class="ptro-resize-link-wrapper">' +
            `<button type="button" class="ptro-icon-btn ptro-link ptro-color-control" title="${tr('keepRatio')}">` +
              '<i class="ptro-icon ptro-icon-linked" style="font-size: 18px;"></i>' +
            '</button>' +
          '</div>' +
          '<div></div>' +
          '<div style="margin-top: 40px;">' +
            '<button type="button" class="ptro-named-btn ptro-resize ptro-color-control">' +
                  `${tr('resizeResize')}</button>` +
            '<button type="button" class="ptro-named-btn ptro-scale ptro-color-control">' +
                  `${tr('resizeScale')}</button>` +
            '<button type="button" class="ptro-named-btn ptro-close ptro-color-control">' +
                  `${tr('cancel')}</button>` +
          '</div>' +
        '</div>' +
      '</div>';
  }
}
