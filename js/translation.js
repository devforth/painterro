export class Translation {

  constructor() {
    this.translations = {
      en: {
        lineColor: 'L:',
        lineColorFull: 'Line color',
        fillColor: 'F',
        fillColorFull: 'Fill color'
      }
    };
    this.activate('en');
    this.defaultTranslator = this.translations['en']
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
    if (this.translator[sentense] !== undefined) {
      return this.translator[sentense];
    } else {
      return this.defaultTranslator[sentense];
    }
  }

}