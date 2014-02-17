// ----------------------------------------------------------------------------
// File: Fader.js
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
var FaderView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      if (typeof e.object.material !== 'undefined')
        e.object.material.opacity = this.model.alpha;
    });
  },

  setAlpha: function(alpha) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i) {
      var sceneObject = sceneObjects[i];
      if (typeof sceneObject.material !== 'undefined')
        sceneObject.material.opacity = this.model.alpha;
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
var FaderStencilView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      e.object.visible = this.model.alpha > 0;
    });
  },

  setAlpha: function(alpha) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i) {
      sceneObjects[i].visible = this.model.alpha > 0;
    }

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
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Fader = this.Fader = voodoo.Model.extend({

  name: 'Fader',
  organization: 'spellbook',
  viewType: FaderView_,
  stencilViewType: FaderStencilView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.alpha_ = typeof options.alpha !== 'undefined' ? options.alpha : 0;
    this.startAlpha = this.alpha_;
    this.targetAlpha = this.alpha_;
    this.fadeStartTime = null;
    this.fadeDuration = 0;

    Object.defineProperty(this, 'alpha', {
      get: function() { return this.alpha_; },
      set: function(alpha) {
        this.setAlpha(alpha);
      },
      writeable: false
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.alpha_ !== this.targetAlpha) {
      var now = new Date();
      var duration = now - this.fadeStartTime;
      var t = duration / this.fadeDuration;

      if (t < 1.0)
        this.alpha_ = this.startAlpha * (1 - t) + this.targetAlpha * t;
      else this.alpha_ = this.targetAlpha;

      if (this.alpha_ === this.targetAlpha)
        this.dispatch(new voodoo.Event('fadeEnd', this));

      this.view.setAlpha(this.alpha_);
      if (typeof this.stencilView !== 'undefined' && this.stencilView)
        this.stencilView.setAlpha(this.alpha_);
    }
  }

});


/**
  * Fades in all scene meshes to full alpha.
  *
  * @param {number} seconds Animation duration.
  *
  * @return {Fader}
  */
Fader.prototype.fadeIn = function(seconds) {
  return this.fadeTo(1.0, seconds);
};


/**
  * Fades out all scene meshes to zero apha.
  *
  * @param {number} seconds Animation duration.
  *
  * @return {Fader}
  */
Fader.prototype.fadeOut = function(seconds) {
  return this.fadeTo(0.0, seconds);
};


/**
  * Fades in all scene meshes to full alpha.
  *
  * @param {number} alpha Alpha value from 0-1.
  * @param {number} seconds Animation duration.
  *
  * @return {Fader}
  */
Fader.prototype.fadeTo = function(alpha, seconds) {
  if (seconds == 0) {
    this.setAlpha(alpha);
  } else if (this.alpha_ != alpha) {
    this.startAlpha = this.alpha_;
    this.targetAlpha = alpha;
    this.fadeStartTime = new Date();
    this.fadeDuration = seconds * 1000;

    this.dispatch(new voodoo.Event('fadeBegin', this));
  }

  return this;
};


/**
  * Immediately changes the alpha value of all scene meshes.
  *
  * @param {number} alpha Alpha value from 0-1.
  *
  * @return {Fader}
  */
Fader.prototype.setAlpha = function(alpha) {
  this.alpha_ = alpha;
  this.targetAlpha = alpha;

  this.view.setAlpha(alpha);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.setAlpha(alpha);

  return this;
};


/**
 * Get or set the alpha value of all scene meshes.
 *
 * @type {number}
 */
Fader.prototype.alpha = 0;
