// ----------------------------------------------------------------------------
// File: Hider.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the visibility of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var HiderView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      e.object.visible = this.model.visible_;
      this.dirty();
    });

    this.setVisible_(this.model.visible_);
  },

  setVisible_: function(visible) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i)
      sceneObjects[i].visible = visible;

    this.dirty();
  }

});



/**
 * Adds functions to show and hide meshes.
 *
 * Options:
 *
 * - visible {boolean} Initial visibility. Default is true.
 *
 * Events:
 *
 * - show
 * - hide
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Hider = this.Hider = voodoo.Model.extend({

  name: 'Hider',
  organization: 'spellbook',
  viewType: HiderView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.visible_ = typeof options.visible !== 'undefined' ?
        options.visible : true;

    var that = this;
    Object.defineProperty(this, 'visible', {
      get: function() { return this.visible_; },
      set: function(visible) {
        if (visible !== that.visible_) {
          that.visible_ = visible;

          that.view.setVisible_(visible);
          if (that.stencilView)
            that.stencilView.setVisible_(visible);

          if (visible)
            that.dispatch(new voodoo.Event('show', that));
          else
            that.dispatch(new voodoo.Event('hide', that));
        }
      },
      enumerable: true
    });
  }

});


/**
  * Shows all scene meshes.
  *
  * @return {Hider}
  */
Hider.prototype.show = function() {
  this.visible = true;

  return this;
};


/**
  * Hides all scene meshes.
  *
  * @return {Hider}
  */
Hider.prototype.hide = function() {
  this.visible = false;

  return this;
};


/**
 * Get or set the visibility of all scene meshes.
 *
 * @type {boolean}
 */
Hider.prototype.visible = false;
