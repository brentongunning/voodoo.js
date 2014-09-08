// ------------------------------------------------------------------------------------------------
// File: Attachable.js
//
// Copyright (c) 2014 Voodoojs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Adds functions to attach meshes to HTML elements.
 *
 * Options:
 *
 * - element {HTMLElement=} Optional element to attach to.
 * - center {boolean} Whether to center the mesh on the attached element.
 * - pixelScale {boolean} Whether the scale of the attached mesh is in pixels.
 *
 * Events:
 *
 * - attach
 * - detach
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Attachable = this.Attachable = voodoo.Model.extend({

  name: 'Attachable',
  organization: 'spellbook',
  viewType: voodoo.View.extend(),

  initialize: function(options) {
    this.base.initialize(options);

    if (options.element) {
      log_.assert_(options.element instanceof HTMLElement, 'element must be an HTMLElement.',
          '(Attachable::initialize)');
    }

    this.element_ = options.element;

    if (typeof options.center !== 'undefined') {
      log_.assert_(typeof options.center === 'boolean', 'center must be a boolean.', options.center,
          '(Attachable::initialize)');

      this.center_ = options.center;
    } else {
      this.center_ = true;
    }

    if (typeof options.pixelScale !== 'undefined') {
      log_.assert_(typeof options.pixelScale === 'boolean', 'pixelScale must be a boolean.',
          options.pixelScale, '(Attachable::initialize)');

      this.pixelScale_ = options.pixelScale;
    } else {
      this.pixelScale_ = true;
    }
  },

  setUpViews: function() {
    this.base.setUpViews();

    if (this.element_)
      this.attach(this.element_, this.center_, this.pixelScale_);
  }

});


/**
  * Attaches scene meshes to an HTML element.
  *
  * @param {HTMLElement} element Element to attach to.
  * @param {boolean=} opt_center Whether to center the meshes within the element. Default is true.
  * @param {boolean=} opt_pixelScale Whether to scale meshes in pixels, or units. Default is true.
  *
  * @return {Attachable}
  */
Attachable.prototype.attach = function(element, opt_center, opt_pixelScale) {
  log_.assert_(element, 'element must be valid.', '(Attachable::attach)');
  log_.assert_(element instanceof HTMLElement, 'element must be an HTMLElement.',
      '(Attachable::attach)');

  this.view.attach(element, opt_center, opt_pixelScale);
  if (this.stencilView)
    this.stencilView.attach(element, opt_center, opt_pixelScale);

  this.dispatch(new voodoo.Event('attach', this));

  return this;
};


/**
  * Detaches scene meshes from the attached HTML element.
  *
  * @return {Attachable}
  */
Attachable.prototype.detach = function() {
  this.dispatch(new voodoo.Event('detach', this));

  this.view.detach();
  if (this.stencilView)
    this.stencilView.detach();

  return this;
};
