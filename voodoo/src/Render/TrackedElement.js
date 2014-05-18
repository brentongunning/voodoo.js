// ----------------------------------------------------------------------------
// File: TrackedElement.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tracks the position and size of an HTML element and issues callbacks
 * when these change.
 *
 * @constructor
 * @private
 *
 * @param {HTMLElement} element Html DOM element to track.
 */
function TrackedElement_(element) {
  log_.assert_(element, 'element must be valid.',
      '(TrackedElement_::TrackedElement_)');

  this.element_ = element;
  this.nextCallbackId_ = 0;
  this.callbacks_ = {};

  this.lastX_ = Number.MIN_VALUE;
  this.lastY_ = Number.MIN_VALUE;
  this.lastWidth_ = Number.MIN_VALUE;
  this.lastHeight_ = Number.MIN_VALUE;

  this.update_();
}


/**
 * Adds a callback to fire when the tracked element moves or resizes.
 *
 * @private
 *
 * @param {function(number, number, number, number, boolean, boolean)} callback
 *     Callback to add.
 * @return {number} Callback id used to release.
 */
TrackedElement_.prototype.addCallback_ = function(callback) {
  log_.assert_(callback, 'callback must be valid.',
      '(TrackedElement_::addCallback_)');
  log_.assert_(typeof callback === 'function', 'callback must be a function.',
      '(TrackedElement_::addCallback_)');

  var id = this.nextCallbackId_++;

  this.callbacks_[id] = callback;
  this.numCallbacks_++;

  // Always call the callback once immediately after it is added so that
  // the new object attaching gets the current location of the element.
  callback(this.lastX_, this.lastY_, this.lastWidth_,
      this.lastHeight_, true, true);

  return id;
};


/**
 * Removes a callback.
 *
 * @private
 *
 * @param {number} callbackId Id of the callback to remove.
 */
TrackedElement_.prototype.releaseCallback_ = function(callbackId) {
  log_.assert_(callbackId >= 0, 'callbackId must be >= 0.',
      callbackId, '(TrackedElement_::releaseCallback_)');
  log_.assert_(typeof callbackId === 'number', 'callbackId must be a number.',
      callbackId, '(TrackedElement_::releaseCallback_)');

  delete this.callbacks_[callbackId];
  this.numCallbacks_--;
};


/**
 * Called each frame to detect changes in position or size of HTML elements
 * and fire the callbacks to update local coordinate systems.
 *
 * @private
 */
TrackedElement_.prototype.update_ = function() {
  var position = window['voodoo']['utility']['findAbsolutePosition'](
      this.element_);

  var width = this.element_.offsetWidth;
  var height = this.element_.offsetHeight;

  var moved = position['x'] !== this.lastX_ || position['y'] !== this.lastY_;
  var resized = width !== this.lastWidth_ || height !== this.lastHeight_;
  if (moved || resized) {
    // Save the new position and size
    this.lastX_ = position['x'];
    this.lastY_ = position['y'];
    this.lastWidth_ = width;
    this.lastHeight_ = height;

    // Fire callbacks
    for (var callback in this.callbacks_) {
      if (this.callbacks_.hasOwnProperty(callback)) {
        this.callbacks_[callback].call(null, this.lastX_, this.lastY_,
            this.lastWidth_, this.lastHeight_, moved, resized);
      }
    }
  }
};


/**
 * The number of callbacks registered on the element.
 *
 * @private
 * @type {number}
 */
TrackedElement_.prototype.numCallbacks_ = 0;
