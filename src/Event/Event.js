// ----------------------------------------------------------------------------
// File: Event.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Holds information about an event to pass to event handlers.
 *
 * @constructor
 *
 * @param {string} type Type of event.
 * @param {Model=} opt_model Model from which this event fired.
 * @param {string|number=} opt_triggerId Optional trigger id.
 */
this.Event = function(type, opt_model, opt_triggerId) {
  this['type'] = type;
  this['model'] = opt_model;
  this['triggerId'] = typeof opt_triggerId === 'undefined' ?
      defaultTriggerId_ : opt_triggerId;
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
 * Event target or custom data.
 *
 * @type {Object}
 */
this.Event.prototype['object'] = null;

// Size dimensions
this.Event.prototype['size'] = {};


/**
 * Width.
 *
 * @type {number}
 */
this.Event.prototype['size']['width'] = Number.MAX_VALUE;


/**
 * Height.
 *
 * @type {number}
 */
this.Event.prototype['size']['height'] = Number.MAX_VALUE;


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
this.Event.prototype['triggerId'] = defaultTriggerId_;

// Exports
this['Event'] = this.Event;
