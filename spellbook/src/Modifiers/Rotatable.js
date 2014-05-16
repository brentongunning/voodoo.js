// ----------------------------------------------------------------------------
// File: Rotatable.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that rotates scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var RotatableView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      var rotation = this.model.eulerRotation_;
      var objectRotation = e.object.rotation;

      objectRotation.x = rotation.x;
      objectRotation.y = rotation.y;
      objectRotation.z = rotation.z;

      this.dirty();
    });

    this.setRotation_(this.model.eulerRotation_);
  },

  setRotation_: function(rotation) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      var sceneObjectRotation = sceneObject.rotation;

      sceneObjectRotation.x = rotation.x;
      sceneObjectRotation.y = rotation.y;
      sceneObjectRotation.z = rotation.z;
    }

    this.dirty();
  }

});



/**
 * Adds functions to rotate meshes.
 *
 * Options:
 *
 * - rotation {Object} Initial rotation. This can be an array of length 3, or
 *     an object with x, y, and z properties.
 *
 * Events:
 *
 * - rotateBegin
 * - rotateEnd
 * - rotate
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Rotatable = this.Rotatable = voodoo.Model.extend({

  name: 'Rotatable',
  organization: 'spellbook',
  viewType: RotatableView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (options.rotation)
      this.rotation_ = this.parseRotation_(options.rotation);
    else
      this.rotation_ = new THREE.Quaternion();

    this.eulerRotation_ = new THREE.Euler();
    this.eulerRotation_.setFromQuaternion(this.rotation_);

    this.startRotation_ = new THREE.Quaternion();
    this.targetRotation_ = new THREE.Quaternion();

    this.startRotation_.copy(this.rotation_);
    this.targetRotation_.copy(this.rotation_);

    this.rotationStartTime_ = null;
    this.deltaRotation_ = null;
    this.rotating_ = false;
    this.rotationDuration_ = 0;
    this.continuous_ = false;

    var that = this;
    var proxy = {};

    Object.defineProperty(proxy, 'x', {
      get: function() { return that.eulerRotation_.x; },
      set: function(x) {
        var euler = new THREE.Euler();
        euler.setFromQuaternion(that.rotation_);
        euler.x = x;
        that.setRotation([euler.x, euler.y, euler.z]);
      },
      enumerable: true
    });

    Object.defineProperty(proxy, 'y', {
      get: function() { return that.eulerRotation_.y; },
      set: function(y) {
        var euler = new THREE.Euler();
        euler.setFromQuaternion(that.rotation_);
        euler.y = y;
        that.setRotation([euler.x, euler.y, euler.z]);
      },
      enumerable: true
    });

    Object.defineProperty(proxy, 'z', {
      get: function() { return that.eulerRotation_.z; },
      set: function(z) {
        var euler = new THREE.Euler();
        euler.setFromQuaternion(that.rotation_);
        euler.z = z;
        that.setRotation([euler.x, euler.y, euler.z]);
      },
      enumerable: true
    });

    Object.defineProperty(this, 'rotation', {
      get: function() { return proxy; },
      set: function(rotation) { that.setRotation(rotation); },
      enumerable: true
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.rotating_) {

      var now = new Date();
      var duration = now - this.rotationStartTime_;
      var t = duration / this.rotationDuration_;

      if (t < 1.0) {
        var i = this.rotationEasing_(t);

        this.rotation_.copy(this.startRotation_);
        this.rotation_.slerp(this.targetRotation_, i);
        this.eulerRotation_.setFromQuaternion(this.rotation_);
      } else {
        this.rotation_.copy(this.targetRotation_);
        this.eulerRotation_.setFromQuaternion(this.rotation_);

        if (this.continuous_) {
          t = 0;
          this.startRotation_.copy(this.rotation_);
          this.targetRotation_.copy(this.deltaRotation_);
          this.targetRotation_ =
              this.targetRotation_.multiply(this.rotation_);
          this.rotationStartTime_ = new Date();
        }
      }

      this.dispatch(new voodoo.Event('rotate', this));

      if (t >= 1.0) {
        this.rotating_ = false;
        this.dispatch(new voodoo.Event('rotateEnd', this));
      }

      this.view.setRotation_(this.eulerRotation_);
      if (this.stencilView)
        this.stencilView.setRotation_(this.eulerRotation_);
    }
  }

});


/**
  * Rotates all scene meshes over time to a specific rotation.
  *
  * rotation can be specified in several ways. With euler angles:
  *
  *    rotate([x, y, z])
  *    rotate({x: 0 y: 0, z: 0})
  *
  * or as a quaternion from axis and angle.
  *
  *    rotate([x, y, z, angle])
  *    rotate({x: 0, y: 0, z: 0, angle: 0})
  *
  * @param {Object} rotation Target rotation.
  * @param {number=} opt_seconds Animation duration. If unspecified,
  *     default is 0.
  * @param {function(number):number=} opt_easing Optional easing function.
  *     Default is easing.easeInOutQuad.
  *
  * @return {Rotatable}
  */
