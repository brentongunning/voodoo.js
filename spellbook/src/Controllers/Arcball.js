// ----------------------------------------------------------------------------
// File: Arcball.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the arcball rotation of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var ArcballView_ = voodoo.View.extend({

  load: function() {
    this.base.load();
  },

  beginArcballRotation: function(x, y) {
    this.computeArcballSphere();
  },

  rotateArcball: function(x, y) {
  },

  computeArcballSphere: function() {
    if (this.model.arcballCenter && this.model.arcballRadius) {
      // The arcball sphere is fully defined. use t.
      this.arcballCenter_ = this.model.arcballCenter;
      this.arcballRadius_ = this.model.arcballRadius;
    } else {
      // Find the average center of all meshes.
      this.arcballCenter_ = { x: 0, y: 0, z: 0 };
      this.arcballRadius_ = 0;
      var numObjects = 0;

      var sceneObjects = this.scene.objects;
      for (var i in sceneObjects) {
        var sceneObject = sceneObjects[i];
        var geometry = sceneObject['geometry'];

        if (geometry && typeof geometry !== 'undefined') {
          var px = sceneObject.position.x * sceneObject.scale.x;
          var py = sceneObject.position.y * sceneObject.scale.y;
          var pz = sceneObject.position.z * sceneObject.scale.z;

          this.arcballCenter_.x += px;
          this.arcballCenter_.y += py;
          this.arcballCenter_.z += pz;

          numObjects++;
        }
      }

      if (numObjects !== 0) {
        this.arcballCenter_.x /= numObjects;
        this.arcballCenter_.y /= numObjects;
        this.arcballCenter_.z /= numObjects;
      } else return;

      // Determine the radius
      for (var i in sceneObjects) {
        var sceneObject = sceneObjects[i];
        var geometry = sceneObject['geometry'];

        if (geometry && typeof geometry !== 'undefined') {
          var px = sceneObject.position.x * sceneObject.scale.x;
          var py = sceneObject.position.y * sceneObject.scale.y;
          var pz = sceneObject.position.z * sceneObject.scale.z;

          var dx = px - this.arcballCenter_.x;
          var dy = py - this.arcballCenter_.y;
          var dz = pz - this.arcballCenter_.z;

          var scale = Math.max(sceneObject.scale.x,
              Math.max(sceneObject.scale.y, sceneObject.scale.z));

          var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          var radius = distance + geometry.boundingSphere.radius * scale;
          if (radius > this.arcballRadius_)
            this.arcballRadius_ = radius;
        }
      }
    }

    this.screenCenter_ = this.scene.localToPage(this.arcballCenter_);

    this.screenRadius_ = this.scene.localToPage(
        [this.arcballCenter_.x - this.arcballRadius_, 0, 0])[0] -
        this.screenCenter_.x;
  }

});



/**
 * An arcball controller that lets the user rotate scene meshes using
 * the mouse.
 *
 * Options:
 *
 * - arcballCenter {Object} Center of the arcball sphere. If null, then
 *     this will be calculated from the aggreate bounding sphere of meshes.
 *     Default is null.
 * - arcballRadius {number} Radius of the arcball sphere. If 0, then
 *     this will be calculated from the aggegate bounding sphere of meshes.
 *     Default is 0.
 *
 *
 * @constructor
 * @extends {Rotator}
 *
 * @param {Object=} opt_options Options object.
 */
var Arcball = this.Arcball = Rotator.extend({

  name: 'Arcball',
  organization: 'spellbook',
  viewType: ArcballView_,
  stencilViewType: ArcballView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.arcballCenter = typeof options.arcballCenter !== 'undefined' ?
        options.arcballCenter : null;
    this.arcballRadius = typeof options.arcballRadius !== 'undefined' ?
        options.arcballRadius : null;

    this.rotatingArcball = false;
  },

  setUpViews: function() {
    this.base.setUpViews();

    var self = this;

    this.on('mousemove', function(e) {
      if (self.rotatingArcball) {
        self.view.rotateArcball(e.page.x, e.page.y);
        if (typeof self.stencilView !== 'undefined' && self.stencilView)
          self.stencilView.rotateArcball(e.page.x, e.page.y);
      }
    });

    this.on('mousedown', function(e) {
      self.view.beginArcballRotation(e.client.x, e.client.y);
      if (typeof self.stencilView !== 'undefined' && self.stencilView)
        self.stencilView.beginArcballRotation(e.client.x, e.client.y);
      self.rotatingArcball = true;
    });

    this.on('mouseup', function() {
      self.rotatingArcball = false;
    });
  }

});


/**
 * Center of the arcball sphere. If null, then this will be calculated from
 * the aggreate bounding sphere of meshes. Default is null.
 *
 * @type {Object}
 */
Arcball.prototype.arcballCenter = null;


/**
 * Radius of the arcball sphere. If 0, then this will be calculated from the
 * aggegate bounding sphere of meshes. Default is 0.
 *
 * @type {number}
 */
Arcball.prototype.arcballRadius = 0;
