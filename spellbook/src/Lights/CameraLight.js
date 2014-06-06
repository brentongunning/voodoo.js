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

  createLight_: function() {
    return new THREE.PointLight();
  },

  load: function() {
    this.base.load();

    this.updatePosition_();
  },

  updatePosition_: function() {
    var lightPosition = this.light_.position;
    var cameraPosition = this.camera.position;

    lightPosition.x = cameraPosition.x;
    lightPosition.y = cameraPosition.y;
    lightPosition.z = cameraPosition.z;

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
 * Events:
 *
 * - changeColor
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
    this.base.setUpViews();

    this.on('cameramove', function() {
      this.view.updatePosition_();
    });
  }

});
