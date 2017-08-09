import { distance } from './utils';

export default class PrimitiveTool {
  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.helperCanvas = document.createElement('canvas');
    this.canvas = main.canvas;
  }

  activate(type) {
    this.type = type;
    this.state = {};
    if (type === 'line' || type === 'brush' || type === 'eraser') {
      this.ctx.lineJoin = 'round';
    } else {
      this.ctx.lineJoin = 'miter';
    }
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  setEraserWidth(width) {
    this.eraserWidth = width;
  }

  handleMouseDown(event) {
    this.activate(this.type);
    const mainClass = event.target.classList[0];
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.main.colorWidgetState.line.alphaColor;
    this.ctx.fillStyle = this.main.colorWidgetState.fill.alphaColor;
    const scale = this.main.getScale();
    this.ctx.lineCap = 'round';
    if (mainClass === 'ptro-crp-el' || mainClass === 'ptro-zoomer') {
      this.tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
      if (this.type === 'brush' || this.type === 'eraser') {
        this.state.cornerMarked = true;
        const cord = [
          (event.clientX - this.el.documentOffsetLeft) + this.main.wrapper.scrollLeft,
          (event.clientY - this.el.documentOffsetTop) + this.main.wrapper.scrollTop,
        ];
        const cur = {
          x: cord[0] * scale,
          y: cord[1] * scale,
        };

        this.points = [cur];
        this.drawBrushPath();
      } else {
        this.state.cornerMarked = true;
        this.centerCord = [
          (event.clientX - this.el.documentOffsetLeft) + this.main.wrapper.scrollLeft,
          (event.clientY - this.el.documentOffsetTop) + this.main.wrapper.scrollTop,
        ];
        this.centerCord = [this.centerCord[0] * scale, this.centerCord[1] * scale];
      }
    }
  }

  drawBrushPath() {
    const smPoints = this.points;
    let lineFill;
    const origComposition = this.ctx.globalCompositeOperation;
    const isEraser = this.type === 'eraser';
    lineFill = this.main.colorWidgetState.line.alphaColor;
    for (let i = 1; i < (isEraser ? 3 : 2); i += 1) {
      if (isEraser) {
        this.ctx.globalCompositeOperation = i === 1 ? 'destination-out' : origComposition;
        lineFill = i === 1 ? 'rgba(0,0,0,1)' : this.main.currentBackground;
      }
      if (smPoints.length === 1) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 0;
        this.ctx.fillStyle = lineFill;
        this.ctx.arc(
          this.points[0].x, this.points[0].y,
          this.lineWidth / 2, this.lineWidth / 2,
          0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
      } else {
        this.ctx.beginPath();
        if (this.type === 'eraser') {
          this.ctx.lineWidth = this.eraserWidth;
        } else {
          this.ctx.lineWidth = this.lineWidth;
        }
        this.ctx.strokeStyle = lineFill;
        this.ctx.fillStyle = this.main.colorWidgetState.fill.alphaColor;

        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        let last;
        smPoints.slice(1).forEach((p) => {
          this.ctx.lineTo(p.x, p.y);
          last = p;
        });
        if (last) {
          this.ctx.moveTo(last.x, last.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
    this.ctx.globalCompositeOperation = origComposition;
  }

  handleMouseMove(event) {
    if (this.state.cornerMarked) {
      this.ctx.putImageData(this.tmpData, 0, 0);

      this.curCord = [
        (event.clientX - this.el.documentOffsetLeft) + this.main.wrapper.scrollLeft,
        (event.clientY - this.el.documentOffsetTop) + this.main.wrapper.scrollTop,
      ];
      const scale = this.main.getScale();
      this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];

      if (this.type === 'brush' || this.type === 'eraser') {
        const prevLast = this.points.slice(-1)[0];
        const cur = {
          x: this.curCord[0],
          y: this.curCord[1],
        };

        if (distance(prevLast, cur) > 5) {
          this.points.push(cur);
        }
        this.drawBrushPath();
      } else if (this.type === 'line') {
        if (event.ctrlKey || event.shiftKey) {
          const deg = (Math.atan(
            -(this.curCord[1] - this.centerCord[1]) / (this.curCord[0] - this.centerCord[0]),
          ) * 180) / Math.PI;
          if (Math.abs(deg) < 45.0 / 2) {
            this.curCord[1] = this.centerCord[1];
          } else if (Math.abs(deg) > (45 + 45.0) / 2) {
            this.curCord[0] = this.centerCord[0];
          } else {
            const base = (Math.abs(this.curCord[0] - this.centerCord[0])
              - Math.abs(this.centerCord[1] - this.curCord[1])) / 2;

            this.curCord[0] -= base * (this.centerCord[0] < this.curCord[0] ? 1 : -1);
            this.curCord[1] -= base * (this.centerCord[1] > this.curCord[1] ? 1 : -1);
          }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerCord[0], this.centerCord[1]);
        this.ctx.lineTo(this.curCord[0], this.curCord[1]);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (this.type === 'rect') {
        this.ctx.beginPath();

        const tl = [
          Math.min(this.curCord[0], this.centerCord[0]),
          Math.min(this.curCord[1], this.centerCord[1])];

        let w = Math.abs(this.curCord[0] - this.centerCord[0]);
        let h = Math.abs(this.curCord[1] - this.centerCord[1]);

        if (event.ctrlKey || event.shiftKey) {
          const min = Math.min(Math.abs(w), Math.abs(h));
          w = min * Math.sign(w);
          h = min * Math.sign(h);
        }
        const halfLW = Math.floor(this.lineWidth / 2);
        const oddCorrecter = this.lineWidth % 2;
        this.ctx.rect(
          tl[0] + halfLW, tl[1] + halfLW,
          (w - this.lineWidth) + oddCorrecter, (h - this.lineWidth) + oddCorrecter);
        this.ctx.fill();
        this.ctx.strokeRect(tl[0], tl[1], w, h);
        this.ctx.closePath();
      } else if (this.type === 'ellipse') {
        this.ctx.beginPath();
        const x1 = this.centerCord[0];
        const y1 = this.centerCord[1];
        let w = this.curCord[0] - x1;
        let h = this.curCord[1] - y1;

        if (event.ctrlKey || event.shiftKey) {
          const min = Math.min(Math.abs(w), Math.abs(h));
          w = min * Math.sign(w);
          h = min * Math.sign(h);
        }

        const rX = Math.abs(w);
        const rY = Math.abs(h);

        const tlX = Math.min(x1, x1 + w);
        const tlY = Math.min(y1, y1 + h);

        this.ctx.save();
        let xScale = 1;
        let yScale = 1;
        let radius;
        const hR = rX / 2;
        const vR = rY / 2;
        if (rX > rY) {
          yScale = rX / rY;
          radius = hR;
        } else {
          xScale = rY / rX;
          radius = vR;
        }
        this.ctx.scale(1 / xScale, 1 / yScale);
        this.ctx.arc(
          (tlX + hR) * xScale,
          (tlY + vR) * yScale,
          radius, 0, 2 * Math.PI);
        this.ctx.restore();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
      }
    }
  }

  handleMouseUp() {
    if (this.state.cornerMarked) {
      this.state.cornerMarked = false;
      this.main.worklog.captureState();
    }
  }

  setPixelSize(size) {
    this.pixelSize = size;
  }
}
