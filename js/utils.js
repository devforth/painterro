export function genId() {
  let text = 'ptro';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function addDocumentObjectHelpers() {
  if (!Object.prototype.hasOwnProperty.call(Element, 'documentOffsetTop')) {
    Object.defineProperty(Element.prototype, 'documentOffsetTop', {
      get() {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop : 0);
      },
    });
  }
  if (!Object.prototype.hasOwnProperty.call(Element, 'documentOffsetLeft')) {
    Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
      get() {
        return this.offsetLeft + (this.offsetParent ? this.offsetParent.documentOffsetLeft : 0);
      },
    });
  }

  if (!Object.prototype.hasOwnProperty.call(Element, 'documentClientWidth')) {
    Object.defineProperty(Element.prototype, 'documentClientWidth', {
      get() {
        return this.getBoundingClientRect().width;
      },
    });
  }

  if (!Object.prototype.hasOwnProperty.call(Element, 'documentClientHeight')) {
    Object.defineProperty(Element.prototype, 'documentClientHeight', {
      get() {
        return this.getBoundingClientRect().height;
      },
    });
  }
}

export function clearSelection() {
  let selection = null;
  if (window.getSelection) {
    selection = window.getSelection();
  } else if (document.selection) {
    selection = document.selection;
  }
  if (selection) {
    if (selection.empty) {
      selection.empty();
    }
    if (selection.removeAllRanges) {
      selection.removeAllRanges();
    }
  }
}

export function distance(p1, p2) {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;
  return Math.sqrt((a * a) + (b * b));
}

export function trim() {
  return String(this).replace(/^\s+|\s+$/g, '');
}
