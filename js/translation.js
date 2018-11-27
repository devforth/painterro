import enl from '../langs/en.lang';
import esl from '../langs/es.lang';
import cal from '../langs/ca.lang';

let instance = null;

export default class Translation {
  constructor() {
    this.translations = {
      en: enl,
      es: esl,
      ca: cal,
    };
   this.defaultTranslator = this.translations.en;
   //this.activate('ca');
    
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

    console.log('-------',trans);



    console.log('+++++++',this.translations, this.translations[trans]);
    if (this.translations[trans] !== undefined) {
      this.trans = trans;
      console.log('++++++++',this.translations[trans]);
     // console.log('------');
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

export function activate(a) {
  return Translation.get().activate(a);
}

export function tr(n) {
  return Translation.get().tr(n);
}
