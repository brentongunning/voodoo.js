// ----------------------------------------------------------------------------
// File: Scalable.js
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
var ScalableView_ = voodoo.View.extend({

  above: false,
  below: false,

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

    this.setScale_(this.model.scale_);
  },

  setScale_: function(scale) {
    log_.assert_(scale, 'scale must be valid.',
        '(ScalableView_::setScale_)');

    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
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
var Scalable = this.Scalable = voodoo.Model.extend({

  name: 'Scalable',
  organization: 'spellbook',
  viewType: ScalableView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.scale !== 'undefined')
      this.scale_ = this.parseScale_(options.scale);
    else
      this.scale_ = { x: 1, y: 1, z: 1 };

    this.scale_ = this.fixScale_(this.scale_);

    this.startScale_ = {
      x: this.scale_.x,
      y: this.scale_.y,
      z: this.scale_.z
    };

    this.targetScale_ = {
      x: this.scale_.x,
      y: this.scale_.y,
      z: this.scale_.z
    };

    this.scaleStartTime_ = null;
    this.scaleDuration_ = 0;
    this.scaling_ = false;
    this.scaleElapsed_ = 0;

    var that = this;
    var proxy = {};

    Object.defineProperty(this, 'scaling', {
      get: function() { return that.scaling_; },
      set: function(scaling) { that.setScaling(scaling); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'x', {
      get: function() { return that.scale_.x; },
      set: function(x) { that.setScale(x, that.scale_.y, that.scale_.z); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'y', {
      get: function() { return that.scale_.y; },
      set: function(y) { that.setScale(that.scale_.x, y, that.scale_.z); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'z', {
      get: function() { return that.scale_.z; },
      set: function(z) { that.setScale(that.scale_.x, that.scale_.y, z); },
      enumerable: true
    });

    Object.defineProperty(this, 'scale', {
      get: function() { return proxy; },
      set: function(scale) { that.setScale(scale); },
      enumerable: true
    });

    Object.defineProperty(this, 'targetScale', {
      get: function() { return {
        x: that.targetScale_.x,
        y: that.targetScale_.y,
        z: that.targetScale_.z
      }; },
      enumerable: true
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.scaling_) {
      var now = new Date();
      var duration = now - this.scaleStartTime_;
      var t = duration / this.scaleDuration_;

      if (t < 1.0) {
        var i = this.scaleEasing_(t);
        var invI = 1 - i;

        this.scale_.x = this.startScale_.x * invI + this.targetScale_.x * i;
        this.scale_.y = this.startScale_.y * invI + this.targetScale_.y * i;
        this.scale_.z = this.startScale_.z * invI + this.targetScale_.z * i;
      } else {
        this.scale_.x = this.targetScale_.x;
        this.scale_.y = this.targetScale_.y;
        this.scale_.z = this.targetScale_.z;
      }

      this.dispatch(new voodoo.Event('scale', this));

      if (t >= 1.0) {
        this.scaling_ = false;
        this.scaleElapsed_ = 0;
        this.scaleDuration_ = 0;

        this.startScale_.x = this.scale_.x;
        this.startScale_.y = this.scale_.y;
        this.startScale_.z = this.scale_.z;

        this.dispatch(new voodoo.Event('scaleEnd', this));
      }

      this.view.setScale_(this.scale_);
      if (this.stencilView)
        this.stencilView.setScale_(this.scale_);
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
  * @param {function(number):number=} opt_easing Optional easing function.
  *     Default is easing.easeInOutQuad.
  *
  * @return {Scalable}
  */
Scalable.prototype.scaleTo = function(scale, seconds, opt_easing) {
  var endScale;
  if (arguments.length > 2 && typeof arguments[2] === 'number') {
    endScale = { x: arguments[0], y: arguments[1], z: arguments[2] };
    seconds = arguments[3];
    opt_easing = arguments[4];
  } else {
    endScale = this.parseScale_(scale);
  }

  endScale = this.fixScale_(endScale);

  log_.assert_(typeof seconds === 'number', 'seconds must be a number.',
      '(Scalable::scaleTo)');
  log_.assert_(seconds >= 0, 'seconds must be >= 0.',
      '(Scalable::scaleTo)');

  if (seconds === 0) {

    this.setScale(endScale);

  } else if (this.scale_.x !== endScale.x ||
      this.scale_.y !== endScale.y ||
      this.scale_.z !== endScale.z) {

    this.startScale_.x = this.scale_.x;
    this.startScale_.y = this.scale_.y;
    this.startScale_.z = this.scale_.z;

    this.targetScale_.x = endScale.x;
    this.targetScale_.y = endScale.y;
    this.targetScale_.z = endScale.z;

    this.scaleStartTime_ = new Date();
    this.scaleDuration_ = seconds * 1000;
    this.scaleElapsed_ = 0;
    this.scaling_ = true;

    this.scaleEasing_ = opt_easing || Easing.prototype.easeInOutQuad;

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
  * @return {Scalable}
  */
Scalable.prototype.setScale = function(scale) {
  log_.assert_(scale, 'scale must be valid.',
      '(Movable::setScale)');

  if (arguments.length > 1)
    this.scale_ = { x: arguments[0], y: arguments[1], z: arguments[2] };
  else
    this.scale_ = this.parseScale_(scale);

  this.scale_ = this.fixScale_(this.scale_);

  this.targetScale_.x = this.scale_.x;
  this.targetScale_.y = this.scale_.y;
  this.targetScale_.z = this.scale_.z;

  this.scaling_ = false;
  this.scaleElapsed_ = 0;
  this.scaleDuration_ = 0;

  this.dispatch(new voodoo.Event('scale', this));

  this.view.setScale_(this.scale_);
  if (this.stencilView)
    this.stencilView.setScale_(this.scale_);

  return this;
};


/**
 * Sets whether we are currently scaling. This may be used to pause and
 * resume animations.
 *
 * @param {boolean} scaling Whether to enable or disable scaling.
 *
 * @return {Scalable}
 */
Scalable.prototype.setScaling = function(scaling) {
  if (!scaling && this.scaling_) {

    this.scaling_ = false;
    this.scaleElapsed_ = new Date() - this.scaleStartTime_;

  } else if (scaling && !this.scaling_) {

    this.scaling_ = true;
    this.scaleStartTime_ = new Date() - this.scaleElapsed_;

  }

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
 * As a getter, this will always return an
 * object with x, y, and z properties.
 *
 * @type {Object|number}
 */
Scalable.prototype.scale = 1;


/**
 * Gets or sets whether we are currently animating between scales.
 *
 * @type {boolean}
 */
Scalable.prototype.scaling = false;


/**
 * Gets the target scale of all scene meshes. Readonly
 *
 * Returns an object with x, y, and z properties.
 *
 * @type {Object}
 */
Scalable.prototype.targetScale = null;


/**
 * Converts a scale parameter into an object with x, y, z properties.
 *
 * @private
 *
 * @param {Object|number} scale Scale.
 *
 * @return {Object}
 */
Scalable.prototype.parseScale_ = function(scale) {
  if (typeof scale === 'number')
    return { x: scale, y: scale, z: scale };
  else
    return parseVector3_(scale);
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
Scalable.prototype.fixScale_ = function(scale) {
  if (scale.x === 0) scale.x = 0.0000001;
  if (scale.y === 0) scale.y = 0.0000001;
  if (scale.z === 0) scale.z = 0.0000001;

  return scale;
};
