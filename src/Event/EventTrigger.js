// ----------------------------------------------------------------------------
// File: EventTrigger.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Default trigger id when none is specified.
 *
 * @type {number}
 * @const
 * @private
 */
var defaultTriggerId_ = -1;



/**
 * Internal object that stores a ThreeJs mouse event trigger.
 *
 * A trigger is a 3D object that causes an event to fire.
 *
 * @constructor
 * @struct
 * @private
 *
 * @param {View} view View.
 * @param {THREE.Object3D} object Object that triggers the mouse event.
 * @param {string|number=} opt_triggerId Optional event identifier.
 */
function EventTrigger_(view, object, opt_triggerId) {
  this.view_ = view;
  this.object_ = object;
  this.triggerId_ = typeof opt_triggerId === 'undefined' ?
      defaultTriggerId_ : opt_triggerId;
  this.model_ = view['model'];
}


/**
 * Returns whether two triggers are equivalent to each other.
 *
 * @param {EventTrigger_} other Trigger to compare against.
 *
 * @return {boolean} Whether the triggers are equivalent.
 */
EventTrigger_.prototype.isEquivalentTo = function(other) {
  return other != null &&
      this.model_ == other.model_ &&
      this.triggerId_ == other.triggerId_;
};


/**
 * Triggering object
 *
 * @private
 * @type {THREE.Object3D}
 */
EventTrigger_.prototype.object_ = null;


/**
 * Triggering model
 *
 * @private
 * @type {Model}
 */
EventTrigger_.prototype.model_ = null;


/**
 * Trigger id
 *
 * @private
 * @type {number|string}
 */
EventTrigger_.prototype.triggerId_ = defaultTriggerId_;


/**
 * Triggering view
 *
 * @private
 * @type {View}
 */
EventTrigger_.prototype.view_ = null;
