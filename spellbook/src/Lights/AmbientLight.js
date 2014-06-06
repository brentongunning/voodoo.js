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

  createLight_: function() {
    return new THREE.AmbientLight();
  }

});



/**
 * A light that illuminates the scene uniformly and has no specific origin or
 * direction.
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
var AmbientLight = this.AmbientLight = Light_['extend']({

  name: 'AmbientLight',
  organization: 'spellbook',
  viewType: AmbientLightView_

});
