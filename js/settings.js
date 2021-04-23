import { tr } from './translation';
import { trim, KEYS } from './utils';
import { setParam } from './params';

export default class Settings {
  constructor(main) {
    this.main = main;

    this.wrapper = main.wrapper.querySelector('.ptro-settings-widget-wrapper');
    this.inputPixelSize = main.wrapper.querySelector('.ptro-settings-widget-wrapper .ptro-pixel-size-input');

    this.applyButton = main.wrapper.querySelector('.ptro-settings-widget-wrapper button.ptro-apply');
    this.closeButton = main.wrapper.querySelector('.ptro-settings-widget-wrapper button.ptro-close');
    this.clearButton = main.wrapper.querySelector('.ptro-settings-widget-wrapper button.ptro-clear');
    this.bgSelBtn = main.wrapper.querySelector('.ptro-settings-widget-wrapper .ptro-color-btn');
    this.errorHolder = main.wrapper.querySelector('.ptro-settings-widget-wrapper .ptro-error');

    this.clearButton.onclick = () => {
      this.main.currentBackground = this.main.colorWidgetState.bg.alphaColor;
      this.main.currentBackgroundAlpha = this.main.colorWidgetState.bg.alpha;
      this.main.clearBackground();
      this.startClose();
    };

    this.bgSelBtn.onclick = () => {
      this.main.colorPicker.open(this.main.colorWidgetState.bg);
    };

    this.closeButton.onclick = () => {
      this.startClose();
    };

    if (this.applyButton) {
      this.applyButton.onclick = () => {
        let pixelVal = trim(this.inputPixelSize.value);
        let valid;
        if (pixelVal.slice(-1) === '%') {
          const checkInt = trim(pixelVal.slice(0, -1));
          valid = /^\d+$/.test(checkInt) && parseInt(checkInt, 10) !== 0;
          if (valid) {
            pixelVal = `${checkInt}%`;
          }
        } else {
          valid = /^\d+$/.test(pixelVal) && parseInt(pixelVal, 10) !== 0;
        }
        if (valid) {
          this.main.select.pixelizePixelSize = pixelVal;
          setParam('pixelizePixelSize', pixelVal);
          this.startClose();
          this.errorHolder.setAttribute('hidden', '');
        } else {
          this.errorHolder.innerText = tr('wrongPixelSizeValue');
          this.errorHolder.removeAttribute('hidden');
        }
      };
    }
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

  open() {
    this.wrapper.removeAttribute('hidden');
    this.opened = true;
    if (this.inputPixelSize) {
      this.inputPixelSize.value = this.main.select.pixelizePixelSize;
    }
    this.bgSelBtn.style['background-color'] = this.main.colorWidgetState.bg.alphaColor;
  }

  close() {
    this.wrapper.setAttribute('hidden', 'true');
    this.opened = false;
  }

  startClose() {
    this.errorHolder.setAttribute('hidden', '');
    this.main.closeActiveTool();
  }

  /* eslint-disable */
  static html(main) {
    return '' +
      '<div class="ptro-settings-widget-wrapper ptro-common-widget-wrapper ptro-v-middle" hidden>' +
        '<div class="ptro-settings-widget ptro-color-main ptro-v-middle-in">' +
            '<table style="margin-top: 5px">' +
              '<tr>' +
                `<td class="ptro-label ptro-resize-table-left" style="height:30px;">${tr('backgroundColor')}</td>` +
                '<td class="ptro-strict-cell">' +
                  '<button type="button" data-id="bg" class="ptro-color-btn ptro-bordered-btn ptro-color-control" ' +
                    'style="margin-top: -12px;"></button>' +
                  '<span class="ptro-btn-color-checkers"></span>' +
                '</td>' +
                '<td>' +
                  `<button type="button" style="margin-top: -2px;" class="ptro-named-btn ptro-clear ptro-color-control" title="${tr('fillPageWith')}">${tr('clear')}</button>` +
                '</td>' +
              '</tr>' +
              (!main.params.pixelizeHideUserInput ?
                '<tr>' +
                  `<td class="ptro-label ptro-resize-table-left" >${tr('pixelizePixelSize')}</td>` +
                  '<td colspan="2">' +
                    '<input class="ptro-input ptro-pixel-size-input" pattern="[0-9]{1,}%?" type="text" />' +
                  '</td>' +
                '</tr>' : '') +
            '</table>' +
            '<div class="ptro-error" hidden></div>' +
            '<div style="margin-top: 20px">' +
              (!main.params.pixelizeHideUserInput ?
                '<button type="button" class="ptro-named-btn ptro-apply ptro-color-control">' +
                      `${tr('apply')}</button>` +
                `<button type="button" class="ptro-named-btn ptro-close ptro-color-control">${tr('cancel')}</button>`
                :
                `<button type="button" class="ptro-named-btn ptro-close ptro-color-control">${tr('close')}</button>`
              ) +
            '</div>' +
        '</div>' +
      '</div>';
  }
  /* eslint-enable */
}
