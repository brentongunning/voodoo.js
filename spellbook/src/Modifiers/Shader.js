// ----------------------------------------------------------------------------
// File: Shader.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the shading of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var ShaderView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      this.setAmbientToMesh(e.object, this.model.threeJsAmbient_);
      this.setEmissiveToMesh(e.object, this.model.threeJsEmissive_);
      this.setShadingToMesh(e.object, this.model.shading_);

      this.dirty();
    });

    this.setAmbient(this.model.threeJsAmbient_);
    this.setEmissive(this.model.threeJsEmissive_);
    this.setShading(this.model.shading_);
  },

  setAmbient: function(ambient, emissive, shadingType) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.setAmbientToMesh(sceneObject, ambient);
    }

    this.dirty();
  },

  setEmissive: function(emissive) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.setEmissiveToMesh(sceneObject, emissive);
    }

    this.dirty();
  },

  setShading: function(shading) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.setShadingToMesh(sceneObject, shading);
    }

    this.dirty();
  },

  setAmbientToMesh: function(mesh, ambient) {
    var material = mesh.material;
    if (material) {
      var materials = material.materials;
      if (materials) {
        for (var i = 0, len = materials.length; i < len; ++i) {
          var subMaterial = materials[i];
          if (typeof subMaterial.ambient !== 'undefined')
            subMaterial.ambient.copy(ambient);
        }
      }

      if (material.ambient)
        material.ambient.copy(ambient);
    }
  },

  setEmissiveToMesh: function(mesh, emissive) {
    var material = mesh.material;
    if (material) {
      var materials = material.materials;
      if (materials) {
        for (var i = 0, len = materials.length; i < len; ++i) {
          var subMaterial = materials[i];
          if (subMaterial.emissive)
            subMaterial.emissive.copy(emissive);
        }
      }

      if (material.emissive)
        material.emissive.copy(emissive);
    }
  },

  setShadingToMesh: function(mesh, shading) {
    var threeJsShading = THREE.SmoothShading;
    if (shading === Shader.ShadingStyle.Flat)
      threeJsShading = THREE.FlatShading;
    else if (shading === Shader.ShadingStyle.None)
      threeJsShading = THREE.NoShading;

    var material = mesh.material;
    if (material) {
      var materials = material.materials;
      if (materials) {
        for (var i = 0, len = materials.length; i < len; ++i) {
          var subMaterial = materials[i];
          if (typeof subMaterial.shading !== 'undefined')
            subMaterial.shading = threeJsShading;
        }
      }

      if (typeof material.shading !== 'undefined')
        material.shading = threeJsShading;
    }

    var geometry = mesh.geometry;
    if (geometry) {
      geometry.morphTargetsNeedUpdate = true;
      geometry.normalsNeedUpdate = true;
    }
  }

});



/**
 * Adds functions to change the shading properties of meshes.
 *
 * Options:
 *
 * - ambient {string=} Initial ambient using CSS notation. Default is black.
 * - emissive {string=} Initial emissive using CSS notation. Default is black.
 * - shading {(Shader.ShadingStyle|string)=} Initial shading type. Default is
 *     smooth.
 *
 * Events:
 *
 * - changeAmbient
 * - changeEmissive
 * - changeShading
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Shader = this.Shader = voodoo.Model.extend({

  name: 'Shader',
  organization: 'spellbook',
  viewType: ShaderView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.ambient_ = options.ambient || 'black';
    this.threeJsAmbient_ =
        voodoo.utility.convertCssColorToThreeJsColor(this.ambient_);

    this.emissive_ = options.emissive || 'black';
    this.threeJsEmissive_ =
        voodoo.utility.convertCssColorToThreeJsColor(this.emissive_);

    this.shading_ = options.shading || Shader.ShadingStyle.Smooth;

    var that = this;

    Object.defineProperty(this, 'ambient', {
      get: function() { return that.ambient_; },
      set: function(ambient) { that.setAmbient(ambient); },
      enumerable: false
    });

    Object.defineProperty(this, 'emissive', {
      get: function() { return that.emissive_; },
      set: function(emissive) { that.setEmissive(emissive); },
      enumerable: false
    });

    Object.defineProperty(this, 'shading', {
      get: function() { return that.shading_; },
      set: function(shading) { that.setShading(shading); },
      enumerable: false
    });
  }

});


/**
  * Immediately changes the ambient color of all scene meshes.
  *
  * @param {string} ambient Css color string.
  *
  * @return {Shader}
  */
Shader.prototype.setAmbient = function(ambient) {
  if (ambient !== this.ambient_) {
    this.ambient_ = ambient;
    this.threeJsAmbient_ =
        voodoo.utility.convertCssColorToThreeJsColor(ambient);

    this.dispatch(new voodoo.Event('changeAmbient', this));

    this.view.setAmbient(this.threeJsAmbient_);
    if (this.stencilView)
      this.stencilView.setAmbient(this.threeJsAmbient_);
  }

  return this;
};


/**
  * Immediately changes the emissive color of all scene meshes.
  *
  * @param {string} emissive Css color string.
  *
  * @return {Shader}
  */
Shader.prototype.setEmissive = function(emissive) {
  if (emissive !== this.emissive_) {
    this.emissive_ = emissive;
    this.threeJsEmissive_ =
        voodoo.utility.convertCssColorToThreeJsColor(emissive);

    this.dispatch(new voodoo.Event('changeEmissive', this));

    this.view.setEmissive(this.threeJsEmissive_);
    if (this.stencilView)
      this.stencilView.setEmissive(this.threeJsEmissive_);
  }

  return this;
};


/**
  * Immediately changes the shading style of all scene meshes.
  *
  * @param {Shader.ShadingStyle|string} shading Shading style.
  *
  * @return {Shader}
  */
Shader.prototype.setShading = function(shading) {
  if (shading !== this.shading_) {
    this.shading_ = shading;

    this.dispatch(new voodoo.Event('changeShading', this));

    this.view.setShading(this.shading_);
    if (this.stencilView)
      this.stencilView.setShading(this.shading_);
  }

  return this;
};


/**
 * Get or set the ambient color of all scene meshes. Default is black.
 *
 * @type {string}
 */
Shader.prototype.ambient = 'black';


/**
 * Get or set the ambient color of all scene meshes. Default is black.
 *
 * @type {string}
 */
Shader.prototype.emissive = 'black';


/**
 * Enumeration for the different ways of shading the geometry.
 *
 * @enum {string}
 */
Shader.ShadingStyle = {
  Smooth: 'smooth',
  Flat: 'flat',
  None: 'none'
};


/**
 * Get or set the ambient color of all scene meshes. Default is smooth.
 *
 * @type {Shader.ShadingStyle|string}
 */
Shader.prototype.shading = 'smooth;';
