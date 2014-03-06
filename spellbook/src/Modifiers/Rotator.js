// ----------------------------------------------------------------------------
// File: Rotator.js
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
var RotatorView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      var rotation = this.model.rotation_;
      var objectRotation = e.object.rotation;
      objectRotation.x = rotation.x;
      objectRotation.y = rotation.y;
      objectRotation.z = rotation.z;
      this.dirty();
    });
  },

  setRotation: function(rotation) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i) {
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
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Rotator = this.Rotator = voodoo.Model.extend({

  name: 'Rotator',
  organization: 'spellbook',
  viewType: RotatorView_,
  stencilViewType: RotatorView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.rotation !== 'undefined') {
      this.rotation_ = this.parseRotation_(options.rotation);
    } else this.rotation_ = { x: 0, y: 0, z: 0 };

    this.startRotation = {
      x: this.rotation_.x,
      y: this.rotation_.y,
      z: this.rotation_.z
    };
    this.targetRotation = {
      x: this.rotation_.x,
      y: this.rotation_.y,
      z: this.rotation_.z
    };
    this.rotationStartTime = null;
    this.deltaRotating_ = false;
    this.rotationDuration = 0;

    var self = this;
    var proxy = {};
    Object.defineProperty(proxy, 'x', {
      get: function() { return self.rotation_.x; },
      set: function(x) { self.setRotation(x, self.rotation_.y,
          self.rotation_.z); },
      writeable: false
    });
    Object.defineProperty(proxy, 'y', {
      get: function() { return self.rotation_.y; },
      set: function(y) { self.setRotation(self.rotation_.x, y,
          self.rotation_.z); },
      writeable: false
    });
    Object.defineProperty(proxy, 'z', {
      get: function() { return self.rotation_.z; },
      set: function(z) { self.setRotation(self.rotation_.x,
          self.rotation_.y, z); },
      writeable: false
    });

    Object.defineProperty(this, 'rotation', {
      get: function() { return proxy; },
      set: function(rotation) { this.setRotation(rotation); },
      writeable: false
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.deltaRotating_) {
      this.rotation_.x += this.deltaRotation_.x * deltaTime;
      this.rotation_.y += this.deltaRotation_.y * deltaTime;
      this.rotation_.z += this.deltaRotation_.z * deltaTime;
      this.rotation_ = this.clampRotation_(this.rotation_);

      this.view.setRotation(this.rotation_);
      if (typeof this.stencilView !== 'undefined' && this.stencilView)
        this.stencilView.setRotation(this.rotation_);
    } else {
      if (this.rotation_.x !== this.targetRotation.x ||
          this.rotation_.y !== this.targetRotation.y ||
          this.rotation_.z !== this.targetRotation.z) {
        var now = new Date();
        var duration = now - this.rotationStartTime;
        var t = duration / this.rotationDuration;

        if (t < 1.0) {
          var invT = 1 - t;
          this.rotation_.x = this.startRotation.x * invT +
              this.targetRotation.x * t;
          this.rotation_.y = this.startRotation.y * invT +
              this.targetRotation.y * t;
          this.rotation_.z = this.startRotation.z * invT +
              this.targetRotation.z * t;
        } else {
          this.rotation_.x = this.targetRotation.x;
          this.rotation_.y = this.targetRotation.y;
          this.rotation_.z = this.targetRotation.z;
        }

        if (this.rotation_.x === this.targetRotation.x &&
            this.rotation_.y === this.targetRotation.y &&
            this.rotation_.z === this.targetRotation.z)
          this.dispatch(new voodoo.Event('rotateEnd', this));

        this.view.setRotation(this.rotation_);
        if (typeof this.stencilView !== 'undefined' && this.stencilView)
          this.stencilView.setRotation(this.rotation_);
      }
    }
  }

});


/**
  * Rotates all scene meshes over time to a specific rotation.
  *
  * rotation can also be specified as separate components:
  *    rotateTo(x, y, z, seconds)
  *
  * @param {Object} rotation Target rotation.
  * @param {number} seconds Animation duration.
  *
  * @return {Rotator}
  */
