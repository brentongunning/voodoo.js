// ----------------------------------------------------------------------------
// File: Colorer.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the color of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var ColorerView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      this.setColorToMesh(e.object, this.model.threeJsColor_);
      this.dirty();
    });

    this.setColor(this.model.threeJsColor_);
  },

  setColor: function(color) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.setColorToMesh(sceneObject, color);
    }

    this.dirty();
  },

  /**
   * Sets a color on a mesh.
   *
   * @private
   *
   * @param {THREE.Mesh} mesh Mesh.
   * @param {THREE.Color} color Color.
   */
  setColorToMesh: function(mesh, color) {
    var material = mesh.material;
    if (material) {
      var materials = material.materials;
      if (materials) {
        for (var i = 0, len = materials.length; i < len; ++i) {
          var subMaterial = materials[i];
          if (subMaterial.color)
            subMaterial.color.copy(color);
        }
      }

      if (material.color)
        material.color.copy(color);
    }
  }

});



/**
 * Adds functions to change the color of meshes.
 *
 * Options:
 *
 * - color {string} Initial color using CSS notation. Default is white.
 *
 * Events:
 *
 * - changeColor
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Colorer = this.Colorer = voodoo.Model.extend({

  name: 'Colorer',
  organization: 'spellbook',
  viewType: ColorerView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.color_ = options.color || 'white';
    this.threeJsColor_ =
        voodoo.utility.convertCssColorToThreeJsColor(this.color_);

    var that = this;
    Object.defineProperty(this, 'color', {
      get: function() { return that.color_; },
      set: function(color) { that.setColor(color); },
      enumerable: false
    });
  }

});


/**
  * Immediately changes the color of all scene meshes.
  *
  * @param {string} color Css color string.
  *
  * @return {Colorer}
  */
Colorer.prototype.setColor = function(color) {
  if (color !== this.color_) {

    this.color_ = color;
    this.threeJsColor_ =
        voodoo.utility.convertCssColorToThreeJsColor(color);

    this.dispatch(new voodoo.Event('changeColor', this));

    this.view.setColor(this.threeJsColor_);
    if (this.stencilView)
      this.stencilView.setColor(this.threeJsColor_);

  }

  return this;
};


/**
 * Get or set the color of all scene meshes. Default is white.
 *
 * @type {string}
 */
Colorer.prototype.color = 'white';
