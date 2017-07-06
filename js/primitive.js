import {distance} from "./utils";
export class PrimitiveTool {

  constructor (main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.helperCanvas = document.createElement('canvas');
    this.canvas = main.canvas;
  }

  activate(type) {
    this.type = type;
    this.state = {};
    if (type === 'line' || type === 'brush') {
      this.ctx.lineJoin = 'round';
    } else {
      this.ctx.lineJoin = 'miter';
    }
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  handleMouseDown(event) {
    this.activate(this.type)
    const mainClass = event.target.classList[0];
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.main.colorWidgetState.line.alphaColor;
    this.ctx.fillStyle =  this.main.colorWidgetState.fill.alphaColor;
    const scale = this.main.getScale();
    this.ctx.lineCap = "round";
    if (mainClass === 'ptro-crp-el' || mainClass === 'ptro-zoomer') {
      this.tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
      if (this.type === 'brush') {
        this.state.cornerMarked = true;
        const cord = [
          event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
          event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop,
        ];
        const cur = {
          x: cord[0] * scale,
          y: cord[1] * scale
        };

        this.points = [cur];
        this.drawBrushPath()

      } else {
        this.state.cornerMarked = true;
        this.centerCord = [
          event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
          event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop,
        ];
        this.centerCord = [this.centerCord[0] * scale, this.centerCord[1] * scale];
      }
    }
  }

  drawBrushPath () {
    const smPoints = this.points;

    if (smPoints.length === 1) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 0;
      this.ctx.fillStyle =  this.main.colorWidgetState.line.alphaColor;
      this.ctx.ellipse(
          this.points[0].x, this.points[0].y,
          this.lineWidth / 2, this.lineWidth / 2,
          0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.closePath();
    } else {
      this.ctx.beginPath();
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.main.colorWidgetState.line.alphaColor;
      this.ctx.fillStyle = this.main.colorWidgetState.fill.alphaColor;

      this.ctx.moveTo(this.points[0].x, this.points[0].y);
      let last;
      for (let p of smPoints.slice(1)) {
        this.ctx.lineTo(p.x, p.y);
        last = p;
      }
      if (last) {
        this.ctx.moveTo(last.x, last.y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  handleMouseMove(event) {
    if (this.state.cornerMarked) {
      this.ctx.putImageData(this.tmpData, 0, 0);

      this.curCord = [
        event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
        event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop,
      ];
      const scale = this.main.getScale();
      this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];

      if (this.type === 'brush') {
        let prevLast = this.points.slice(-1)[0];
        const cur = {
          x: this.curCord[0],
          y: this.curCord[1]
        };

        if (distance(prevLast, cur) > 5) {
          this.points.push(cur);
        }
        this.drawBrushPath();
      } else if (this.type === 'line') {
        if (event.ctrlKey || event.shiftKey) {
          const deg = Math.atan(
              -(this.curCord[1] - this.centerCord[1]) / (this.curCord[0] - this.centerCord[0])
            ) * 180 / Math.PI;
          if (Math.abs(deg) < 45.0 / 2) {
            this.curCord[1] = this.centerCord[1];
          } else if (Math.abs(deg) > 45 + 45.0 / 2) {
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
      } else if (this.type == 'rect') {
        this.ctx.beginPath();

        let w = this.curCord[0] - this.centerCord[0];
        let h = this.curCord[1] - this.centerCord[1];

        if (event.ctrlKey || event.shiftKey) {
          const min = Math.min(Math.abs(w), Math.abs(h));
          w = min * Math.sign(w);
          h = min * Math.sign(h);
        }
        this.ctx.rect(this.centerCord[0], this.centerCord[1], w, h);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (this.type == 'pixelize') {
        const c = [
          Math.min(this.centerCord[0], this.curCord[0]),
          Math.min(this.centerCord[1], this.curCord[1])
        ];
        const size = [
          Math.abs(this.curCord[0] - this.centerCord[0]),
          Math.abs(this.curCord[1] - this.centerCord[1])
        ];

        let pxData = [];
        const pxSize = [size[0] / this.pixelSize, size[1] / this.pixelSize];
        for (let i = 0; i < pxSize[0]; i++) {
          let row = [];
          for (let j = 0; j < pxSize[1]; j++) {
            row.push([0,0,0,0,0])
          }
          pxData.push(row);
        }
        for (let i = 0; i < size[0]; i++) {
          for (let j = 0; j < size[1]; j++) {
            const d = this.ctx.getImageData(
              c[0] + i, c[1] + j, 1, 1);
            const ii = Math.floor(i / this.pixelSize);
            const jj = Math.floor(j / this.pixelSize);
            pxData[ii][jj][0] += d.data[0];
            pxData[ii][jj][1] += d.data[1];
            pxData[ii][jj][2] += d.data[2];
            pxData[ii][jj][3] += d.data[3];
            pxData[ii][jj][4] += 1;
          }
        }

        let d = new ImageData(1, 1);
        for (let i = 0; i < pxSize[0]; i++) {
          for (let j = 0; j < pxSize[1]; j++) {
            const s = pxData[i][j][4];
            d.data[0] = pxData[i][j][0] / s;
            d.data[1] = pxData[i][j][1] / s;
            d.data[2] = pxData[i][j][2] / s;
            d.data[3] = pxData[i][j][3] / s;
            for (let k = 0; k < this.pixelSize; k++) {
              for (let n = 0; n < this.pixelSize; n++) {
                this.ctx.putImageData(
                  d,
                  c[0] + i * this.pixelSize + k,
                  c[1] + j * this.pixelSize + n);
              }
            }

          }
        }

        // this.ctx.beginPath();
        //
        // let w = this.curCord[0] - this.centerCord[0];
        // let h = this.curCord[1] - this.centerCord[1];
        //
        // if (event.ctrlKey || event.shiftKey) {
        //   const min = Math.min(Math.abs(w), Math.abs(h));
        //   w = min * Math.sign(w);
        //   h = min * Math.sign(h);
        // }
        // this.ctx.rect(this.centerCord[0], this.centerCord[1], w, h);
        // this.ctx.fill();
        // this.ctx.stroke();
        // this.ctx.closePath();

      } else if (this.type == 'ellipse') {
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

        let r_x = Math.abs(w / 2);
        let r_y = Math.abs(h / 2);

        const tl_x = Math.min(x1, x1 + w);
        const tl_y = Math.min(y1, y1 + h);

        this.ctx.ellipse(
          tl_x + r_x, tl_y + r_y,
          r_x, r_y,
          0, 2 * Math.PI, false);
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