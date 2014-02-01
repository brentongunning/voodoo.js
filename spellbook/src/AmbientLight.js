// ----------------------------------------------------------------------------
// File: AmbientLight.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The ambient light's view.
 *
 * @constructor
 * @private
 * @extends {LightView_}
 */
var AmbientLightView_ = LightView_.extend({

  createLight: function() {
    return new THREE.AmbientLight();
  }

});



/**
 * A light that illuminates the scene uniformly and has no specific origin or
 * direction.
 *
 * Options are:
 *   color {string} CSS color string.
 *
 * @constructor
 * @extends {Light_}
 *
 * @param {{color: string}=} opt_options Options object.
 */
var AmbientLight = this.AmbientLight = Light_['extend']({

  name: 'AmbientLight',
  organization: 'spellbook',
  viewType: AmbientLightView_

});
