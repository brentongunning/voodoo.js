// ------------------------------------------------------------------------------------------------
// File: SceneFactory.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Creates scenes customized for each View.
 *
 * @constructor
 * @private
 */
function SceneFactory_() {}


/**
 * Creates a Scene specific to a View.
 *
 * @private
 *
 * @param {View} view View that owns this triggers.
 * @return {Scene} Instantiated Scene.
 */
SceneFactory_.prototype.createScene_ = function(view) {
  log_.error_('createScene_() undefined.');
  return null;
};
