// ----------------------------------------------------------------------------
// File: MouseLight.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view for a point that light follows the mouse cursor.
 *
 * This should NOT be created directly.
 *
 * @constructor
 * @private
 * @extends {LightView_}
 */
var MouseLightView_ = LightView_.extend({

  createLight_: function() {
    return new THREE.PointLight();
  },

  load: function() {
    this.base.load();

    this.updateHeight_();
  },

  move_: function(x, y) {
    this.light_.position.x = x;
    this.light_.position.y = y;

    this.dirty();
  },

  updateHeight_: function() {
    if (this.model.height_ <= 0)
      this.light_.position.z = this.camera.position.z;
    else
      this.light_.position.z = this.model.height_;

    this.dirty();
  }

});



/**
 * A point that light follows the mouse cursor.
 *
 * Options:
 *
 * - color {string} CSS color string.
 * - height {number} Height of the point light. A value <= 0 means to use the
 *     camera height.
 *
 * Events:
 *
 * - changeColor
 *
 * @constructor
 * @extends {Light_}
 *
 * @param {{color: string, height: number}=} opt_options Options object.
 */
var MouseLight = this.MouseLight = Light_.extend({

  name: 'MouseLight',
  organization: 'spellbook',
  viewType: MouseLightView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.height_ = typeof options.height !== 'undefined' ? options.height : 0;

    var that = this;
    Object.defineProperty(this, 'height', {
      get: function() { return that.height_; },
      set: function(height) { that.setHeight(height); },
      enumerable: true
    });
  },

  setUpViews: function() {
    this.base.setUpViews();

    // Move the light when the mouse moves.
    var that = this;
    this.mousemoveListener_ = function(event) {
      var x = event.clientX + window.pageXOffset;
      var y = event.clientY + window.pageYOffset;

      that.view.move_(x, y);
    };
    document.addEventListener('mousemove', this.mousemoveListener_, false);

    // Respond to camera moves in case the height changes.
    if (this.height_ <= 0) {
      this.on('cameramove', function() {
        this.view.updateHeight_();
      });
    }
  },

  tearDownViews: function() {
    document.removeEventListener('mousemove', this.mousemoveListener_, false);
  }

});


/**
 * Sets the height of the point light. A value <= 0 means to use the camera
 *     height.
 *
 * @param {number} height Height of the point light.
 *
 * @return {MouseLight}
 */
MouseLight.prototype.setHeight = function(height) {
  log_.assert_(typeof height === 'number', 'height must be a number.',
      height, '(MouseLight::setHeight)');

  this.height_ = height;

  this.view.updateHeight_();

  return this;
};


/**
 * Get or set the height of the point light. A value <= 0 means to use the
 *     camera height.
 *
 * @type {number}
 */
MouseLight.prototype.height = 0;
