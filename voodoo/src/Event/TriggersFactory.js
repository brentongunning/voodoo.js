// ------------------------------------------------------------------------------------------------
// File: TriggersFactory.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Creates triggers customized for each View.
 *
 * @constructor
 * @private
 */
function TriggersFactory_() {}


/**
 * Creates a cache specific to a Model or View.
 *
 * @private
 *
 * @param {View} view View that owns this triggers.
 * @return {Triggers} Instantiated Triggers.
 */
TriggersFactory_.prototype.createTriggers_ = function(view) {
  log_.error_('createTriggers_() undefined.');
  return null;
};


/**
 * The internal array of triggers.
 *
 * This is exposed internally for enumeration across the triggers.
 *
 * @private
 * @type {Array.<EventTrigger_>}
 */
TriggersFactory_.prototype.triggers_ = null;
