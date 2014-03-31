// ----------------------------------------------------------------------------
// File: Helpers.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Dispatches a mouse event to the document.
 *
 * @param {string} type Type of mouse event (ie. mousemove).
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
function fireMouseEvent(type, x, y) {
  voodoo.engine.frame();

  var moveEvent = document.createEvent('MouseEvents');
  moveEvent.initMouseEvent(type, true, true, window, 0, x, y,
      x, y, false, false, false, false, 0, null);
  document.dispatchEvent(moveEvent);

  voodoo.engine.frame();
}


/**
 * Dispatches mouse events to perform a click
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
function fireClick(x, y) {
  fireMouseEvent('mousemove', x, y);
  fireMouseEvent('mousedown', x, y);
  fireMouseEvent('mouseup', x, y);
}


/**
 * Configures the page to be able to handle mouse events in tests.
 */
function enableMouseEvents() {
  // By default, the page is not sized correctly to have any clickable regions.
  document.body.style.height = '1000px';

  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);
}
