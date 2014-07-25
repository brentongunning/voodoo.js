// ------------------------------------------------------------------------------------------------
// File: ThreeJsTriggers.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * A manager for ThreeJs mouse triggers. It stores all of the objects that cause mouse events to
 * fire, like mousedown, mouseleave, and click. Each trigger is made up of a ThreeJs mesh object
 * and a triggerId. The triggerId is passed to the event handler to distinguish between different
 * meshes in a single model.
 *
 * @constructor
 * @private
 *
 * @param {Array.<EventTrigger_>} triggers ThreeJs triggers.
 * @param {ThreeJsScene_} scene ThreeJs scene.
 * @param {View} view Owning view.
 */
function ThreeJsTriggers_(triggers, scene, view) {
  log_.assert_(triggers, 'triggers must be valid.', '(ThreeJsTriggers_::ThreeJsTriggers_)');
  log_.assert_(scene, 'scene must be valid.', '(ThreeJsTriggers_::ThreeJsTriggers_)');
  log_.assert_(view, 'view must be valid.', '(ThreeJsTriggers_::ThreeJsTriggers_)');

  this.triggers_ = triggers;
  this.scene_ = scene;
  this.view_ = view;
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
 * @param {THREE.Object3D} object Object that triggers mouse events.
 * @param {string|number=} opt_triggerId Optional event id.
 */
ThreeJsTriggers_.prototype['add'] = function(object, opt_triggerId) {
  log_.assert_(object, 'object must be valid', '(ThreeJsTriggers_::add)');

  var trigger = new EventTrigger_(this.view_, object, this, opt_triggerId);

  // See if this trigger already exists
  if (DEBUG) {
    for (var i = 0, numTriggers = this.triggers_.length; i < numTriggers; ++i) {
      if (this.triggers_[i].object_ === trigger.object_)
        log_.error_('Trigger already exists');
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
  log_.assert_(object, 'object must be valid.', '(ThreeJsTriggers_::remove)');

  for (var i = 0, numTriggers = this.triggers_.length; i < numTriggers; ++i) {
    if (this.triggers_[i].object_ === object)
      this.triggers_.splice(i, 1);
  }

  if (object['addedToVoodooScene']) {
    this.scene_['remove'](object);
  }

  object['addedToVoodooTriggers'] = false;
};


/**
 * Destroys the triggers container.
 *
 * @private
 * @this {ThreeJsTriggers_}
 */
ThreeJsTriggers_.prototype.destroy_ = function() {
  this.triggers_ = null;
  this.scene_ = null;
  this.view_ = null;
};
