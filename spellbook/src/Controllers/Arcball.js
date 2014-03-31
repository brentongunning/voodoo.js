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

  computeArcballSphere: function() {
    if (this.model.arcballCenter !== null && this.model.arcballRadius !== 0) {
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
          var px = sceneObject.position.x * sceneObject.scale.x +
              geometry.boundingSphere.center.x * sceneObject.scale.x;
          var py = sceneObject.position.y * sceneObject.scale.y +
              geometry.boundingSphere.center.y * sceneObject.scale.y;
          var pz = sceneObject.position.z * sceneObject.scale.z +
              geometry.boundingSphere.center.z * sceneObject.scale.z;

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
          var px = sceneObject.position.x * sceneObject.scale.x +
              geometry.boundingSphere.center.x * sceneObject.scale.x;
          var py = sceneObject.position.y * sceneObject.scale.y +
              geometry.boundingSphere.center.y * sceneObject.scale.y;
          var pz = sceneObject.position.z * sceneObject.scale.z +
              geometry.boundingSphere.center.z * sceneObject.scale.z;

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

      if (this.model.arcballCenter !== null)
        this.arcballCenter_ = this.model.arcballCenter;
      if (this.model.arcballRadius !== 0)
        this.arcballRadius_ = this.model.arcballRadius;
    }

    var center = this.scene.localToPage(this.arcballCenter_);
    return {
      center: center,
      radius: Math.abs(this.scene.localToPage(
          [this.arcballCenter_.x - this.arcballRadius_, 0, 0])[0] -
          center.x)
    };
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
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Arcball = this.Arcball = Rotator.extend({

  name: 'Arcball',
  organization: 'spellbook',
  viewType: ArcballView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.arcballCenter = typeof options.arcballCenter !== 'undefined' ?
        options.arcballCenter : null;
    this.arcballRadius = typeof options.arcballRadius !== 'undefined' ?
        options.arcballRadius : 0;

    this.rotatingArcball = false;
    this.startArcballRotation_ = new THREE.Quaternion(0, 0, 0, 1);
  },

  setUpViews: function() {
    this.base.setUpViews();

    var self = this;

    this.on('mousemove', function(e) {
      if (self.rotatingArcball) {
        var p = self.mapOntoSphere_(e.page.x, e.page.y);

        var a = new THREE.Vector3(self.arcballAnchorPoint_.x,
            self.arcballAnchorPoint_.y, self.arcballAnchorPoint_.z);
        var b = new THREE.Vector3(p.x, p.y, p.z);
        var axis = new THREE.Vector3();
        axis.crossVectors(a, b);
        axis.normalize();
        var dot = a.dot(b);
        var angle = Math.acos(dot);

        var q = new THREE.Quaternion(0, 0, 0, 0);
        q.setFromAxisAngle(axis, angle * 2);
        q.normalize();

        self.currentArcballRotation_ = new THREE.Quaternion(0, 0, 0, 1);
        self.currentArcballRotation_.multiplyQuaternions(
            q, self.startArcballRotation_);

        var eulerAngles = new THREE.Euler(0, 0, 0, 'XYZ');
        eulerAngles.setFromQuaternion(self.currentArcballRotation_, 'XYZ');
        self.setRotation(eulerAngles.x, eulerAngles.y, eulerAngles.z);
      }
    });

    this.on('mousedown', function(e) {
      self.arcballSphere_ = self.view.computeArcballSphere();
      if (self.stencilView)
        self.stencilView.computeArcballSphere();
      self.arcballAnchorPoint_ = self.mapOntoSphere_(e.page.x, e.page.y);
      self.rotatingArcball = true;
    });

    this.on('mouseup', function() {
      self.rotatingArcball = false;
      self.startArcballRotation_ = self.currentArcballRotation_;
    });
  },

  mapOntoSphere_: function(x, y) {
    var dx = x - this.arcballSphere_.center.x;
    var dy = y - this.arcballSphere_.center.y;

    var length2 = dx * dx + dy * dy;
    var radius2 = this.arcballSphere_.radius * this.arcballSphere_.radius;

    if (length2 < radius2) {
      var dz = Math.sqrt(radius2 - length2);
    } else {
      var length = Math.sqrt(length2);
      dx *= this.arcballSphere_.radius / length2;
      dy *= this.arcballSphere_.radius / length2;
      var dz = 0;
    }

    length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return { x: dx / length, y: dy / length, z: dz / length };
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
