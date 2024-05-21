
export default class CustomEvents {
  constructor(element) {
    this.element = element;
  }
  createEvent(name, detail) {
    return new CustomEvent(name, { detail });
  }
  dispatchEvent(name, detail) {
    this.element.dispatchEvent(this.createEvent(name, detail));
  }
  addEventListener(name, callback) {
    this.element.addEventListener(name, callback);
  }

  removeEventListener(name, callback) {
    this.element.removeEventListener(name, callback);
  }

  useCustomEvent(name, details) {
    this.dispatchEvent(name, details);
  }



  
}   

