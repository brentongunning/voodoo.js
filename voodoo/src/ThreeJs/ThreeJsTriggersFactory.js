// ----------------------------------------------------------------------------
// File: ThreeJsTriggersFactory.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates ThreeJs triggers.
 *
 * @constructor
 * @private
 */
function ThreeJsTriggersFactory_() {
  log_.information_('Creating ThreeJs Triggers Factory');

  this.triggers_ = [];
}


/**
 * Inherit from TriggersFactory_.
 */
ThreeJsTriggersFactory_.prototype = new TriggersFactory_();


/**
 * Set the constructor back.
 */
ThreeJsTriggersFactory_.prototype.constructor =
    ThreeJsTriggersFactory_.constructor;


/**
 * Creates a ThreeJsTriggers_ specific to a View. The View must already
 * have a scene.
 *
 * @private
 *
 * @param {View} view View that owns this triggers.
 * @return {ThreeJsTriggers_} Instantiated Triggers.
 */
ThreeJsTriggersFactory_.prototype.createTriggers_ = function(view) {
  return new ThreeJsTriggers_(this.triggers_, view['scene'].scene_, view);
};
