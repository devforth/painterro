export class PrimitiveTool {

  constructor (main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
  }

  activate(type) {
    this.type = type;
    this.state = {};
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  procMouseDown(event) {
    const mainClass = event.target.classList[0];
    this.ctx.lineWidth = this.lineWidth;
    this.halfLineWidth = this.lineWidth / 2;
    this.ctx.strokeStyle = this.main.colorWidgetState.line.alphaColor;
    this.ctx.fillStyle =  this.main.colorWidgetState.fill.alphaColor;
    if (mainClass === 'ptro-crp-el' || mainClass === 'ptro-zoomer') {
      this.tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
      this.state.cornerMarked = true;
      this.centerCord = [
        event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
        event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop ,
      ];

      const scale = this.main.getScale();
      this.centerCord = [this.centerCord[0] * scale, this.centerCord[1] * scale];
    }
  }

  procMouseMove(event) {
    if (this.state.cornerMarked) {
      this.ctx.putImageData(this.tmpData, 0, 0);
      this.curCord = [
        event.clientX - this.el.documentOffsetLeft + this.main.wrapper.scrollLeft,
        event.clientY - this.el.documentOffsetTop + this.main.wrapper.scrollTop,
      ];
      const scale = this.main.getScale();
      this.curCord = [this.curCord[0] * scale, this.curCord[1] * scale];

      if (this.type === 'line') {
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

        this.ctx.rect(
          this.centerCord[0],
          this.centerCord[1],
          this.curCord[0] - this.centerCord[0],
          this.curCord[1] - this.centerCord[1]);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (this.type == 'circle') {
        this.ctx.beginPath();
        const x1 = this.centerCord[0];
        const y1 = this.centerCord[1];
        const x2 = this.curCord[0];
        const y2 = this.curCord[1];

        const r_x = Math.abs((x2 - x1) / 2);
        const r_y = Math.abs((y2 - y1) / 2)

        const tl_x = Math.min(x1, x2);
        const tl_y = Math.min(y1, y2)

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

  procMoseUp() {
    if (this.state.cornerMarked) {
      this.state.cornerMarked = false;
      this.main.worklog.captureState();
    }
  }
}