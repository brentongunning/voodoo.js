// ----------------------------------------------------------------------------
// File: Arcball.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that controls the arcball rotation of scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var ArcballView_ = voodoo.View.extend({

  load: function() {
    this.base.load();
  }

});



/**
 * An arcball controller that lets the user rotate scene meshes using
 * the mouse.
 *
 * Options:
 *
 * - arcballCenter {Object} Center of the arcball sphere. If null, then
 *     this will be calculated from the aggreate bounding sphere of meshes.
 *     Default is null.
 * - arcballRadius {number} Radius of the arcball sphere. If 0, then
 *     this will be calculated from the aggegate bounding sphere of meshes.
 *     Default is 0.
 *
 *
 * @constructor
 * @extends {Rotator}
 *
 * @param {Object=} opt_options Options object.
 */
var Arcball = this.Arcball = Rotator.extend({

  name: 'Arcball',
  organization: 'spellbook',
  viewType: ArcballView_,
  stencilViewType: ArcballView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.arcballCenter = typeof options.arcballCenter !== 'undefined' ?
        options.arcballCenter : null;
    this.arcballRadius = typeof options.arcballRadius !== 'undefined' ?
        options.arcballRadius : null;
  }

});


/**
 * Center of the arcball sphere. If null, then this will be calculated from
 * the aggreate bounding sphere of meshes. Default is null.
 *
 * @type {Object}
 */
Arcball.prototype.arcballCenter = null;


/**
 * Radius of the arcball sphere. If 0, then this will be calculated from the
 * aggegate bounding sphere of meshes. Default is 0.
 *
 * @type {number}
 */
Arcball.prototype.arcballRadius = 0;
