// ----------------------------------------------------------------------------
// File: Utility.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Helper function that are always available when developing models.
 *
 * This class is instantiated automatically in voodoo.utility.
 *
 * @constructor
 */
function Utility() {
  this.colorToHexString = {
    'aliceblue': '#f0f8ff',
    'antiquewhite': '#faebd7',
    'aqua': '#00ffff',
    'aquamarine': '#7fffd4',
    'azure': '#f0ffff',
    'beige': '#f5f5dc',
    'bisque': '#ffe4c4',
    'black': '#000000',
    'blanchedalmond': '#ffebcd',
    'blue': '#0000ff',
    'blueviolet': '#8a2be2',
    'brown': '#a52a2a',
    'burlywood': '#deb887',
    'cadetblue': '#5f9ea0',
    'chartreuse': '#7fff00',
    'chocolate': '#d2691e',
    'coral': '#ff7f50',
    'cornflowerblue': '#6495ed',
    'cornsilk': '#fff8dc',
    'crimson': '#dc143c',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgoldenrod': '#b8860b',
    'darkgray': '#a9a9a9',
    'darkgreen': '#006400',
    'darkkhaki': '#bdb76b',
    'darkmagenta': '#8b008b',
    'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00',
    'darkorchid': '#9932cc',
    'darkred': '#8b0000',
    'darksalmon': '#e9967a',
    'darkseagreen': '#8fbc8f',
    'darkslateblue': '#483d8b',
    'darkslategray': '#2f4f4f',
    'darkturquoise': '#00ced1',
    'darkviolet': '#9400d3',
    'deeppink': '#ff1493',
    'deepskyblue': '#00bfff',
    'dimgray': '#696969',
    'dodgerblue': '#1e90ff',
    'firebrick': '#b22222',
    'floralwhite': '#fffaf0',
    'forestgreen': '#228b22',
    'fuchsia': '#ff00ff',
    'gainsboro': '#dcdcdc',
    'ghostwhite': '#f8f8ff',
    'gold': '#ffd700',
    'goldenrod': '#daa520',
    'gray': '#808080',
    'green': '#008000',
    'greenyellow': '#adff2f',
    'honeydew': '#f0fff0',
    'hotpink': '#ff69b4',
    'indianred ': '#cd5c5c',
    'indigo ': '#4b0082',
    'ivory': '#fffff0',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'lavenderblush': '#fff0f5',
    'lawngreen': '#7cfc00',
    'lemonchiffon': '#fffacd',
    'lightblue': '#add8e6',
    'lightcoral': '#f08080',
    'lightcyan': '#e0ffff',
    'lightgoldenrodyellow': '#fafad2',
    'lightgrey': '#d3d3d3',
    'lightgreen': '#90ee90',
    'lightpink': '#ffb6c1',
    'lightsalmon': '#ffa07a',
    'lightseagreen': '#20b2aa',
    'lightskyblue': '#87cefa',
    'lightslategray': '#778899',
    'lightsteelblue': '#b0c4de',
    'lightyellow': '#ffffe0',
    'lime': '#00ff00',
    'limegreen': '#32cd32',
    'linen': '#faf0e6',
    'magenta': '#ff00ff',
    'maroon': '#800000',
    'mediumaquamarine': '#66cdaa',
    'mediumblue': '#0000cd',
    'mediumorchid': '#ba55d3',
    'mediumpurple': '#9370d8',
    'mediumseagreen': '#3cb371',
    'mediumslateblue': '#7b68ee',
    'mediumspringgreen': '#00fa9a',
    'mediumturquoise': '#48d1cc',
    'mediumvioletred': '#c71585',
    'midnightblue': '#191970',
    'mintcream': '#f5fffa',
    'mistyrose': '#ffe4e1',
    'moccasin': '#ffe4b5',
    'navajowhite': '#ffdead',
    'navy': '#000080',
    'oldlace': '#fdf5e6',
    'olive': '#808000',
    'olivedrab': '#6b8e23',
    'orange': '#ffa500',
    'orangered': '#ff4500',
    'orchid': '#da70d6',
    'palegoldenrod': '#eee8aa',
    'palegreen': '#98fb98',
    'paleturquoise': '#afeeee',
    'palevioletred': '#d87093',
    'papayawhip': '#ffefd5',
    'peachpuff': '#ffdab9',
    'peru': '#cd853f',
    'pink': '#ffc0cb',
    'plum': '#dda0dd',
    'powderblue': '#b0e0e6',
    'purple': '#800080',
    'red': '#ff0000',
    'rosybrown': '#bc8f8f',
    'royalblue': '#4169e1',
    'saddlebrown': '#8b4513',
    'salmon': '#fa8072',
    'sandybrown': '#f4a460',
    'seagreen': '#2e8b57',
    'seashell': '#fff5ee',
    'sienna': '#a0522d',
    'silver': '#c0c0c0',
    'skyblue': '#87ceeb',
    'slateblue': '#6a5acd',
    'slategray': '#708090',
    'snow': '#fffafa',
    'springgreen': '#00ff7f',
    'steelblue': '#4682b4',
    'tan': '#d2b48c',
    'teal': '#008080',
    'thistle': '#d8bfd8',
    'tomato': '#ff6347',
    'turquoise': '#40e0d0',
    'violet': '#ee82ee',
    'wheat': '#f5deb3',
    'white': '#ffffff',
    'whitesmoke': '#f5f5f5',
    'yellow': '#ffff00',
    'yellowgreen': '#9acd32'
  };
}


