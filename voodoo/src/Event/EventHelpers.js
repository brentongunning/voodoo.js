// ----------------------------------------------------------------------------
// File: EventHelpers.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Container for various event helpers.
 *
 * @private
 */
var EventHelpers_ = {
  totalNumMouseEventListeners_: 0
};


/**
 * Returns whether an event type is a mouse event.
 *
 * @private
 *
 * @param {string} type Event type.
 *
 * @return {boolean} True if the event is a mouse event. False if not.
 */
EventHelpers_.isMouseEvent_ = function(type) {
  return type === 'mouseup' ||
      type === 'mousedown' ||
      type === 'click' ||
      type === 'dblclick' ||
      type === 'mousemove' ||
      type === 'mouseover' ||
      type === 'mouseout';
};
