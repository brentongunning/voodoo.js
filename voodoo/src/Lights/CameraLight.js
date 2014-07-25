// ------------------------------------------------------------------------------------------------
// File: CameraLight.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * The camera light's view.
 *
 * @constructor
 * @private
 * @extends {LightView_}
 */
var CameraLightView_ = LightView_['extend']();


/**
 * Creates the camera light object.
 *
 * @this {CameraLightView_}
 *
 * @return {THREE.Light} Custom light.
 */
CameraLightView_.prototype['createLight'] = function() {
  log_.assert_(this['renderer'] === Renderer['ThreeJs'], 'Only ThreeJs is supported.',
      '(CameraLightView_::CameraLightView_)');

  return new THREE.PointLight();
};


/**
 * Sets up the light scene objects.
 *
 * This should NOT be called directly.
 *
 * @this {LightView_}
 */
CameraLightView_.prototype['load'] = function() {
  LightView_.prototype['load'].apply(this);

  this['updatePosition']();
};


/**
 * Updates the camera light's position.
 *
 * @this {CameraLightView_}
 */
CameraLightView_.prototype['updatePosition'] = function() {
  log_.assert_(this['renderer'] === Renderer['ThreeJs'], 'Only ThreeJs is supported.',
      '(CameraLightView_::updatePosition)');

  var lightPosition = this.light['position'];
  var cameraPosition = this['camera']['position'];

  lightPosition['x'] = cameraPosition['x'];
  lightPosition['y'] = cameraPosition['y'];
  lightPosition['z'] = cameraPosition['z'];
};



/**
 * An point light with no attenuation that is always positioned at the camera.
 *
 * Options are:
 *   color {string} CSS color string.
 *
 * @constructor
 * @private
 * @extends {Light_}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var CameraLight_ = Light_['extend']();


/**
 * The type name.
 *
 * Do not change.
 */
CameraLight_.prototype['name'] = 'CameraLight';


/**
 * The view type.
 *
 * Do not change.
 */
CameraLight_.prototype['viewType'] = CameraLightView_;


/**
 * Registers a cameramove event to update the light's position.
 *
 * @this {CameraLight_}
 */
CameraLight_.prototype['setUpViews'] = function() {
  this['on']('cameramove', function() {
    this['view']['updatePosition']();
  });
};