Rotator.prototype.rotateTo = function(rotation, seconds) {
  var endRotation;
  if (arguments.length > 2) {
    endRotation = { x: arguments[0], y: arguments[1], z: arguments[2] };
    seconds = arguments[3];
  } else endRotation = this.parseRotation_(rotation);

  if (seconds == 0) {
    this.setRotation(endRotation);
  } else if (this.rotation_.x !== endRotation.x ||
      this.rotation_.y !== endRotation.y ||
      this.rotation_.z !== endRotation.z) {
    this.startRotation.x = this.rotation_.x;
    this.startRotation.y = this.rotation_.y;
    this.startRotation.z = this.rotation_.z;
    this.targetRotation.x = endRotation.x;
    this.targetRotation.y = endRotation.y;
    this.targetRotation.z = endRotation.z;
    this.rotationStartTime = new Date();
    this.deltaRotating_ = false;
    this.rotationDuration = seconds * 1000;

    this.dispatch(new voodoo.Event('rotateBegin', this));
  }

  return this;
};


/**
  * Rotates all scene meshes from their current orientation.
  *
  * deltaRotation can also be specified as separate components:
  *    rotate(x, y, z)
  *
  * @param {Object} deltaRotation Amount to rotate, either instantaniously or
  *     per second depending on the continuous parameter.
  * @param {boolean} continuous Whether to rotate continuously over time, or
  *     instantly if false. Default is false.
  *
  * @return {Rotator}
  */
Rotator.prototype.rotate = function(deltaRotation, continuous) {
  if (arguments.length > 1) {
    this.deltaRotation_ = {
      x: arguments[0],
      y: arguments[1],
      z: arguments[2]
    };
  } else this.deltaRotation_ = this.parseRotation_(deltaRotation);

  if (typeof continuous !== 'undefined' && continuous) {
    this.deltaRotating_ = true;
    this.dispatch(new voodoo.Event('rotateBegin', this));
  } else {
    var rotation = {
      x: this.rotation_.x + this.deltaRotation_.x,
      y: this.rotation_.y + this.deltaRotation_.y,
      z: this.rotation_.z + this.deltaRotation_.z
    };

    rotation = this.clampRotation_(rotation);
    this.setRotation(rotation);
  }

  return this;
};


/**
  * Immediately changes the rotation of all scene meshes.
  *
  * rotation can also be specified as separate components:
  *    setRotation(x, y, z)
  *
  * @param {Object} rotation Rotation.
  *
  * @return {Rotator}
  */
Rotator.prototype.setRotation = function(rotation) {
  if (arguments.length > 1)
    this.rotation_ = { x: arguments[0], y: arguments[1], z: arguments[2] };
  else this.rotation_ = this.parseRotation_(rotation);

  this.targetRotation.x = this.rotation_.x;
  this.targetRotation.y = this.rotation_.y;
  this.targetRotation.z = this.rotation_.z;
  this.deltaRotating_ = false;

  this.view.setRotation(this.rotation_);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.setRotation(this.rotation_);

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
 * object with x, y, and z properties.
 *
 * @type {Object}
 */
Rotator.prototype.rotation = null;


/**
 * Converts a rotation parameter into an object with x, y, z properties.
 *
 * @private
 *
 * @param {Object} rotation Rotation.
 *
 * @return {Object}
 */
Rotator.prototype.parseRotation_ = function(rotation) {
  if (typeof rotation === 'object') {
    if ('x' in rotation)
      return rotation;
    else return { x: rotation[0], y: rotation[1], z: rotation[2] };
  } else return { x: 0, y: 0, z: 0 };
};


/**
 * Ensures that the rotation is always between 0 and 2pi.
 *
 * @private
 *
 * @param {Object} rotation Rotation.
 *
 * @return {Object}
 */
Rotator.prototype.clampRotation_ = function(rotation) {
  var twoPi = Math.PI * 2.0;
  rotation.x = rotation.x % twoPi;
  rotation.y = rotation.y % twoPi;
  rotation.z = rotation.z % twoPi;
  return rotation;
};