Rotatable.prototype.rotateTo = function(rotation, opt_seconds, opt_easing) {
  if (opt_seconds) {

    // Case: Rotate over time.

    this.startRotation_.copy(this.rotation_);
    this.targetRotation_ = this.parseRotation_(rotation);

    this.deltaRotating_ = false;
    this.rotating_ = true;

    this.rotationStartTime_ = new Date();
    this.rotationDuration_ = opt_seconds * 1000;

    this.rotationEasing_ = opt_easing || Easing.prototype.easeInOutQuad;

    this.dispatch(new voodoo.Event('rotateBegin', this));

  } else {

    // Case: Rotate immediately.

    this.setRotation(rotation);

  }

  return this;
};


/**
  * Rotates all scene meshes an amount relative their current orientation.
  *
  * rotation can be specified in several ways. With euler angles:
  *
  *    rotate([x, y, z])
  *    rotate({x: 0 y: 0, z: 0})
  *
  * or as a quaternion from axis and angle.
  *
  *    rotate([x, y, z, angle])
  *    rotate({x: 0, y: 0, z: 0, angle: 0})
  *
  * @param {Object} rotation Amount to rotate.
  * @param {number=} opt_seconds Optional duration in seconds. Default is 0.
  * @param {function(number):number=} opt_easing Optional easing function.
  *     Default is easing.easeInOutQuad.
  *
  * @return {Rotatable}
  */
Rotatable.prototype.rotate = function(rotation, opt_seconds, opt_easing) {
  var delta = this.parseRotation_(rotation);
  var target = new THREE.Quaternion();
  target.copy(this.rotation_);
  target = target.multiply(delta);

  if (opt_seconds) {

    // Case: Rotate over time.

    this.startRotation_.copy(this.rotation_);
    this.targetRotation_ = target;

    this.rotating_ = true;
    this.continuous_ = false;

    this.rotationStartTime_ = new Date();
    this.rotationDuration_ = opt_seconds * 1000;

    this.rotationEasing_ = opt_easing || Easing.prototype.easeInOutQuad;

    this.dispatch(new voodoo.Event('rotateBegin', this));

  } else {

    // Case: Rotate immediately.

    this.setRotation(target);

  }

  return this;
};


/**
  * Rotates all scene meshes over time.
  *
  * rotation can be specified in several ways. With euler angles:
  *
  *    rotateContinuous([x, y, z])
  *    rotateContinuous({x: 0 y: 0, z: 0})
  *
  * or as a quaternion from axis and angle.
  *
  *    rotateContinuous([x, y, z, angle])
  *    rotateContinuous({x: 0, y: 0, z: 0, angle: 0})
  *
  * @param {Object} rotation Amount to rotate per second.
  *
  * @return {Rotatable}
  */