/**
 * Converts a CSS color to a Three.Js color.
 *
 * Legal CSS colors are defined here:
 * http://www.w3schools.com/cssref/css_colors_legal.asp.
 *
 * The alpha values of CSS colors are ignored.
 *
 * @this {Utility}
 *
 * @param {string} cssColor CSS color.
 *
 * @return {THREE.Color} The Three.Js color value.
 */
Utility.prototype['convertCssColorToThreeJsColor'] = function(cssColor) {
  log_.assert_(cssColor, 'cssColor undefined.',
      '(Utility::convertCssColorToThreeJsColor)');
  log_.assert_(cssColor.length >= 3, 'cssColor too short.',
      '(Utility::convertCssColorToThreeJsColor)');

  cssColor = cssColor.toLowerCase();

  // Check for hex color (ie. #AA0055)
  if (cssColor[0] === '#') {
    return this.convertHexStringToThreeJsColor_(cssColor);
  }

  // Check for rgb color (ie. rgb(255, 0, 0))
  if (cssColor.indexOf('rgb(') === 0) {
    var colors = cssColor.substring(4, cssColor.length - 1).split(',');
    log_.assert_(colors.length === 3, 'Invalid rgb color.',
        '(Utility::convertCssColorToThreeJsColor)');
    return this.convertRGBColorToThreeJsColor_(colors[0], colors[1], colors[2]);
  }

  // Check for rgba color (ie. rgba(255, 0, 0, 0.5))
  if (cssColor.indexOf('rgba(') === 0) {
    var colors = cssColor.substring(5, cssColor.length - 1).split(',');
    log_.assert_(colors.length === 4, 'Invalid rgba color.',
        '(Utility::convertCssColorToThreeJsColor)');
    return this.convertRGBColorToThreeJsColor_(colors[0], colors[1], colors[2]);
  }

  // Parse HSL color (ie. hsl(120, 65%, 45%))
  if (cssColor.indexOf('hsl(') === 0) {
    var parts = cssColor.substring(4, cssColor.length - 1).split(',');
    log_.assert_(parts.length === 3, 'Invalid hsl color.',
        '(Utility::convertCssColorToThreeJsColor)');
    return this.convertHSLColorToThreeJsColor_(parts[0], parts[1], parts[2]);
  }

  // Parse HSLA color (ie. hsla(120, 65%, 45%, 0.5))
  if (cssColor.indexOf('hsla(') === 0) {
    var parts = cssColor.substring(5, cssColor.length - 1).split(',');
    log_.assert_(parts.length === 4, 'Invalid hsla color.',
        '(Utility::convertCssColorToThreeJsColor)');
    return this.convertHSLColorToThreeJsColor_(parts[0], parts[1], parts[2]);
  }

  // Try parsing the color value directly (ie. 'blue').
  return this.convertColorStringToThreeJsColor_(cssColor);
};


/**
 * Gets the absolute position of an HTML element relative to the
 * top left corner of the page.
 *
 * This may be used to dynamically position models relative to
 * HTML elements.
 *
 * @param {Element} element HTML element.
 *
 * @return {Object} Object with x and y coords.
 */
Utility.prototype['findAbsolutePosition'] = function(element) {
  var left = 0;
  var top = 0;
  if (element.offsetParent) {
    do {
      left += element.offsetLeft;
      top += element.offsetTop;
    } while (element = element.offsetParent);
  }
  return {x: left, y: top};
};


/**
 * Converts a hex string to a Three.Js color.
 *
 * @private
 *
 * @param {string} hex Hex string (ie. #AA9955).
 *
 * @return {THREE.Color} Three.js color.
 */
