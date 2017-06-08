import { HexToRGBA } from './colorPicker';

export function setDefaults(params) {
  params.activeColor = params.activeColor || "#ff0000";
  params.activeColorAlpha = params.activeColorAlpha || 1;
  params.activeAlphaColor = HexToRGBA(params.activeColor, params.activeColorAlpha);

  params.activeFillColor = params.activeFillColor || "#000000";
  params.activeFillColorAlpha = params.activeFillColorAlpha || 0;
  params.activeFillAlphaColor = HexToRGBA(params.activeFillColor, params.activeFillColorAlpha);

  params.backgroundFillColor = params.backgroundFillColor || "#ffffff";

  return params;
}