// ----------------------------------------------------------------------------
// File: Raycaster.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Raycasts into the scenes for hit testing.
 *
 * @constructor
 * @private
 */
function Raycaster_() {}


/**
 * Raycasts based on the current mouse and returns the intersected trigger.
 *
 * The return object has the following members:
 *    trigger - The EventTrigger_ that the ray intersected, or null for none.
 *    hitX - X position where the hit occurred.
 *    hitY - Y position where the hit occurred.
 *    hitZ - Z position where the hit occurred.
 *
 * @private
 *
 * @return {Object}
 */
Raycaster_.prototype.raycast_ = function() {
  log_.error_('raycast_() undefined.');
  return null;
};


/**
 * Updates the raycaster for the new mouse position.
 *
 * @private
 *
 * @param {Vector2_} mouse Client mouse position.
 */
Raycaster_.prototype.setMouse_ = function(mouse) {
  log_.error_('setMouse_() undefined.');
};