Utility.prototype.convertHexStringToThreeJsColor_ = function(hex) {
  var h = parseInt('0x' + hex.substring(1), 16);
  return new THREE.Color(h);
};


/**
 * Converts an RGB color value to a Three.Js color.
 *
 * @private
 *
 * @param {string|number} r Red value from 0-255.
 * @param {string|number} g Green value from 0-255.
 * @param {string|number} b Blue value from 0-255.
 *
 * @return {THREE.Color} Three.Js color.
 */
Utility.prototype.convertRGBColorToThreeJsColor_ = function(r, g, b) {
  r = parseFloat(r) / 255.0;
  g = parseFloat(g) / 255.0;
  b = parseFloat(b) / 255.0;

  log_.assert_(r >= 0.0, 'r value < 0.',
      '(Utility::convertRGBColorToThreeJsColor_)');
  log_.assert_(r <= 1.0, 'r value > 1.',
      '(Utility::convertRGBColorToThreeJsColor_)');
  log_.assert_(g >= 0.0, 'g value < 0.',
      '(Utility::convertRGBColorToThreeJsColor_)');
  log_.assert_(g <= 1.0, 'g value > 1.',
      '(Utility::convertRGBColorToThreeJsColor_)');
  log_.assert_(b >= 0.0, 'b value < 0.',
      '(Utility::convertRGBColorToThreeJsColor_)');
  log_.assert_(b <= 1.0, 'b value > 1.',
      '(Utility::convertRGBColorToThreeJsColor_)');

  return new THREE.Color().setRGB(r, g, b);
};


/**
 * Converts an HSL color value to a Three.Js color.
 *
 * Source: http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
 *
 * @private
 *
 * @param {string|number} h Hue from [0-360).
 * @param {string|number} s Saturation from [0-100].
 * @param {string|number} l Lightness from [0-100].
 *
 * @return {THREE.Color} Three.Js color.
 */
Utility.prototype.convertHSLColorToThreeJsColor_ = function(h, s, l) {
  h = parseFloat(h);
  s = parseFloat(s) / 100.0;
  l = parseFloat(l) / 100.0;

  log_.assert_(h >= 0.0, 'h value < 0.',
      '(Utility::convertHSLColorToThreeJsColor_)');
  log_.assert_(h < 360.0, 'h value >= 360.',
      '(Utility::convertHSLColorToThreeJsColor_)');
  log_.assert_(s >= 0.0, 's value < 0.',
      '(Utility::convertHSLColorToThreeJsColor_)');
  log_.assert_(s <= 1.0, 's value > 1.',
      '(Utility::convertHSLColorToThreeJsColor_)');
  log_.assert_(l >= 0.0, 'l value < 0.',
      '(Utility::convertHSLColorToThreeJsColor_)');
  log_.assert_(l <= 1.0, 'l value > 1.',
      '(Utility::convertHSLColorToThreeJsColor_)');

  var chroma = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
  var hprime = h / 60.0;
  var x = chroma * (1 - Math.abs(parseInt(hprime, 10) % 2 - 1));

  var rprime = 0;
  var gprime = 0;
  var bprime = 0;
  if (0.0 <= hprime && hprime < 1.0) {
    rprime = chroma;
    gprime = x;
  }
  else if (1.0 <= hprime && hprime < 2.0) {
    rprime = x;
    gprime = chroma;
  }
  else if (2.0 <= hprime && hprime < 3.0) {
    gprime = chroma;
    bprime = x;
  }
  else if (3.0 <= hprime && hprime < 4.0) {
    gprime = x;
    bprime = chroma;
  }
  else if (4.0 <= hprime && hprime < 5.0) {
    rprime = x;
    bprime = chroma;
  }
  else if (5.0 <= hprime && hprime < 6.0) {
    rprime = chroma;
    bprime = x;
  }

  var m = l - 0.5 * chroma;
  return new THREE.Color().setRGB(rprime + m, gprime + m, bprime + m);
};


/**
 * Converts a color string to a Three.Js color.
 *
 * @private
 *
 * @param {string} color Color string (ie. 'red').
 *
 * @return {THREE.Color} Three.Js color.
 */
Utility.prototype.convertColorStringToThreeJsColor_ = function(color) {
  log_.assert_(color in this.colorToHexString, 'Invalid color string.',
      '(Utility::convertColorStringToThreeJsColor_)');

  return this.convertHexStringToThreeJsColor_(
      this.colorToHexString[color.toLowerCase()]);
};


/**
 * Global Utility instance. This is created automatically.
 *
 * @type {Utility}
 */
this['utility'] = new Utility();
