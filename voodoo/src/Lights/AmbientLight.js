// ------------------------------------------------------------------------------------------------
// File: AmbientLight.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * The ambient light's view.
 *
 * @constructor
 * @private
 * @extends {LightView_}
 */
var AmbientLightView_ = LightView_['extend']();


/**
 * Creates the ambient light object.
 *
 * @this {AmbientLightView_}
 *
 * @return {THREE.Light} Custom light.
 */
AmbientLightView_.prototype['createLight'] = function() {
  log_.assert_(this['renderer'] === Renderer['ThreeJs'], 'Only ThreeJs is supported.',
      '(AmbientLightView_::AmbientLightView_)');

  return new THREE.AmbientLight();
};



/**
 * A light that illuminates the scene uniformly and has no specific origin or direction.
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
var AmbientLight_ = Light_['extend']();


/**
 * Name of this model. Do not change.
 */
AmbientLight_.prototype['name'] = 'AmbientLight';


/**
 * The light's normal pass view. Do not change.
 */
AmbientLight_.prototype['viewType'] = AmbientLightView_;
