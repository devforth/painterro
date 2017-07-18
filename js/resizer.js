import { tr } from './translation';

export default class Resizer {
  constructor(main) {
    this.main = main;

    this.wrapper = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper`);
    this.inputW = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper .ptro-resize-width-input`);
    this.inputH = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper .ptro-resize-heigth-input`);

    this.linkButton = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper button.ptro-link`);
    this.linkButtonIcon = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper button.ptro-link i`);
    this.closeButton = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper button.ptro-close`);
    this.applyButton = document.querySelector(`#${main.id} .ptro-resize-widget-wrapper button.ptro-apply`);

    this.linked = true;
    this.closeButton.onclick = () => {
      this.startClose();
    };

    this.applyButton.onclick = () => {
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

    this.linkButton.onclick = () => {
      this.linked = !this.linked;
      if (this.linked) {
        this.linkButtonIcon.className = 'ptro-icon ptro-icon-linked';
      } else {
        this.linkButtonIcon.className = 'ptro-icon ptro-icon-unlinked';
      }
    };

    this.inputW.oninput = () => {
      this.newW = this.inputW.value;
      if (this.linked) {
        const ratio = this.main.size.ratio;
        this.newH = Math.round(this.newW / ratio);
        this.inputH.value = this.newH;
      }
    };
    this.inputH.oninput = () => {
      this.newH = this.inputH.value;
      if (this.linked) {
        const ratio = this.main.size.ratio;
        this.newW = Math.round(this.newH * ratio);
        this.inputW.value = this.newW;
      }
    };
  }

  open() {
    this.wrapper.removeAttribute('hidden');
    this.opened = true;
    this.newW = this.main.size.w;
    this.newH = this.main.size.h;
    this.inputW.value = this.newW;
    this.inputH.value = this.newH;
  }

  close() {
    this.wrapper.setAttribute('hidden', 'true');
    this.opened = false;
  }

  startClose() {
    this.main.closeActiveTool();
  }

  static html() {
    return '' +
      '<div class="ptro-resize-widget-wrapper" hidden>' +
        '<div class="ptro-resize-widget ptro-color-main">' +
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
            `<button class="ptro-icon-btn ptro-link ptro-color-control" title="${tr('keepRatio')}">` +
              '<i class="ptro-icon ptro-icon-linked"></i>' +
            '</button>' +
          '</div>' +
          '<div>' +
            '<button class="ptro-named-btn ptro-apply ptro-color-control" ' +
                  'style="margin-top: 8px;position: absolute; top: 95px; right: 75px;">' +
                  `${tr('apply')}</button>` +
            '<button class="ptro-named-btn ptro-close ptro-color-control" ' +
                  'style="margin-top: 8px;position: absolute; top: 95px; right: 10px;">' +
                  `${tr('cancel')}</button>` +
          '</div>' +
        '</div>' +
      '</div>';
  }
}
