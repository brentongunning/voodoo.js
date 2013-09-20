// ----------------------------------------------------------------------------
// File: Triggers.js
//
// Copyright (c) 2013 VoodooJs Authors
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
 * Removes a trigger.
 *
 * @param {THREE.Object3D} object Object that triggers mouse events.
 */
Triggers.prototype['remove'] = function(object) {};
