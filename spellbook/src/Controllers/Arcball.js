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

  above: false,
  below: false,

  load: function() {
    this.base.load();
  },

  computeArcballSphere: function() {
    var modelArcballCenter = this.model.arcballCenter_;
    var modelArcballRadius = this.model.arcballRadius_;

    if (modelArcballCenter && modelArcballRadius) {
      // The arcball sphere is fully defined. use it.
      this.arcballCenter_ = modelArcballCenter;
      this.arcballRadius_ = modelArcballRadius;
    } else {
      // Find the average center of all meshes.
      this.arcballCenter_ = { x: 0, y: 0, z: 0 };
      this.arcballRadius_ = 0;
      var numObjects = 0;

      var geometryCenters = [];

      var sceneObjects = this.scene.objects;
      for (var i = 0, len = sceneObjects.length; i < len; ++i) {
        var sceneObject = sceneObjects[i];
        var geometry = sceneObject['geometry'];

        if (geometry) {
          var sceneObjectPosition = sceneObject.position;
          var sceneObjectScale = sceneObject.scale;
          var geometryBoundingSphereCenter = geometry.boundingSphere.center;

          var px = sceneObjectPosition.x * sceneObjectScale.x +
              geometryBoundingSphereCenter.x * sceneObjectScale.x;
          var py = sceneObjectPosition.y * sceneObjectScale.y +
              geometryBoundingSphereCenter.y * sceneObjectScale.y;
          var pz = sceneObjectPosition.z * sceneObjectScale.z +
              geometryBoundingSphereCenter.z * sceneObjectScale.z;

          geometryCenters.push([px, py, pz]);

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
      for (var i = 0, len = sceneObjects.length; i < len; ++i) {
        var sceneObject = sceneObjects[i];
        var geometry = sceneObject['geometry'];

        if (geometry) {
          var sceneObjectScale = sceneObject.scale;
          var geometryBoundingSphere = geometry.boundingSphere;

          var geometryCenter = geometryCenters[i];

          var dx = geometryCenter[0] - this.arcballCenter_.x;
          var dy = geometryCenter[1] - this.arcballCenter_.y;
          var dz = geometryCenter[2] - this.arcballCenter_.z;

          var scale = Math.max(sceneObjectScale.x,
              Math.max(sceneObjectScale.y, sceneObjectScale.z));

          var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          var radius = distance + geometryBoundingSphere.radius * scale;
          if (radius > this.arcballRadius_)
            this.arcballRadius_ = radius;
        }
      }

      // If there are relevant properties, copy them over.
      if (modelArcballCenter)
        this.arcballCenter_ = modelArcballCenter;
      if (modelArcballRadius)
        this.arcballRadius_ = modelArcballRadius;
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
var Arcball = this.Arcball = Rotatable.extend({

  name: 'Arcball',
  organization: 'spellbook',
  viewType: ArcballView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (options.arcballCenter)
      this.setArcballCenter(options.arcballCenter);

    if (typeof options.arcballRadius !== 'undefined')
      this.setArcballRadius(options.arcballRadius);

    var that = this;

    Object.defineProperty(this, 'arcballCenter', {
      get: function() { return that.arcballCenter_; },
      set: function(arcballCenter) { that.setArcballCenter(arcballCenter); },
      enumerable: true
    });

    Object.defineProperty(this, 'arcballRadius', {
      get: function() { return that.arcballRadius_; },
      set: function(arcballRadius) { that.setArcballRadius(arcballRadius); },
      enumerable: true
    });

    this.rotatingArcball_ = false;
    this.startArcballRotation_ = new THREE.Quaternion(0, 0, 0, 1);
  },

  setUpViews: function() {
    this.base.setUpViews();

    var that = this;

    this.on('mousemove', function(e) {
      if (that.rotatingArcball_) {
        var p = that.mapOntoSphere_(e.page.x, e.page.y);

        var a = new THREE.Vector3(
            that.arcballAnchorPoint_.x,
            that.arcballAnchorPoint_.y,
            that.arcballAnchorPoint_.z);

        var b = new THREE.Vector3(
            p.x,
            p.y,
            p.z);

        var axis = new THREE.Vector3();
        axis.crossVectors(a, b);
        axis.normalize();

        var dot = a.dot(b);
        var angle = Math.acos(dot);

        var q = new THREE.Quaternion(0, 0, 0, 0);
        q.setFromAxisAngle(axis, angle * 2);
        q.normalize();

        that.currentArcballRotation_ = new THREE.Quaternion(0, 0, 0, 1);
        that.currentArcballRotation_.multiplyQuaternions(
            q, that.startArcballRotation_);

        var eulerAngles = new THREE.Euler(0, 0, 0, 'XYZ');
        eulerAngles.setFromQuaternion(that.currentArcballRotation_, 'XYZ');
        that.setRotation([eulerAngles.x, eulerAngles.y, eulerAngles.z]);
      }
    });

    this.on('mousedown', function(e) {
      that.arcballSphere_ = that.view.computeArcballSphere();
      if (that.stencilView)
        that.stencilView.computeArcballSphere();

      that.arcballAnchorPoint_ = that.mapOntoSphere_(e.page.x, e.page.y);
      that.rotatingArcball_ = true;
    });

    this.on('mouseup', function() {
      that.rotatingArcball_ = false;
      that.startArcballRotation_ = that.currentArcballRotation_;
    });
  },

  mapOntoSphere_: function(x, y) {
    var arcballSphereCenter = this.arcballSphere_.center;
    var arcballSphereRadius = this.arcballSphere_.radius;

    var dx = x - arcballSphereCenter.x;
    var dy = y - arcballSphereCenter.y;

    var length2 = dx * dx + dy * dy;
    var radius2 = this.arcballSphere_.radius * this.arcballSphere_.radius;

    if (length2 < radius2) {
      var dz = Math.sqrt(radius2 - length2);
    } else {
      var length = Math.sqrt(length2);
      var scaleIn = arcballSphereRadius / length;

      dx *= scaleIn;
      dy *= scaleIn;
      dz = 0;
    }

    // Normalize
    length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return { x: dx / length, y: dy / length, z: dz / length };
  }

});


/**
 * Sets a custom center for the arcball rotations.
 *
 * @param {Object} arcballCenter Center with x, y, z properies, or null.
 *
 * @return {Arcball} This.
 */
Arcball.prototype.setArcballCenter = function(arcballCenter) {
  if (arcballCenter !== null)
    this.arcballCenter_ = parseVector3_(arcballCenter);
  else
    this.arcballCenter_ = null;

  return this;
};


/**
 * Sets a custom radius for the arcball rotations.
 *
 * @param {number} arcballRadius Radius. Must be non-negative.
 *
 * @return {Arcball} This.
 */
Arcball.prototype.setArcballRadius = function(arcballRadius) {
  log_.assert_(typeof arcballRadius === 'number',
      'arcballRadius must be a number.', arcballRadius,
      '(Arcball::setArcballRadius)');
  log_.assert_(arcballRadius >= 0,
      'arcballRadius must be non-negative.', arcballRadius,
      '(Arcball::setArcballRadius)');

  this.arcballRadius_ = arcballRadius;

  return this;
};


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
