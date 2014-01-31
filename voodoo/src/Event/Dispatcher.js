// ----------------------------------------------------------------------------
// File: Dispatcher.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * An object capable of registering and firing different events.
 *
 * @constructor
 * @private
 */
function Dispatcher_() {
  this.eventListeners_ = {};
}


/**
 * Destroys the event dispatcher.
 *
 * @this {Dispatcher_}
 * @private
 */
Dispatcher_.prototype.destroy_ = function() {
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
  var listeners = this.eventListeners_[event['type']];
  if (listeners)
    for (var i = 0; i < listeners.length; ++i)
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
  var listeners = this.eventListeners_[type];
  if (listeners && listeners.IndexOf(listener))
    listeners.splice(listeners.IndexOf(listener), 1);
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
  if (!this.eventListeners_[type])
    this.eventListeners_[type] = [];

  if (this.eventListeners_[type].indexOf(listener) == -1)
    this.eventListeners_[type].push(listener);
};