Rotatable.prototype.rotateContinuous = function(rotation) {
  this.deltaRotation_ = this.parseRotation_(rotation);

  var target = new THREE.Quaternion();
  target.copy(this.deltaRotation_);
  target = target.multiply(this.rotation_);

  this.startRotation_.copy(this.rotation_);
  this.targetRotation_.copy(target);

  this.rotating_ = true;
  this.continuous_ = true;

  this.rotationStartTime_ = new Date();
  this.rotationDuration_ = 1000;
  this.rotationEasing_ = Easing.prototype.linear;

  this.dispatch(new voodoo.Event('rotateBegin', this));

  return this;
};


/**
  * Immediately changes the rotation of all scene meshes.
  *
  * rotation can be specified in several ways. With euler angles:
 *
 *    setRotation([x, y, z])
 *    setRotation({x: 0 y: 0, z: 0})
 *
 * or as a quaternion from axis and angle.
 *
 *    setRotation([x, y, z, angle])
 *    setRotation({x: 0, y: 0, z: 0, angle: 0})
  *
  * @param {Object} rotation Rotation.
  *
  * @return {Rotatable}
  */
Rotatable.prototype.setRotation = function(rotation) {
  this.rotation_ = this.parseRotation_(rotation);
  this.eulerRotation_.setFromQuaternion(this.rotation_);
  this.targetRotation_.copy(this.rotation_);

  this.continuous_ = false;
  this.rotating_ = false;

  this.dispatch(new voodoo.Event('rotate', this));

  this.view.setRotation_(this.eulerRotation_);
  if (this.stencilView)
    this.stencilView.setRotation_(this.eulerRotation_);

  return this;
};


/**
 * Get or set the rotation of all scene meshes.
 *
 * Setting the rotation may be done in one of three ways:
 *
 * 1. Array: object.rotation = [1, 1, 0.5];
 * 2. Object: object.rotation = {x: 1, y: 2, z: 3};
 * 3. Component: object.rotation.z = 0;
 *
 * As a getter, this object will always return an
 * euler angle object with x, y, z properties.
 *
 * @type {Object}
 */
Rotatable.prototype.rotation = null;


/**
 * Converts a rotation parameter into a quaternion with x, y, z, w properties.
 *
 * rotation can be specified in several ways. With euler angles:
 *
 *    rotate([x, y, z])
 *    rotate({x: 0 y: 0, z: 0})
 *
 * or as a quaternion from axis and angle.
 *
 *    rotate([x, y, z, angle])
 *    rotate({x: 0, y: 0, z: 0, angle: 0})
 *
 * @private
 *
 * @param {Object} rotation Rotation.
 *
 * @return {THREE.Quaternion}
 */
Rotatable.prototype.parseRotation_ = function(rotation) {
  var quaternion = new THREE.Quaternion();

  if (Array.isArray(rotation)) {
    if (rotation.length === 3) {

      // Case: rotate([x, y, z])
      var euler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
      quaternion.setFromEuler(euler);

    } else if (rotation.length === 4) {

      // Case: rotate([x, y, z, angle])
      var axis = new THREE.Vector3(rotation[0], rotation[1], rotation[2]);
      axis.normalize();
      quaternion.setFromAxisAngle(axis, rotation[3]);

    } else {

      log_.error_('Unable to parse rotation: Incorrect number of elements.');

    }
  } else if (typeof rotation === 'object') {
    log_.assert_('x' in rotation, 'Property x is undefined');
    log_.assert_('y' in rotation, 'Property y is undefined');
    log_.assert_('z' in rotation, 'Property z is undefined');

    if ('angle' in rotation) {

      // Case rotate({x: 0, y: 0, z: 0, angle: 0})
      var axis = new THREE.Vector3(rotation[0], rotation[1], rotation[2]);
      axis.normalize();
      quaternion.setFromAxisAngle(axis, rotation.angle);

    } else if ('w' in rotation) {

      // Case: Quaternion
      quaternion = new THREE.Quaternion(
          rotation.x, rotation.y, rotation.z, rotation.w);

    } else {

      // Case: rotate({x: 0, y: 0, z: 0})
      var euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
      quaternion.setFromEuler(euler);

    }
  } else {

    log_.error_('Unable to parse rotation: Must be array or object.');

  }

  quaternion.normalize();

  return quaternion;
};
