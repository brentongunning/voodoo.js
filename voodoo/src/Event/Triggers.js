// ----------------------------------------------------------------------------
// File: Triggers.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * A manager for mouse triggers. It stores all of the objects that
 * cause mouse events, such as mouseleave and click, to fire, Each trigger
 * is a pair of a mesh object and a triggerId. A triggerId is a way of
 * distinguishing between sets of meshes that behave the same on mouse events.
 * The Model's event handlers have access to the triggerId via the Event passed
 * to them.
 *
 * @constructor
 */
function Triggers() {}


/**
 * Adds a trigger.
 *
 * A single mesh can only have one trigger id at a time.
 *
 * @param {THREE.Object3D} object Object that triggers mouse events.
 * @param {string|number=} opt_triggerId Optional event id.
 */
Triggers.prototype['add'] = function(object, opt_triggerId) {};


/**
 * Sets the cursor that shows when the mouse moves over a trigger.
 *
 * @this {ThreeJsTriggers_}
 *
 * @param {string} cursor CSS cursor style.
 */
Triggers.prototype['cursor'] = function(cursor) {
  this.cursor_ = cursor;
};


/**
 * Removes a trigger.
 *
 * @param {THREE.Object3D} object Object that triggers mouse events.
 */
Triggers.prototype['remove'] = function(object) {};


/**
 * Destroys the triggers container.
 *
 * @private
 * @this {ThreeJsTriggers_}
 */
Triggers.prototype.destroy_ = function() {};


/**
 * The cursor displayed when the mouse is over a trigger.
 *
 * @private
 * @type {string}
 */
Triggers.prototype.cursor_ = 'auto';
