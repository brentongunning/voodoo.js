// ----------------------------------------------------------------------------
// File: EventTrigger.js
//
// Copyright (c) 2014 VoodooJs Authors
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
 * @param {Triggers} parent Parent triggers object.
 * @param {string|number=} opt_triggerId Optional event identifier.
 */
function EventTrigger_(view, object, parent, opt_triggerId) {
  log_.assert_(view, 'view must be valid.',
      '(EventTrigger_::EventTrigger_)');
  log_.assert_(object, 'object must be valid.',
      '(EventTrigger_::EventTrigger_)');
  log_.assert_(parent, 'parent must be valid.',
      '(EventTrigger_::EventTrigger_)');

  this.view_ = view;
  this.object_ = object;
  this.triggerId_ = typeof opt_triggerId === 'undefined' ?
      defaultTriggerId_ : opt_triggerId;
  this.parent_ = parent;
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
  return !!other &&
      this.model_ === other.model_ &&
      this.triggerId_ === other.triggerId_;
};


/**
 * Triggering model.
 *
 * @private
 * @type {Model}
 */
EventTrigger_.prototype.model_ = null;


/**
 * Triggering object.
 *
 * @private
 * @type {THREE.Object3D}
 */
EventTrigger_.prototype.object_ = null;


/**
 * Parent triggers object.
 *
 * @private
 * @type {Triggers}
 */
EventTrigger_.prototype.parent_ = null;


/**
 * Trigger id.
 *
 * @private
 * @type {number|string}
 */
EventTrigger_.prototype.triggerId_ = defaultTriggerId_;


/**
 * Triggering view.
 *
 * @private
 * @type {View}
 */
EventTrigger_.prototype.view_ = null;
