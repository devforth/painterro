import {distance} from "./utils";
export class PrimitiveTool {

  constructor (main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
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
    this.ctx.beginPath();

    this.ctx.lineWidth = 0;
    this.ctx.fillStyle =  this.main.colorWidgetState.line.alphaColor;

    this.ctx.ellipse(
          this.points[0].x, this.points[0].y,
          this.lineWidth / 2, this.lineWidth / 2,
          0, 2 * Math.PI, false);

    this.ctx.ellipse(
          this.points[this.points.length - 1].x,
          this.points[this.points.length - 1].y,
          this.lineWidth / 2, this.lineWidth / 2,
          0, 2 * Math.PI, false);

    this.ctx.fill();
    this.ctx.closePath();


    this.ctx.beginPath();
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.main.colorWidgetState.line.alphaColor;
    this.ctx.fillStyle =  this.main.colorWidgetState.fill.alphaColor;

    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    let last;
    for (let p of smPoints.slice(1)) {
      this.ctx.lineTo(p.x, p.y);
      last = p;
    }
    if (last) {
      this.ctx.moveTo(last.x, last.y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
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
}