// ------------------------------------------------------------------------------------------------
// File: Hidable.js
//
// Copyright (c) 2014 Voodoojs Authors
// ------------------------------------------------------------------------------------------------



/**
 * The view that controls the visibility of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var HidableView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      this.setVisibleToMesh_(e.object, this.model.visible_);
      this.dirty();
    });

    this.setVisible_(this.model.visible_);
  },

  setVisible_: function(visible) {
    var sceneObjects = this.scene.objects;

    for (var i = 0, len = sceneObjects.length; i < len; ++i)
      this.setVisibleToMesh_(sceneObjects[i], visible);

    this.dirty();
  },

  setVisibleToMesh_: function(mesh, visible) {
    var children = mesh.children;
    if (children) {
      for (var i = 0, len = children.length; i < len; ++i)
        this.setVisibleToMesh_(children[i], visible);
    }

    mesh.visible = visible;
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
var Hidable = this.Hidable = voodoo.Model.extend({

  name: 'Hidable',
  organization: 'spellbook',
  viewType: HidableView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.visible !== 'undefined') {
      log_.assert_(typeof options.visible === 'boolean', 'visible must be a boolean.',
          options.visible, '(Hidable::initialize)');

      this.visible_ = options.visible;
    } else {
      this.visible_ = true;
    }

    var that = this;
    Object.defineProperty(this, 'visible', {
      get: function() { return this.visible_; },
      set: function(visible) {
        log_.assert_(typeof visible === 'boolean', 'visible must be a boolean.', visible,
            '(Hidable::visible)');

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
  * @return {Hidable}
  */
Hidable.prototype.show = function() {
  this.visible = true;

  return this;
};


/**
  * Hides all scene meshes.
  *
  * @return {Hidable}
  */
Hidable.prototype.hide = function() {
  this.visible = false;

  return this;
};


/**
 * Get or set the visibility of all scene meshes.
 *
 * @type {boolean}
 */
Hidable.prototype.visible = false;
