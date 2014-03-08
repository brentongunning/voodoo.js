// ----------------------------------------------------------------------------
// File: Scaler.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the scale of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var ScalerView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      var scale = this.model.scale_;
      var objectScale = e.object.scale;
      objectScale.x = scale.x;
      objectScale.y = scale.y;
      objectScale.z = scale.z;
      this.dirty();
    });
    this.setScale(this.model.scale_);
  },

  setScale: function(scale) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i) {
      var sceneObject = sceneObjects[i];
      var sceneObjectScale = sceneObject.scale;
      sceneObjectScale.x = scale.x;
      sceneObjectScale.y = scale.y;
      sceneObjectScale.z = scale.z;
    }

    this.dirty();
  }

});



/**
 * Adds functions to scale meshes.
 *
 * Options:
 *
 * - scale {Object|number} Initial scale. This can be a scalar number, a array
 *     of length 3, or an object with x, y, and z properties.
 *
 * Events:
 *
 * - scaleBegin
 * - scaleEnd
 * - scale
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Scaler = this.Scaler = voodoo.Model.extend({

  name: 'Scaler',
  organization: 'spellbook',
  viewType: ScalerView_,
  stencilViewType: ScalerView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.scale !== 'undefined') {
      this.scale_ = this.parseScale_(options.scale);
    } else this.scale_ = { x: 1, y: 1, z: 1 };
    this.scale_ = this.fixScale_(this.scale_);

    this.startScale = {
      x: this.scale_.x,
      y: this.scale_.y,
      z: this.scale_.z
    };
    this.targetScale = {
      x: this.scale_.x,
      y: this.scale_.y,
      z: this.scale_.z
    };
    this.scaleStartTime = null;
    this.scaleDuration = 0;

    var self = this;
    var proxy = {};
    Object.defineProperty(proxy, 'x', {
      get: function() { return self.scale_.x; },
      set: function(x) { self.setScale(x, self.scale_.y, self.scale_.z); },
      enumerable: false
    });
    Object.defineProperty(proxy, 'y', {
      get: function() { return self.scale_.y; },
      set: function(y) { self.setScale(self.scale_.x, y, self.scale_.z); },
      enumerable: false
    });
    Object.defineProperty(proxy, 'z', {
      get: function() { return self.scale_.z; },
      set: function(z) { self.setScale(self.scale_.x, self.scale_.y, z); },
      enumerable: false
    });

    Object.defineProperty(this, 'scale', {
      get: function() { return proxy; },
      set: function(scale) { self.setScale(scale); },
      enumerable: false
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.scale_.x !== this.targetScale.x ||
        this.scale_.y !== this.targetScale.y ||
        this.scale_.z !== this.targetScale.z) {
      var now = new Date();
      var duration = now - this.scaleStartTime;
      var t = duration / this.scaleDuration;

      if (t < 1.0) {
        var invT = 1 - t;
        this.scale_.x = this.startScale.x * invT + this.targetScale.x * t;
        this.scale_.y = this.startScale.y * invT + this.targetScale.y * t;
        this.scale_.z = this.startScale.z * invT + this.targetScale.z * t;
      } else {
        this.scale_.x = this.targetScale.x;
        this.scale_.y = this.targetScale.y;
        this.scale_.z = this.targetScale.z;
      }

      this.dispatch(new voodoo.Event('scale', this));

      if (this.scale_.x === this.targetScale.x &&
          this.scale_.y === this.targetScale.y &&
          this.scale_.z === this.targetScale.z)
        this.dispatch(new voodoo.Event('scaleEnd', this));

      this.view.setScale(this.scale_);
      if (typeof this.stencilView !== 'undefined' && this.stencilView)
        this.stencilView.setScale(this.scale_);
    }
  }

});


/**
  * Scales all scene meshes over time.
  *
  * scale can also be specified as separate components:
  *    scaleTo(x, y, z, seconds)
  *
  * @param {number} scale Target scale.
  * @param {number} seconds Animation duration.
  *
  * @return {Scaler}
  */
Scaler.prototype.scaleTo = function(scale, seconds) {
  var endScale;
  if (arguments.length > 2) {
    endScale = { x: arguments[0], y: arguments[1], z: arguments[2] };
    seconds = arguments[3];
  } else endScale = this.parseScale_(scale);

  endScale = this.fixScale_(endScale);

  if (seconds == 0) {
    this.setScale(endScale);
  } else if (this.scale_.x !== endScale.x ||
      this.scale_.y !== endScale.y ||
      this.scale_.z !== endScale.z) {
    this.startScale.x = this.scale_.x;
    this.startScale.y = this.scale_.y;
    this.startScale.z = this.scale_.z;
    this.targetScale.x = endScale.x;
    this.targetScale.y = endScale.y;
    this.targetScale.z = endScale.z;
    this.scaleStartTime = new Date();
    this.scaleDuration = seconds * 1000;

    this.dispatch(new voodoo.Event('scaleBegin', this));
  }

  return this;
};


/**
  * Immediately changes the scale of all scene meshes.
  *
  * scale can also be specified as separate components:
  *    setScale(x, y, z)
  *
  * @param {Object|number} scale Scale.
  *
  * @return {Scaler}
  */
Scaler.prototype.setScale = function(scale) {
  if (arguments.length > 1)
    this.scale_ = { x: arguments[0], y: arguments[1], z: arguments[2] };
  else this.scale_ = this.parseScale_(scale);

  this.scale_ = this.fixScale_(this.scale_);

  this.targetScale.x = this.scale_.x;
  this.targetScale.y = this.scale_.y;
  this.targetScale.z = this.scale_.z;

  this.dispatch(new voodoo.Event('scale', this));

  this.view.setScale(this.scale_);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.setScale(this.scale_);

  return this;
};


/**
 * Get or set the scale of all scene meshes.
 *
 * Setting the scale may be done in one of four ways:
 *
 * 1. Scalar: object.scale = 1;
 * 2. Array: object.scale = [1, 1, 0.5];
 * 3. Object: object.scale = {x: 1, y: 2, z: 3};
 * 4. Component: object.scale.z = 0;
 *
 * As a getter, this object will always return an
 * object with x, y, and z properties.
 *
 * @type {Object|number}
 */
Scaler.prototype.scale = 1;


/**
 * Converts a scale parameter into an object with x, y, z properties.
 *
 * @private
 *
 * @param {Object|number} scale Scale.
 *
 * @return {Object}
 */
Scaler.prototype.parseScale_ = function(scale) {
  if (typeof scale === 'number') {
    return { x: scale, y: scale, z: scale };
  } else if (typeof scale === 'object') {
    if ('x' in scale)
      return scale;
    else return { x: scale[0], y: scale[1], z: scale[2] };
  } else return { x: 0, y: 0, z: 0 };
};


/**
 * Ensures that the scale is never 0 for any components.
 *
 * @private
 *
 * @param {Object} scale Scale.
 *
 * @return {Object}
 */
Scaler.prototype.fixScale_ = function(scale) {
  if (scale.x == 0) scale.x = 0.0000001;
  if (scale.y == 0) scale.y = 0.0000001;
  if (scale.z == 0) scale.z = 0.0000001;
  return scale;
};
