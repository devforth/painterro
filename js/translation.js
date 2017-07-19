
let instance = null;

export class Translation {
  constructor() {
    this.translations = {
      en: {
        lineColor: 'L:',
        lineColorFull: 'Line color',
        fillColor: 'F:',
        fillColorFull: 'Fill color',
        alpha: 'A:',
        alphaFull: 'Alpha',
        lineWidth: 'W:',
        lineWidthFull: 'Line width',
        textColor: 'C:',
        textColorFull: 'Text color',
        fontSize: 'S:',
        fontSizeFull: 'Font Size',
        fontName: 'F:',
        fontNameFull: 'Font name',
        apply: 'Apply',
        cancel: 'Cancel',
        close: 'Close',
        width: 'Width',
        height: 'Height',
        keepRatio: 'Keep width/height ratio',
        pixelSize: 'P:',
        pixelSizeFull: 'Pixel Size',
        tools: {
          crop: 'Crop image to selected area',
          pixelize: 'Pixelize selected area',
          rect: 'Draw rectangle',
          ellipse: 'Draw ellipse',
          line: 'Draw line',
          rotate: 'Rotate image',
          save: 'Save Image',
          load: 'Load image',
          text: 'Put text',
          brush: 'Brush',
          resize: 'Resize image',
          open: 'Open image',
          select: 'Select area',
        },
        pasteOptions: {
          fit: 'Replace all',
          extend_down: 'Extend down',
          extend_right: 'Extend right',
          over: 'Paste over',
          how_to_paste: 'How to paste?',
        },
      },
    };
    this.activate('en');
    this.defaultTranslator = this.translations.en;
  }

  static get() {
    if (instance) {
      return instance;
    }
    instance = new Translation();
    return instance;
  }

  addTranslation(name, dict) {
    this.translations[name] = dict;
  }

  activate(trans) {
    if (this.translations[trans] !== undefined) {
      this.trans = trans;
      this.translator = this.translations[this.trans];
    } else {
      this.translator = this.defaultTranslator;
    }
  }

  tr(sentense) {
    const levels = sentense.split('.');
    let res = this.translator;
    let fallbackRes = this.defaultTranslator;
    levels.forEach((l) => {
      fallbackRes = fallbackRes[l];
      if (res !== undefined) {
        res = res[l];
      }
    });
    return res || fallbackRes;
  }
}

export function tr(n) {
  return Translation.get().tr(n);
}
