export function genId() {
    let text = 'ptro';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i=0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function addDocumentOffset() {
  Object.defineProperty(Element.prototype, 'documentOffsetTop', {
    get: function () {
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
    }
  });

  Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
      get: function () {
          return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
      }
  });
}