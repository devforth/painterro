import { setParam } from './params';

export default class ControlBuilder {
  constructor(main) {
    this.main = main;
  }

  buildFontSizeControl(controlIndex) {
    const action = () => {
      const fontSize =
        this.main.getElemByIdSafe(this.main.activeTool.controls[controlIndex].id).value;
      this.main.textTool.setFontSize(fontSize);
      setParam('defaultFontSize', fontSize);
    };
    const getValue = () => this.main.textTool.fontSize;

    if (this.main.params.availableFontSizes) {
      return ControlBuilder.buildDropDownControl('fontSize', action, getValue, this.main.params.availableFontSizes);
    }
    return ControlBuilder.buildInputControl('fontSize', action, getValue, 1, 200);
  }

  buildEraserWidthControl(controlIndex) {
    const action = () => {
      const width = this.main.getElemByIdSafe(this.main.activeTool.controls[controlIndex].id).value;
      this.main.primitiveTool.setEraserWidth(width);
      setParam('defaultEraserWidth', width);
    };
    const getValue = () => this.main.primitiveTool.eraserWidth;

    if (this.main.params.availableEraserWidths) {
      return ControlBuilder.buildDropDownControl('eraserWidth', action, getValue, this.main.params.availableEraserWidths);
    }
    return ControlBuilder.buildInputControl('eraserWidth', action, getValue, 1, 99);
  }

  buildLineWidthControl(controlIndex) {
    const action = () => {
      const width = this.main.getElemByIdSafe(this.main.activeTool.controls[controlIndex].id).value;
      this.main.primitiveTool.setLineWidth(width);
      setParam('defaultLineWidth', width);
    };
    const getValue = () => this.main.primitiveTool.lineWidth;

    if (this.main.params.availableLineWidths) {
      return ControlBuilder.buildDropDownControl('lineWidth', action, getValue, this.main.params.availableLineWidths);
    }
    return ControlBuilder.buildInputControl('lineWidth', action, getValue, 0, 99);
  }

  buildShadowOnControl(controlIndex) {
    return {
      type: 'bool',
      title: 'shadowOn',
      titleFull: 'shadowOnFull',
      target: 'shadowOn',
      action: () => {
        const btn = this.main.getElemByIdSafe(this.main.activeTool.controls[controlIndex].id);
        const state = !(btn.getAttribute('data-value') === 'true');
        this.main.primitiveTool.setShadowOn(state);
        btn.setAttribute('data-value', state ? 'true' : 'false');
        setParam('defaultPrimitiveShadowOn', state);
      },
      getValue: () => this.main.primitiveTool.shadowOn,
    };
  }

  buildPaintBucketControl(controlIndex) {
    const action = () => {
      const width = document.getElementById(this.main.activeTool.controls[controlIndex].id).value;
      console.log('buildPaintBucketControl width: ' + width);
      // this.main.primitiveTool.setLineWidth(width);
      setParam('activeFillColor', width);
    };
    const getValue = () => this.main.primitiveTool.lineWidth;

    return ControlBuilder.buildInputControl('lineWidth', action, getValue, 1, 99);
  }

  buildArrowLengthControl(controlIndex) {
    const action = () => {
      const width = this.main.getElemByIdSafe(this.main.activeTool.controls[controlIndex].id).value;
      this.main.primitiveTool.setArrowLength(width);
      setParam('defaultArrowLength', width);
    };
    const getValue = () => this.main.primitiveTool.arrowLength;

    if (this.main.params.availableArrowLengths) {
      return ControlBuilder.buildDropDownControl('arrowLength', action, getValue, this.main.params.availableArrowLengths);
    }
    return ControlBuilder.buildInputControl('arrowLength', action, getValue, 1, 99);
  }

  static buildInputControl(name, action, getValue, minVal, maxVal) {
    return {
      type: 'int',
      title: name,
      titleFull: `${name}Full`,
      target: name,
      min: minVal,
      max: maxVal,
      action,
      getValue,
    };
  }

  static buildDropDownControl(name, action, getValue, availableValues) {
    return {
      type: 'dropdown',
      title: name,
      titleFull: `${name}Full`,
      target: name,
      action,
      getValue,
      getAvailableValues: () => availableValues.map(
        x => ({ value: x, name: x.toString(), title: x.toString() })),
    };
  }
}

