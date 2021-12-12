import ColorPicker, { HexToRGB, rgbToHex } from './colorPicker';

export default class PaintBucket {
  constructor(main) {
    this.main = main;
    this.canvasWidth = 600;
    this.canvasHeight = 420;
    this.el = this.main.toolContainer;
    this.input = this.el.querySelector('.ptro-text-tool-input');
  }

  init() {
    this.ctx = this.main.ctx;
    this.canvas = this.main.canvas;
    this.colorLayerData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawingAreaX = 0;
    this.drawingAreaY = 0;
    this.canvasWidth = this.canvas.width
    this.canvasHeight = this.canvas.height
    this.drawingAreaWidth = this.canvasWidth;
    this.drawingAreaHeight = this.canvasHeight;
  }

  handleMouseDown(event) {
    const mainClass = event.target.classList[0];
    if (mainClass === 'ptro-crp-el') {
      this.init();
      this.colorLayerData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

      if (!this.active) {
        this.input.innerHTML = '<br>';
        this.pendingClear = true;
      }

      this.active = true;
      const ptX = (event.clientX - this.main.elLeft()) + this.main.scroller.scrollLeft;
      const ptY = (event.clientY - this.main.elTop()) + this.main.scroller.scrollTop;
      this.paintAt(ptX, ptY);
    }
  }

  paintAt(startX, startY) {
    startX = Math.round(startX);
    startY = Math.round(startY - 1);
    startX = (startX > 0) ? startX : 0;
    startY = (startY > 0) ? startY : 0;

    // get clicked on color
    this.getClickedOnColor(startX, startY);

    var pixelPos = (startY * this.canvasWidth + startX) * 4;
    var pixelColor = this.getPixelColor(this.colorLayerData, pixelPos);
    var r = pixelColor.r;
    var g = pixelColor.g;
    var b = pixelColor.b;
    var a = pixelColor.a;

    const curColor = HexToRGB( this.main.colorWidgetState.fill.palleteColor );
    this.color = this.main.colorWidgetState.fill.palleteColor;
    
    if (r === curColor.r && g === curColor.g && b === curColor.b) {
      // Return because trying to fill with the same color
      return;
    }

    this.floodFill(startX, startY, r, g, b);
    this.ctx.putImageData(this.colorLayerData, 0, 0);
    this.main.worklog.captureState();
  }

  // returns true if the current pixel's color matches the clicked on color.
  matchStartColor(pixelPos) {
    var pixelColor = this.getPixelColor(this.colorLayerData, pixelPos);
    var v = this.matchClickedColor(pixelColor.r, pixelColor.g, pixelColor.b, pixelColor.a);
    return v;
  }

  matchClickedColor(r, g, b, a) {
    const limit = this.main.params.bucketSensivity;
    var matchedR = (Math.abs(r - this.clickedOnColor.r) < limit);
    var matchedG = (Math.abs(g - this.clickedOnColor.g) < limit);
    var matchedB = (Math.abs(b - this.clickedOnColor.b) < limit);
    var matchedA = (Math.abs(a - this.clickedOnColor.a) < limit);
    var v = (matchedR && matchedG && matchedB && matchedA);
    return v;
  }

  getClickedOnColor(x, y) {
    var pixelPos = (y * this.canvasWidth + x) * 4;
    var pixelColor = this.getPixelColor(this.colorLayerData, pixelPos);
    this.clickedOnColor = {r: pixelColor.r, g: pixelColor.g, b: pixelColor.b, a: pixelColor.a};
  }

  floodFill(startX, startY, startR, startG, startB) {
    // console.log('flood: ' + startX + ' ' + startY + ' ' + startR + ' ' + startG + ' ' + startB);
    
    var newPos,
      x,
      y,
      pixelPos,
      reachLeft,
      reachRight,
      drawingBoundLeft = this.drawingAreaX,
      drawingBoundTop = this.drawingAreaY,
      drawingBoundRight = this.drawingAreaX + this.drawingAreaWidth - 1,
      drawingBoundBottom = this.drawingAreaY + this.drawingAreaHeight - 1,
      pixelStack = [[startX, startY]];

    while (pixelStack.length) {

      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];

      // Get current pixel position
      pixelPos = (y * this.canvasWidth + x) * 4;
      const curColor = HexToRGB(this.color);


      // Go up as long as the color matches and are inside the canvas
      while (y >= drawingBoundTop && this.matchStartColor(pixelPos)) {
        y -= 1;
        pixelPos -= this.canvasWidth * 4;
      }

      pixelPos += this.canvasWidth * 4;
      y += 1;
      reachLeft = false;
      reachRight = false;

      // Go down as long as the color matches and in inside the canvas
      while (y <= drawingBoundBottom && this.matchStartColor(pixelPos)) {
        y += 1;

        this.colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);

        if (x > drawingBoundLeft) {
          if (this.matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              // Add pixel to stack
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < drawingBoundRight) {
          if (this.matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              // Add pixel to stack
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += this.canvasWidth * 4;
      }
    }    
  }

  colorPixel(pixelPos, r, g, b, a) {
    this.colorLayerData.data[pixelPos] = r;
    this.colorLayerData.data[pixelPos + 1] = g;
    this.colorLayerData.data[pixelPos + 2] = b;
    this.colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
  }

  getPixelColor(ctx, pixelPos) {
    var r = ctx.data[pixelPos];
    var g = ctx.data[pixelPos + 1];
    var b = ctx.data[pixelPos + 2];
    var a = ctx.data[pixelPos + 3];
    return {r: r, g: g, b: b, a: a};
  }
}
