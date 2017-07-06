import { HexToRGBA } from './colorPicker';
import { Translation } from './translation';

export function setDefaults(params) {
  params = params || {};
  params.activeColor = params.activeColor || "#ff0000";
  params.activeColorAlpha = params.activeColorAlpha || 1.0;
  params.activeAlphaColor = HexToRGBA(params.activeColor, params.activeColorAlpha);

  params.activeFillColor = params.activeFillColor || "#000000";
  params.activeFillColorAlpha = params.activeFillColorAlpha || 0.0;
  params.activeFillAlphaColor = HexToRGBA(params.activeFillColor, params.activeFillColorAlpha);

  params.defaultLineWidth = params.defaultLineWidth || 5;
  params.defaultFontSize = params.defaultFontSize || 24;
  params.backgroundFillColor = params.backgroundFillColor || "#ffffff";
  params.hiddenTools = params.hiddenTools || [];

  params.colorScheme = params.colorScheme || {};
  params.colorScheme.main = params.colorScheme.main || "#dbebff";
  params.colorScheme.control = params.colorScheme.control || "#abc6ff";
  params.colorScheme.controlContent = params.colorScheme.controlContent || "#000000";
  params.colorScheme.activeControl = params.colorScheme.activeControl || "#7485B1";
  params.colorScheme.activeControlContent = params.colorScheme.activeControlContent || params.colorScheme.main;
  params.colorScheme.inputBorderColor = params.colorScheme.inputBorderColor || params.colorScheme.main;
  params.colorScheme.inputBackground = params.colorScheme.inputBackground || '#ffffff';
  params.colorScheme.inputText = params.colorScheme.inputText || params.colorScheme.activeControl;
  params.colorScheme.backgroundColor = params.colorScheme.backgroundColor || '#999999';
  params.colorScheme.dragOverBarColor = params.colorScheme.dragOverBarColor || '#899dff';

  params.defaultSize = params.defaultSize || 'fill';
  params.defaultPixelSize = params.defaultPixelSize || 4;
  if (params.defaultSize === 'fill') {
    params.defaultSize = {
      width: 'fill',
      height: 'fill'
    }
  } else {
    const wh = params.defaultSize.split('x');
    params.defaultSize = {
      width: wh[0].ptroTrim(),
      height: wh[1].ptroTrim()
    }
  }

  if (params.translation) {
    const name = params.translation.name;
    Translation.get().addTranslation(name, params.translation.strings)
    Translation.get().activate(name)
  }

  params.styles =
    `.ptro-color-main{background-color: ${params.colorScheme.main}}
    .ptro-color-control{
        background-color: ${params.colorScheme.control};
        color:${params.colorScheme.controlContent}}
    .ptro-bordered-control{border-color: ${params.colorScheme.activeControl}}
    .ptro-input {
      border: 1px solid ${params.colorScheme.inputBorderColor};
      background-color: ${params.colorScheme.inputBackground};
      color: ${params.colorScheme.inputText}
    }
    .ptro-bar-dragover{background-color:${params.colorScheme.dragOverBarColor}}
    .ptro-color,.ptro-bordered-btn{
      border: 1px solid ${params.colorScheme.inputBorderColor};
    }
    .ptro-color-control:active:enabled {
        background-color: ${params.colorScheme.activeControl};
        color: ${params.colorScheme.activeControlContent}}
    .ptro-color-active-control{
        background-color: ${params.colorScheme.activeControl};
        color:${params.colorScheme.activeControlContent}}
    .ptro-wrapper{background-color:${params.colorScheme.backgroundColor};}}`;

  return params;
}