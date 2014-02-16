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
 * Adds functions to fade in and out meshes.
 *
 * Options are:
 *   alpha {number} Initial alpha value.
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

  initialize: function(options) {
    this.base.initialize(options);

    this.alpha = typeof options.alpha !== 'undefined' ? options.alpha : 0;
    this.startAlpha = this.alpha;
    this.targetAlpha = this.alpha;
    this.fadeStartTime = null;
    this.fadeDuration = 0;
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.alpha !== this.targetAlpha) {
      var now = new Date();
      var duration = now - this.fadeStartTime;
      var t = duration / this.fadeDuration;

      if (t < 1.0)
        this.alpha = this.startAlpha * (1 - t) + this.targetAlpha * t;
      else this.alpha = this.targetAlpha;

      if (this.alpha === this.targetAlpha)
        this.dispatch(new voodoo.Event('fadeEnd', this));

      this.view.setAlpha(this.alpha);
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
  } else if (this.alpha != alpha) {
    this.startAlpha = this.alpha;
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
  this.alpha = alpha;
  this.targetAlpha = alpha;

  this.view.setAlpha(alpha);

  return this;
};
