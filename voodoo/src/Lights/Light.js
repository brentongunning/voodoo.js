// ----------------------------------------------------------------------------
// File: Light.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Base light view that others lights implement.
 *
 * This should NOT be created directly.
 *
 * @constructor
 * @private
 * @extends {View}
 */
var LightView_ = View['extend']();


/**
 * Creates a light type. Derived classes must override this.
 *
 * This should NOT be called directly.
 *
 * @return {THREE.Light} Custom light.
 */
LightView_.prototype['createLight'] = function() {
  throw 'createLight_() undefined.';
};


/**
 * Sets up the light scene objects.
 *
 * This should NOT be called directly.
 *
 * @this {LightView_}
 */
LightView_.prototype['load'] = function() {
  log_.assert_(this['renderer'] == Renderer['ThreeJs'],
      'Only ThreeJs is supported');

  this.light = this['createLight']();
  this['scene']['add'](this.light);
};


/**
 * Removes scene objects.
 *
 * This should NOT be called directly.
 *
 * @this {LightView_}
 */
LightView_.prototype['unload'] = function() {
  log_.assert_(this['renderer'] == Renderer['ThreeJs'],
      'Only ThreeJs is supported');

  this['scene']['remove'](this.light);
};


/**
 * Sets the color of the light.
 *
 * @this {LightView_}
 *
 * @param {string} color CSS color value.
 */
LightView_.prototype['setColor'] = function(color) {
  log_.assert_(this['renderer'] == Renderer['ThreeJs'],
      'Only ThreeJs is supported');

  var threeJsColor =
      window['voodoo']['utility']['convertCssColorToThreeJsColor'](color);

  this.light['color']['copy'](threeJsColor);
};



/**
 * Base light that derived lights implement.
 *
 * This should NOT be instantiated directly.
 *
 * @constructor
 * @private
 * @extends {Model}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var Light_ = Model['extend']();


/**
 * Initializes the light.
 *
 * This should NOT be called directly.
 *
 * @this {Light_}
 *
 * @param {{color: string}} options Options object.
 */
Light_.prototype['initialize'] = function(options) {
  if (typeof options.color !== 'undefined')
    this.color_ = options.color;
  else this.color_ = null;

  // Create the color property
  Object.defineProperty(this, 'color', {
    get: function() { return this.color_; },
    set: function(value) {
      this['view']['setColor'](value);
      this.color_ = value;
    },
    writeable: true
  });
};


/**
 * Initializes the light views.
 *
 * This should NOT be called directly.
 *
 * @this {Light_}
 */
Light_.prototype['setUpViews'] = function() {
  this['color'] = this.color_ ? this.color_ : 'black';
};


/**
 * The CSS color string describing the color of the light.
 *
 * @type {string}
 */
Light_.prototype['color'] = null;


/**
 * The internal light stencil view. Do not change.
 */
Light_.prototype['stencilViewType'] = View['extend']();
