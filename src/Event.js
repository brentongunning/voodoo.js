// ----------------------------------------------------------------------------
// File: Event.js
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
var DefaultTriggerId_ = -1;



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
      DefaultTriggerId_ : opt_triggerId;
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
EventTrigger_.prototype.triggerId_ = DefaultTriggerId_;


/**
 * Triggering view
 *
 * @private
 * @type {View}
 */
EventTrigger_.prototype.view_ = null;



/**
 * Holds information about an event to pass to event handlers.
 *
 * Event types include cameramove, mousedown, mouseup, mouseover, mouseout,
 * mousemove, click, and dblclick. Not all properties are valid for all events.
 *
 * @constructor
 *
 * @param {string} type Type of event.
 * @param {Model} model Model from which this event fired.
 * @param {string|number=} opt_triggerId Optional trigger id.
 */
this.Event = function(type, model, opt_triggerId) {
  this['type'] = type;
  this['model'] = model;
  this['triggerId'] = typeof opt_triggerId === 'undefined' ?
      DefaultTriggerId_ : opt_triggerId;
};


/**
 * Initializes data only relevant for mouse events.
 *
 * @private
 *
 * @param {number} clientX Client X mouse coordinate.
 * @param {number} clientY Client Y mouse coordinate.
 * @param {number} hitX Intersections point X coordinate.
 * @param {number} hitY Intersections point Y coordinate.
 * @param {number} hitZ Intersections point Z coordinate.
 * @param {number=} opt_button Mouse button identifier.
 */
this.Event.prototype.initializeMouseEvent_ = function(clientX, clientY,
    hitX, hitY, hitZ, opt_button) {
  this['client']['x'] = clientX;
  this['client']['y'] = clientY;
  this['hit']['x'] = hitX;
  this['hit']['y'] = hitY;
  this['hit']['z'] = hitZ;
  this['button'] = opt_button || 0;
};


/**
 * Mouse button identifier.
 *
 * 0: Left
 * 1: Middle
 * 2: Right
 *
 * @type {number}
 */
this.Event.prototype['button'] = 0;

// Client hit coordinate
this.Event.prototype['client'] = {};


/**
 * Client mouse x coordinate.
 *
 * @type {number}
 */
this.Event.prototype['client']['x'] = Number.MAX_VALUE;


/**
 * Client mouse y coordinate.
 *
 * @type {number}
 */
this.Event.prototype['client']['y'] = Number.MAX_VALUE;

// Intersection point
this.Event.prototype['hit'] = {};


/**
 * Intersection point x coordinate.
 *
 * @type {number}
 */
this.Event.prototype['hit']['x'] = Number.MAX_VALUE;


/**
 * Intersection point y coordinate.
 *
 * @type {number}
 */
this.Event.prototype['hit']['y'] = Number.MAX_VALUE;


/**
 * Intersection point z coordinate.
 *
 * @type {number}
 */
this.Event.prototype['hit']['z'] = Number.MAX_VALUE;


/**
 * Model from which this event fired.
 *
 * @type {Model}
 */
this.Event.prototype['model'] = null;


/**
 * Type of event.
 *
 * @type {string}
 */
this.Event.prototype['type'] = null;


/**
 * Identifier for the event trigger.
 *
 * @type {string|number}
 */
this.Event.prototype['triggerId'] = DefaultTriggerId_;

// Exports
this['Event'] = this.Event;
