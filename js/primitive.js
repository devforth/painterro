export class PrimitiveTool {

  constructor (main) {
    this.ctx = main.ctx;
    this.el = main.toolEl;
    this.main = main;
  }

  activate(type) {
    this.type = type;
    this.state = {

    };
  }

  procMouseDown(event) {
    const mainClass = event.target.classList[0];
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle  = this.main.colorWidget.alphaColor;
    if (mainClass === 'ptro-crp-el') {
      this.tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
      this.state.cornerMarked = true;
      this.centerCord = [
        event.clientX - this.el.documentOffsetLeft,
        event.clientY - this.el.documentOffsetTop,
      ];
      const scale = this.main.getScale();
      this.centerCord = [this.centerCord[0] * scale, this.centerCord[1] * scale];
    }
  }

  procMouseMove(event) {
    if (this.state.cornerMarked) {
      this.ctx.putImageData(this.tmpData, 0, 0);
      this.curCord = [
        event.clientX - this.el.documentOffsetLeft,
        event.clientY - this.el.documentOffsetTop,
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
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerCord[0], this.centerCord[1]);
        this.ctx.lineTo(this.curCord[0], this.centerCord[1]);
        this.ctx.lineTo(this.curCord[0], this.curCord[1]);
        this.ctx.lineTo(this.centerCord[0], this.curCord[1]);
        this.ctx.closePath();
        this.ctx.stroke();
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