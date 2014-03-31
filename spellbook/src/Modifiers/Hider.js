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

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      e.object.visible = this.model.visible;
      this.dirty();
    });
    this.setVisible(this.model.visible);
  },

  setVisible: function(visible) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i)
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

    var self = this;
    Object.defineProperty(this, 'visible', {
      get: function() { return this.visible_; },
      set: function(visible) {
        if (visible != self.visible_) {
          self.visible_ = visible;
          self.view.setVisible(visible);
          if (typeof self.stencilView !== 'undefined' && self.stencilView)
            self.stencilView.setVisible(visible);

          if (visible)
            self.dispatch(new voodoo.Event('show', self));
          else self.dispatch(new voodoo.Event('hide', self));
        }
      },
      enumerable: false
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
