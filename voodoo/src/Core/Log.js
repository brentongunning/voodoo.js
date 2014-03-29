// ----------------------------------------------------------------------------
// File: Log.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Object for all internal logging.
 *
 * @constructor
 *
 * @private
 */
function Log_() {
  // No-op
}


/**
 * Logs a message to the console.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {string} message Text to log.
 */
Log_.prototype.consoleMessage_ = function(message) {
  window.console.log('[voodoo] ' + message);
};


/**
 * Logs an informational message to the console.
 *
 * These messages only appear in debug builds of voodoo.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {string} message Text to log.
 */
Log_.prototype.information_ = function(message) {
  if (DEBUG)
    this.consoleMessage_(message);
};


/**
 * Logs an informational message about a model to the console.
 *
 * These messages only appear in debug builds of voodoo.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {Model} model Model to log about.
 * @param {string} message Text to log.
 */
Log_.prototype.modelInformation_ = function(model, message) {
  this.information_(model.id_ + ' ' + message);
};


/**
 * Logs a warning message to the console.
 *
 * These messages only appear in debug builds of voodoo.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {string} message Text to log.
 */
Log_.prototype.warning_ = function(message) {
  if (DEBUG)
    this.consoleMessage_('**WARNING** ' + message);
};


/**
 * Logs an error message to the console and throws an exception.
 *
 * These messages appear in all builds of voodoo.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {string} msg Text to log.
 */
Log_.prototype.error_ = function(msg) {
  this.consoleMessage_('**ERROR** ' + msg);
  throw {
    name: 'Voodoo Exception',
    message: msg
  };
};


/**
 * Checks that a condition is not false, and if it is false,
 * logs an error.
 *
 * Asserts are only included in debug builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {?} condition Condition or object to verify.
 * @param {string} message Failure message to log.
 */
Log_.prototype.assert_ = function(condition, message) {
  if (DEBUG && !condition)
    this.error_('Assert failed: ' + message);
};


/**
 * The one and only log.
 *
 * @private
 */
var log_ = new Log_();
