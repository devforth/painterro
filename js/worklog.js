export default class WorkLog {
  constructor(main, changedHandler) {
    this.main = main;
    this.current = null;
    this.changedHandler = changedHandler;
    this.empty = true;
    this.clean = true;
    this.ctx = main.ctx;
  }

  changed(initial) {
    if (this.current.prevCount - this.clearedCount > this.main.params.worklogLimit) {
      this.first = this.first.next;
      this.first.prev = null;
      this.clearedCount += 1;
    }
    this.changedHandler({
      first: this.current.prev === null,
      last: this.current.last === null,
      initial,
    });
    this.empty = false;
    this.clean = false;
  }

  captureState(initial) {
    const state = {
      sizew: this.main.size.w,
      sizeh: this.main.size.h,
      data: this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h),
    };
    if (this.current === null) {
      state.prev = null;
      state.prevCount = 0;
      this.first = state;
      this.clearedCount = 0;
    } else {
      state.prev = this.current;
      state.prevCount = this.current.prevCount + 1;
      this.current.next = state;
    }
    state.next = null;
    this.current = state;
    this.changed(initial);
  }

  reCaptureState() {
    if (this.current.prev !== null) {
      this.current = this.current.prev;
    }
    this.captureState();
  }

  applyState(state) {
    this.main.resize(state.sizew, state.sizeh);
    this.main.ctx.putImageData(state.data, 0, 0);
    this.main.adjustSizeFull();
    this.main.select.hide();
  }

  undoState() {
    if (this.current.prev !== null) {
      this.current = this.current.prev;
      this.applyState(this.current);
      this.changed(false);
    }
  }

  redoState() {
    if (this.current.next !== null) {
      this.current = this.current.next;
      this.applyState(this.current);
      this.changed(false);
    }
  }
}
