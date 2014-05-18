// ----------------------------------------------------------------------------
// File: Wireframe.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the wireframe property of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var WireframeView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      this.setWireframeToMesh_(e.object, this.model.wireframe_);
      this.dirty();
    });

    this.setWireframe_(this.model.wireframe_);
  },

  setWireframe_: function(wireframe) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.setWireframeToMesh_(sceneObject, wireframe);
    }

    this.dirty();
  },

  setWireframeToMesh_: function(mesh, wireframe) {
    log_.assert_(mesh, 'mesh must be valid.',
        '(WireframeView_::setWireframeToMesh_)');

    var material = mesh.material;
    if (material) {
      var materials = material.materials;
      if (materials) {
        for (var i = 0, len = materials.length; i < len; ++i) {
          var subMaterial = materials[i];
          if (typeof subMaterial.wireframe !== 'undefined')
            subMaterial.wireframe = wireframe;
        }
      }

      if (typeof material.wireframe !== 'undefined')
        material.wireframe = wireframe;
    }
  }

});



/**
 * Adds functions to change whether meshes are wireframe.
 *
 * Options:
 *
 * - wireframe {boolean} Whether to draw wireframe. Default is true.
 *
 * Events:
 *
 * - changeWireframe
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Wireframe = this.Wireframe = voodoo.Model.extend({

  name: 'Wireframe',
  organization: 'spellbook',
  viewType: WireframeView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.wireframe_ = typeof options.wireframe !== 'undefined' ?
        options.wireframe : true;

    var that = this;
    Object.defineProperty(this, 'wireframe', {
      get: function() { return that.wireframe_; },
      set: function(wireframe) { that.setWireframe(wireframe); },
      enumerable: true
    });
  }

});


/**
  * Immediately changes whether scene meshes are drawn in wireframe.
  *
  * @param {boolean} wireframe Whether to draw wireframe.
  *
  * @return {Wireframe}
  */
Wireframe.prototype.setWireframe = function(wireframe) {
  if (wireframe !== this.wireframe_) {
    this.wireframe_ = wireframe;

    this.dispatch(new voodoo.Event('changeWireframe', this));

    this.view.setWireframe_(this.wireframe_);
    if (this.stencilView)
      this.stencilView.setWireframe_(this.wireframe_);
  }

  return this;
};


/**
 * Get or set whether meshes are wireframe. Default is true.
 *
 * @type {boolean}
 */
Wireframe.prototype.wireframe = true;
