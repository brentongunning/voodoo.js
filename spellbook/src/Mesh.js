// ----------------------------------------------------------------------------
// File: Mesh.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that loads a mesh from a file.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var MeshView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.loaded = false;

    if (this.model.format === Mesh.Format.JSON)
      this.loadJson();
  },

  loadJson: function() {
    var self = this;
    var loader = new THREE.JSONLoader();
    loader.load(this.model.mesh, function(geometry, materials) {
      var mesh;

      if (self.model.animated) {
        var material = materials[0];
        material.morphTargets = true;
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.MorphAnimMesh(geometry, faceMaterial);
      } else {
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.Mesh(geometry, faceMaterial);
      }

      self.scene.add(mesh);
      self.scene.attach(self.model.element, self.model.center,
          self.model.pixelScale);
      self.loaded = true;
    });
  }

});



/**
 * A 3D mesh loaded from a file.
 *
 * Options:
 *
 * - element {HTMLElement} HTML element to attach to.
 * - mesh {string}  3D mesh file to load.
 * - format {Mesh.Format} Mesh file format. Default is JSON.
 * - animated {boolean} Whether the mesh supports animations. Default is true.
 * - center {boolean} Whether to center the mesh in the element. Default is
 *     true.
 * - pixelScale {boolean} Whether the unit's scale is pixels or units that
 *     scale with the element. Default is true.
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Mesh = this.Mesh = voodoo.Model.extend({

  name: 'Mesh',
  organization: 'spellbook',
  viewType: MeshView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.element = options.element;
    if (typeof options.element === 'undefined')
      throw '[Mesh] element must be defined';

    this.mesh = options.mesh;
    if (typeof options.mesh === 'undefined')
      throw '[Mesh] mesh must be defined';
    this.format = typeof options.format !== 'undefined' ?
        options.format : Mesh.Format.JSON;

    this.animated = typeof options.animated !== 'undefined' ?
        options.animated : true;
    this.center = typeof options.center !== 'undefined' ?
        options.center : true;
    this.pixelScale = typeof options.pixelScale !== 'undefined' ?
        options.pixelScale : true;
  }

});


/**
 * Enumeration for the file format.
 *
 * @enum {number}
 */
Mesh.Format = {
  JSON: 1
};
