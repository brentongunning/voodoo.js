// ----------------------------------------------------------------------------
// File: ThreeJsTriggers.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * A manager for ThreeJs mouse triggers. It stores all of the objects that
 * cause mouse events to fire, like mousedown, mouseleave, and click. Each
 * trigger is made up of a ThreeJs mesh object and a triggerId. The triggerId is
 * passed to the event handler to distinguish between different meshes in a
 * single model.
 *
 * @constructor
 * @private
 *
 * @param {ThreeJsScene_} scene ThreeJs scene.
 */
function ThreeJsTriggers_(scene) {
  log_.information_('Creating ThreeJs Triggers');

  this.triggers_ = [];
  this.scene_ = scene;
}


/**
 * Inherit from Triggers.
 */
ThreeJsTriggers_.prototype = new Triggers();


/**
 * Set the constructor back.
 */
ThreeJsTriggers_.prototype.constructor = ThreeJsTriggers_.constructor;


/**
 * Adds a trigger.
 *
 * A ThreeJs object can only have one trigger id at a time.
 *
 * @this {ThreeJsTriggers_}
 *
 * @param {View} view View.
 * @param {THREE.Object3D} object Object that triggers mouse events.
 * @param {string|number=} opt_triggerId Optional event id.
 */
ThreeJsTriggers_.prototype['add'] = function(view, object,
    opt_triggerId) {
  log_.assert_(view, 'View must be valid');
  log_.assert_(object, 'Object must be valid');

  var trigger = new EventTrigger_(view, object, opt_triggerId);

  // See if this trigger already exists
  if (DEBUG) {
    for (var i = 0; i < this.triggers_.length; ++i) {
      if (this.triggers_[i].object_ == trigger.object_) {
        log_.error_('Trigger already exists');
      }
    }
  }

  this.triggers_.push(trigger);

  // The object must be added to the scene to intersect
  if (!object['addedToVoodooScene']) {
    object.visible = false;
    this.scene_['add'](object);
  }

  object['addedToVoodooTriggers'] = true;
};


/**
 * Removes a trigger.
 *
 * @this {ThreeJsTriggers_}
 *
 * @param {THREE.Object3D} object Object that triggers mouse events.
 */
ThreeJsTriggers_.prototype['remove'] = function(object) {
  for (var i = 0; i < this.triggers_.length; ++i) {
    if (this.triggers_[i].object_ == object) {
      this.triggers_.splice(i, 1);
    }
  }

  if (object['addedToVoodooScene']) {
    this.scene_['remove'](object);
  }

  object['addedToVoodooTriggers'] = false;
};


/**
 * Customizes the triggers list for a particular view so that the
 * user doesn't have to specify the view every time.
 *
 * @this {ThreeJsTriggers_}
 *
 * @param {View} view View to customize for.
 * @return {Object} Customized trigger list.
 */
ThreeJsTriggers_.prototype.applyView = function(view) {
  var triggers = this;
  return {
    add: function(object, opt_trigger_id) {
      triggers['add'](view, object, opt_trigger_id);
    },
    remove: function(object, opt_trigger_id) {
      triggers['remove'](object);
    }
  };
};


/**
 * The internal array of triggers.
 *
 * This is exposed internally for enumeration across the triggers.
 *
 * @private
 * @type {Array.<EventTrigger_>}
 */
ThreeJsTriggers_.prototype.triggers_ = null;
