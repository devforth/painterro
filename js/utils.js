export function genId() {
  let text = 'ptro';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function addDocumentObjectHelpers() {
  if (!('documentOffsetTop' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'documentOffsetTop', {
      get() {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop : 0);
      },
    });
  }
  if (!('documentOffsetLeft' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
      get() {
        return this.offsetLeft + (this.offsetParent ? this.offsetParent.documentOffsetLeft : 0);
      },
    });
  }

  if (!('documentClientWidth' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'documentClientWidth', {
      get() {
        const rect = this.getBoundingClientRect();
        if (rect.width) {
          // `width` is available for IE9+
          return rect.width;
        }
        // Calculate width for IE8 and below
        return rect.right - rect.left;
      },
    });
  }

  if (!('documentClientHeight' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'documentClientHeight', {
      get() {
        const rect = this.getBoundingClientRect();
        if (rect.height) {
          return rect.height;
        }
        return rect.bottom - rect.top;
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
