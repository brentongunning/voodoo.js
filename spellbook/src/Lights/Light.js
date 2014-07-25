// ------------------------------------------------------------------------------------------------
// File: Light.js
//
// Copyright (c) 2014 Voodoojs Authors
// ------------------------------------------------------------------------------------------------



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

  getLight_: function() {
    return this.light_;
  },

  load: function() {
    this.base.load();

    this.light_ = this.createLight_();
    this.scene.add(this.light_);
  }

});



/**
 * Base light that derived lights implement.
 *
 * This should NOT be instantiated directly.
 *
 * Events:
 *
 * - changeColor
 *
 * @constructor
 * @private
 * @extends {Colorable}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var Light_ = Colorable.extend({

  stencilViewType: NullView

});
