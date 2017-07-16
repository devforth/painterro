export default class WorkLog {
  constructor(main, { changedHandler } = {}) {
    this.main = main;
    this.current = null;
    this.changedHandler = changedHandler;
    this.empty = true;
  }

  changed() {
    this.changedHandler();
    this.empty = false;
  }

  captureState(initial) {
    const state = {
      sizew: this.main.size.w,
      sizeh: this.main.size.h,
      data: this.main.canvas.toDataURL(),
    };
    if (this.current === null) {
      state.prev = null;
    } else {
      state.prev = this.current;
      this.current.next = state;
    }
    state.next = null;
    this.current = state;
    if (initial !== true) {
      this.changed();
    }
  }

  applyState(state) {
    const img = new Image();
    img.onload = () => {
      this.main.resize(state.sizew, state.sizeh);
      this.main.ctx.drawImage(img, 0, 0);
      this.main.adjustSizeFull();
    };
    img.src = state.data;
  }

  undoState() {
    if (this.current.prev !== null) {
      this.current = this.current.prev;
      this.applyState(this.current);
      this.changed();
    }
  }

  redoState() {
    if (this.current.next !== null) {
      this.current = this.current.next;
      this.applyState(this.current);
      this.changed();
    }
  }
}
