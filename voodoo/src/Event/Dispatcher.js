// ----------------------------------------------------------------------------
// File: Dispatcher.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * An object capable of registering and firing different events.
 *
 * @constructor
 * @private
 */
function Dispatcher_() {
  this.eventListeners_ = {};
  this.numMouseEventListeners_ = 0;
}


/**
 * Destroys the event dispatcher.
 *
 * @this {Dispatcher_}
 * @private
 */
Dispatcher_.prototype.destroy_ = function() {
  EventHelpers_.totalNumMouseEventListeners_ -= this.numMouseEventListeners_;
  this.eventListeners_ = null;
};


/**
 * Fires an event.
 *
 * @this {Dispatcher_}
 * @private
 *
 * @param {Object} thisArg This object in the callback.
 * @param {Event} event Event description.
 */
Dispatcher_.prototype.dispatchEvent_ = function(thisArg, event) {
  log_.assert_(event, 'event must be valid.', '(Dispatcher_::dispatchEvent_)');

  var listeners = this.eventListeners_[event['type']];
  if (listeners)
    for (var i = 0, len = listeners.length; i < len; ++i)
      listeners[i].call(thisArg, event);
};


/**
 * Removes an event handler.
 *
 * @this {Dispatcher_}
 * @private
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Dispatcher_.prototype.off_ = function(type, listener) {
  log_.assert_(type, 'type must be valid.', '(Dispatcher_::off_)');
  log_.assert_(listener, 'listener must be valid.', '(Dispatcher_::off_)');
  log_.assert_(typeof listener === 'function',
      'listener must be a function.', '(Dispatcher_::off_)');

  if (EventHelpers_.isMouseEvent_(type)) {
    EventHelpers_.totalNumMouseEventListeners_--;
    this.numMouseEventListeners_--;
  }

  var listeners = this.eventListeners_[type];
  if (listeners && listeners.indexOf(listener))
    listeners.splice(listeners.indexOf(listener), 1);
};


/**
 * Adds an event handler.
 *
 * @this {Dispatcher_}
 * @private
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Dispatcher_.prototype.on_ = function(type, listener) {
  log_.assert_(type, 'type must be valid.', '(Dispatcher_::on_)');
  log_.assert_(listener, 'listener must be valid.', '(Dispatcher_::on_)');
  log_.assert_(typeof listener === 'function',
      'listener must be a function.', '(Dispatcher_::on_)');

  if (EventHelpers_.isMouseEvent_(type)) {
    EventHelpers_.totalNumMouseEventListeners_++;
    this.numMouseEventListeners_++;
  }

  var eventListeners = this.eventListeners_[type];

  if (!eventListeners)
    eventListeners = this.eventListeners_[type] = [];

  if (eventListeners.indexOf(listener) === -1)
    eventListeners.push(listener);
};
