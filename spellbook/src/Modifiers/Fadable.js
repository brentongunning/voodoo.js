// ----------------------------------------------------------------------------
// File: Fadable.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the alpha values of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var FadableView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      var objectMaterial = e.object.material;

      if (objectMaterial)
        objectMaterial.opacity = this.model.alpha_;

      this.dirty();
    });

    this.setAlpha_(this.model.alpha_);
  },

  setAlpha_: function(alpha) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      if (sceneObject.material)
        sceneObject.material.opacity = alpha;
    }

    this.dirty();
  }

});



/**
 * The stencil view that controls the alpha values of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var FadableStencilView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      e.object.visible = this.model.alpha_ > 0;
    });
  },

  setAlpha_: function(alpha) {
    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i)
      sceneObjects[i].visible = alpha > 0;

    this.dirty();
  }

});



/**
 * Adds functions to fade in and out meshes.
 *
 * Options:
 *
 * - alpha {number} Initial alpha value. Default is 0.
 *
 * Events:
 *
 * - fadeBegin
 * - fadeEnd
 * - alphaChange
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Fadable = this.Fadable = voodoo.Model.extend({

  name: 'Fadable',
  organization: 'spellbook',
  viewType: FadableView_,
  stencilViewType: FadableStencilView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.alpha !== 'undefined') {

      log_.assert_(options.alpha >= 0 && options.alpha <= 1,
          'alpha must be between 0 and 1.',
          options.alpha, '(Fadable::setAlpha)');

      this.alpha_ = options.alpha;

    } else {

      this.alpha_ = 0;

    }

    this.startAlpha_ = this.alpha_;
    this.targetAlpha_ = this.alpha_;

    this.fadeStartTime_ = null;
    this.fadeDuration_ = 0;
    this.fading_ = false;
    this.fadeElapsed_ = 0;

    var that = this;

    Object.defineProperty(this, 'alpha', {
      get: function() { return that.alpha_; },
      set: function(alpha) { that.setAlpha(alpha); },
      enumerable: true
    });

    Object.defineProperty(this, 'targetAlpha', {
      get: function() { return that.targetAlpha_; },
      enumerable: true
    });

    Object.defineProperty(this, 'fading', {
      get: function() { return that.fading_; },
      set: function(fading) { that.setFading(fading); },
      enumerable: true
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.fading_) {
      var now = new Date();
      var duration = now - this.fadeStartTime_;
      var t = duration / this.fadeDuration_;

      if (t < 1.0) {
        var i = this.fadeEasing_(t);
        this.alpha_ = this.startAlpha_ * (1 - i) + this.targetAlpha_ * i;
      } else {
        this.alpha_ = this.targetAlpha_;
      }

      this.dispatch(new voodoo.Event('alphaChange', this));

      if (t >= 1.0) {
        this.fading_ = false;
        this.fadeDuration_ = 0;
        this.fadeElapsed_ = 0;
        this.startAlpha_ = this.alpha_;

        this.dispatch(new voodoo.Event('fadeEnd', this));
      }

      this.view.setAlpha_(this.alpha_);
      if (this.stencilView)
        this.stencilView.setAlpha_(this.alpha_);
    }
  }

});


/**
  * Fades in all scene meshes to full alpha.
  *
  * @param {number} seconds Animation duration.
  *
  * @return {Fadable}
  */
Fadable.prototype.fadeIn = function(seconds) {
  log_.assert_(seconds >= 0, 'seconds must be >= 0.', seconds,
      '(Fadable::fadeIn)');

  return this.fadeTo(1.0, seconds);
};


/**
  * Fades out all scene meshes to zero apha.
  *
  * @param {number} seconds Animation duration.
  *
  * @return {Fadable}
  */
Fadable.prototype.fadeOut = function(seconds) {
  log_.assert_(seconds >= 0, 'seconds must be >= 0.', seconds,
      '(Fadable::fadeOut)');

  return this.fadeTo(0.0, seconds);
};


/**
  * Fades in all scene meshes to full alpha.
  *
  * @param {number} alpha Alpha value from 0-1.
  * @param {number} seconds Animation duration.
  * @param {function(number):number=} opt_easing Optional easing function.
  *     Default is easing.easeInOutQuad.
  *
  * @return {Fadable}
  */
Fadable.prototype.fadeTo = function(alpha, seconds, opt_easing) {
  log_.assert_(alpha >= 0 && alpha <= 1, 'alpha must be between 0 and 1.',
      alpha, '(Fadable::fadeTo)');
  log_.assert_(seconds >= 0, 'seconds must be >= 0.', seconds,
      '(Fadable::fadeTo)');

  if (seconds === 0) {

    this.setAlpha(alpha);

  } else if (this.alpha_ !== alpha) {

    this.startAlpha_ = this.alpha_;
    this.targetAlpha_ = alpha;

    this.fadeStartTime_ = new Date();
    this.fadeDuration_ = seconds * 1000;
    this.fading_ = true;
    this.fadeElapsed_ = 0;

    this.fadeEasing_ = opt_easing || Easing.prototype.easeInOutQuad;

    this.dispatch(new voodoo.Event('fadeBegin', this));

  }

  return this;
};


/**
  * Immediately changes the alpha value of all scene meshes.
  *
  * @param {number} alpha Alpha value from 0-1.
  *
  * @return {Fadable}
  */
Fadable.prototype.setAlpha = function(alpha) {
  log_.assert_(alpha >= 0 && alpha <= 1, 'alpha must be between 0 and 1.',
      alpha, '(Fadable::setAlpha)');

  this.alpha_ = alpha;
  this.targetAlpha_ = alpha;
  this.fading_ = false;
  this.fadeDuration_ = 0;
  this.fadeElapsed_ = 0;

  this.dispatch(new voodoo.Event('alphaChange', this));

  this.view.setAlpha_(alpha);
  if (this.stencilView)
    this.stencilView.setAlpha_(alpha);

  return this;
};


/**
 * Get or set whether we are currently fading. This may be used to pause and
 * resume animations.
 *
 * @param {boolean} fading Whether to enable or disable fading.
 *
 * @return {Fadable}
 */
Fadable.prototype.setFading = function(fading) {
  log_.assert_(typeof fading === 'boolean', 'fading must be a boolean.',
      fading, '(Fadable::setFading)');

  if (!fading && this.fading_) {

    this.fading_ = false;
    this.fadeElapsed_ = new Date() - this.fadeStartTime_;

  } else if (fading && !this.fading_) {

    this.fading_ = true;
    this.fadeStartTime_ = new Date() - this.fadeElapsed_;

  }

  return this;
};


/**
 * Get or set the alpha value of all scene meshes.
 *
 * @type {number}
 */
Fadable.prototype.alpha = 0;


/**
 * Gets or sets whether we are currently animating a fade.
 *
 * @type {boolean}
 */
Fadable.prototype.fading = false;


/**
 * Gets the alpha value we are fading to. Readonly.
 *
 * @type {number}
 */
Fadable.prototype.targetAlpha = 0;
