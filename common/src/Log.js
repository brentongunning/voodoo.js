// ----------------------------------------------------------------------------
// File: Log.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Logger.
 *
 * @constructor
 *
 * @private
 *
 * @param {string} opt_project Optional project name. Defaults to voodoo.
 */
function Log_(opt_project) {
  this.project_ = opt_project || 'voodoo';
  this.prefix_ = '[' + this.project_ + ']';
}


/**
 * Logs a message. Supports multiple arguments. Messages logged using this
 * method appear in both debug and release builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {...?} message Text to log.
 */
Log_.prototype.log_ = function(message) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this.prefix_);

  window.console.log(args.join(' '));
};


/**
 * Logs an information message. Supports multiple arguments.
 * These messages only appear in debug builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {...?} message Text to log.
 */
Log_.prototype.info_ = function(message) {
  if (DEBUG)
    this.log_.apply(this, arguments);
};


/**
 * Logs an informational message about a model. Supports multiple arguments.
 * These messages only appear in debug builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {Object} model Model to log about.
 * @param {...?} message Text to log.
 */
Log_.prototype.model_ = function(model, message) {
  var args = Array.prototype.slice.call(arguments, 1);
  args.unshift(model['privateModelProperties']['id']);

  this.info_.apply(this, args);
};


/**
 * Logs a warning message to the console. Supports multiple arguments.
 * These messages only appear in debug builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {...?} message Text to log.
 */
Log_.prototype.warn_ = function(message) {
  if (DEBUG) {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('**WARNING**');

    this.log_.apply(this, args);
  }
};


/**
 * Logs an error message to the console and throws an exception.
 * Supports multiple arguments. These messages appear in all builds.
 *
 * @private
 *
 * @this {Log_}
 *
 * @param {...?} message Text to log.
 */
Log_.prototype.error_ = function(message) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('**ERROR**');
  this.log_.apply(this, args);

  throw {
    name: this.project_ + ' exception',
    message: args.slice(1).join(' '),
    toString: function(){ return this.name + ": " + this.message; } 
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
 * @param {...?} message Failure message to log.
 */
Log_.prototype.assert_ = function(condition, message) {
  if (DEBUG && !condition) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift('Assert failed:');

    this.error_.apply(this, args);
  }
};
