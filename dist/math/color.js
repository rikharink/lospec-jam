export function lighten(color, percentage) {
  let hsl = rgbToHsl(color);
  hsl[2] += percentage / 100 * 50;
  return hslToRgb(hsl);
}
export function darken(color, percentage) {
  let hsl = rgbToHsl(color);
  hsl[2] -= percentage / 100 * 50;
  return hslToRgb(hsl);
}
export function mergeRgb(rgb) {
  let [r, g, b] = rgb;
  let res = r;
  res = (res << 8) + g;
  res = (res << 8) + b;
  return res;
}
export function splitRgb(rgb) {
  let r = (rgb & 16711680) >> 16;
  let g = (rgb & 65280) >> 8;
  let b = rgb & 255;
  return [r, g, b];
}
export function hslToRgb(hsl) {
  let [h, s, l] = hsl;
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return [r, g, b];
}
export function rgbToHsl(rgb) {
  let [r, g, b] = rgb;
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = (g - b) / delta % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0)
    h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return [h, s, l];
}
