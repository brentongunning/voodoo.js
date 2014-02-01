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

  createLight: function() {
    return new THREE.PointLight();
  },

  load: function() {
    LightView_.prototype.load.call(this);

    this.updateHeight();
  },

  move: function(x, y) {
    this.light.position.x = x;
    this.light.position.y = y;
    this.dirty();
  },

  updateHeight: function() {
    if (this.model.height <= 0)
      this.light.position.z = this.camera.position.z;
    else this.light.position.z = this.model.height;
    this.dirty();
  }

});



/**
 * A point that light follows the mouse cursor.
 *
 * Options are:
 *   color {string} CSS color string.
 *   height {number} Height of the point light. A value <= 0 means to use the
 *     camera height.
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
    Light_.prototype.initialize.call(this, options);

    this.height = typeof options.height !== 'undefined' ? options.height : 0;
  },

  setUpViews: function() {
    Light_.prototype.setUpViews.call(this);

    // Move the light when the mouse moves.
    var self = this;
    document.addEventListener('mousemove', function(event) {
      var x = event.clientX + window.pageXOffset;
      var y = event.clientY + window.pageYOffset;
      self.view.move(x, y);
    }, false);

    // Respond to camera moves in case the height changes.
    if (this.height <= 0) {
      this.on('cameramove', function() {
        this.view.updateHeight();
      });
    }
  }

});
