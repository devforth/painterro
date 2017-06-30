export function genId() {
    let text = 'ptro';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i=0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function addDocumentObjectHelpers() {
  if (!Element.prototype.hasOwnProperty('documentOffsetTop')) {
    Object.defineProperty(Element.prototype, 'documentOffsetTop', {
      get: function () {
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
      }
    });
  }
  if (!Element.prototype.hasOwnProperty('documentOffsetLeft')) {
    Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
      get: function () {
        return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
      }
    });
  }

  if (!Element.prototype.hasOwnProperty('documentClientWidth')) {
    Object.defineProperty(Element.prototype, 'documentClientWidth', {
      get: function () {
        return this.getBoundingClientRect().width;
      }
    });
  }

  if (!Element.prototype.hasOwnProperty('documentClientHeight')) {
    Object.defineProperty(Element.prototype, 'documentClientHeight', {
      get: function () {
        return this.getBoundingClientRect().height;
      }
    });
  }

  if (!String.prototype.hasOwnProperty('ptroTrim')) {
    String.prototype.ptroTrim = function () {
      return String(this).replace(/^\s+|\s+$/g, '');
    };
  }
}

export function clearSelection() {
	let selection = null;
	if(window.getSelection){
		selection = window.getSelection();
	} else if(document.selection){
		selection = document.selection;
	}
	if(selection){
		if(selection.empty){
			selection.empty();
		}
		if(selection.removeAllRanges){
			selection.removeAllRanges();
		}
	}
}

export function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;
  return Math.sqrt( a*a + b*b );
}