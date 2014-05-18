// ----------------------------------------------------------------------------
// File: Light.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * Base light view that others lights implement.
 *
 * This should NOT be created directly.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var LightView_ = voodoo.View.extend({

  createLight_: function() {
    log_.error_('createLight_() undefined.', '(LightView_::createLight_)');
  },

  load: function() {
    this.light_ = this.createLight_();
    this.scene.add(this.light_);
  },

  setColor_: function(color) {
    this.light_.color.copy(color);
  }

});



/**
 * Base light that derived lights implement.
 *
 * This should NOT be instantiated directly.
 *
 * @constructor
 * @private
 * @extends {voodoo.Model}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var Light_ = voodoo.Model.extend({

  stencilViewType: NullView,

  initialize: function(options) {
    if (options.color)
      this.color_ = options.color;
    else
      this.color_ = null;

    // Create the color property
    var that = this;
    Object.defineProperty(this, 'color', {
      get: function() { return that.color_; },
      set: function(color) { that.setColor(color); },
      enumerable: true
    });
  },

  setUpViews: function() {
    this.color = this.color_ ? this.color_ : 'white';
  }

});


/**
 * Changes the color for this light.
 *
 * @param {string} color CSS color string.
 *
 * @return {Light_}
 */
Light_.prototype.setColor = function(color) {
  var threeJsColor = voodoo.utility.convertCssColorToThreeJsColor(color);
  this.view.setColor_(threeJsColor);
  this.color_ = color;

  return this;
};


/**
 * CSS color string for this light.
 *
 * @type {string}
 */
Light_.prototype.color = '';
