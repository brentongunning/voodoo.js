// ----------------------------------------------------------------------------
// File: CameraLight.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The camera light's view.
 *
 * @constructor
 * @private
 * @extends {LightView_}
 */
var CameraLightView_ = LightView_.extend({

  createLight: function() {
    return new THREE.PointLight();
  },

  load: function() {
    LightView_.prototype.load.apply(this);
    this.updatePosition();
  },

  updatePosition: function() {
    this.light.position.x = this.camera.position.x;
    this.light.position.y = this.camera.position.y;
    this.light.position.z = this.camera.position.z;
    this.dirty();
  }

});



/**
 * An point light with no attenuation that is always positioned at the camera.
 *
 * Options:
 *
 * - color {string} CSS color string.
 *
 * @constructor
 * @extends {Light_}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var CameraLight = this.CameraLight = Light_.extend({

  name: 'CameraLight',
  organization: 'spellbook',
  viewType: CameraLightView_,

  setUpViews: function() {
    Light_.prototype.setUpViews.call(this);

    this.on('cameramove', function() {
      this.view.updatePosition();
    });
  }

});
