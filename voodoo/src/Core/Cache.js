// ------------------------------------------------------------------------------------------------
// File: Cache.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * A reference-counted storage cache where geometry, materials, and other data may be stored and
 * shared between different 3D components.
 *
 * @constructor
 *
 * @param {Object} cache The cache object to use.
 */
function Cache(cache) {
  log_.assert_(cache, 'cache must be valid.', '(Cache::Cache)');

  this.cache_ = cache;
}


/**
 * Increases the reference count of an object in the cache. This should normally be paired with
 * a call to release later.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses the current
 *   Model's organization.
 */
Cache.prototype['addRef'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::addRef)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  log_.assert_(subcache.hasOwnProperty(key), 'key must exist in cache.', '(Cache::addRef)');

  subcache[key].count++;
};


/**
 * Removes an object from the cache regardless of its current reference count.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses the current
 *   Model's organization.
 */
Cache.prototype['delete'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::delete)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  delete subcache[key];
};


/**
 * Gets the value stored for a given key.
 *
 * This function may be either synchronous or asynchronous. If synchronous, the caller should not
 * proivde opt_onGet, opt_onError, or opt_timeout arguments. The value at the key will be returned
 * immediately.
 *
 * If asynchronous, the opt_onGet parameter should be specified with a callback function that
 * accepts a single parameter, the value at the key. This will be called when the given key is
 * assigned a non-null value. If asynchronous, this function will not return a value. op_onError
 * may be specified with a callback function too that accepts a single parameter: the error
 * message. This will be called if the get operation times out.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {function(Object)=} opt_onGet Optional asynchronous getter.
 * @param {function(string)=} opt_onError Optional error handler.
 * @param {number=} opt_timeout Optional asynchronous timeout in milliseconds. Default is 2000.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses the current
 *   Model's organization.
 *
 * @return {?Object} The object for the given key.
 */
Cache.prototype['get'] = function(key, opt_onGet, opt_onError, opt_timeout, opt_name,
    opt_organization) {

  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return null;

  log_.assert_(key, 'key must be valid.', '(Cache::get)');

  var numArgs = arguments.length;
  var arg1 = arguments[1];

  var onGet = opt_onGet;
  var onErr = opt_onError;
  var timeout = opt_timeout;

  // Look for opt_onGet
  if (typeof arg1 === 'function') {
    // Case: Found opt_onGet. It won't be opt_Error because opt_onError must always be speciied
    // with opt_onGet.

    var arg2 = arguments[2];

    // Look for opt_onError
    if (typeof arg2 === 'function') {
      // Case: Found opt_onError.

      var arg3 = arguments[3];

      // Look for opt_timeout
      if (typeof arg3 == 'number') {
        // Case: Found opt_timeout.
      } else {
        // Case: Did not find opt_timeout.
        timeout = null;

        // Any other parameters must be opt_name and opt_organization.
        opt_name = arg3;
        opt_organization = arguments[4];
      }
    } else {
      // Case: Did not find opt_onError.
      onErr = null;

      // Look for opt_timeout.
      if (typeof arg2 === 'number') {
        // Case: Found opt_timeout.
      } else {
        // Case: Did not find opt_timeout.
        timeout = null;

        // Any other parameters must be opt_name and opt_organization.
        opt_name = arg2;
        opt_organization = arguments[3];
      }
    }
  } else {
    // Case: Did not find opt_onGet. The function must be synchronous.
    onGet = null;
    onErr = null;
    timeout = null;
    opt_name = arg1;
    opt_organization = arguments[2];
  }

  var subcache = this.getSubcache_(opt_name, opt_organization);

  if (onGet) {
    // Asynchronous

    // See if there is already a value.
    var record = subcache[key];
    var obj = record.obj;
    if (obj) {
      onGet(obj);
      return null;
    }

    timeout = timeout || 2000;

    var timedOut = false;
    var timeoutTimerId;
    if (onErr) {
      timeoutTimerId = window.setTimeout(function() {
        onErr('Cache::get timeout');
        timedOut = true;
      }, timeout);
    }

    // If not, set up a notifier for when a non-null value is set.
    record.notifiers.push(function(val) {
      window.clearTimeout(timeoutTimerId);
      if (!timedOut)
        onGet(val);
    });

    return null;
  } else {
    // Synchronous
    return subcache[key].obj;
  }
};


/**
 * Checks if an object exists in the cache for a given key.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses the current
 *   Model's organization.
 *
 * @return {boolean} True if an object exists in the cache, false if not.
 */
Cache.prototype['has'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return false;

  log_.assert_(key, 'key must be valid.', '(Cache::has)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  return subcache.hasOwnProperty(key);
};


/**
 * Decreases the reference count of an object in the cache. Once the object's reference count
 * reaches zero, the object is deleted from the cache.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses the current
 *   Model's organization.
 */
Cache.prototype['release'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::release)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  if (subcache.hasOwnProperty(key)) {
    if (--subcache[key].count <= 0)
      delete subcache[key];
  }
};


/**
 * Stores an object in the cache under a given key. If the key is not yet in the cace, this will
 * set its reference count to 1. If the key is already in the cache, the reference count will
 * remain the same.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {Object=} opt_value Value to store. If unspecified, then this function reserves the key
 *   for later, and used for asynchronous gets.
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If not specified, uses thecurrent
 *   Model's organization.
 */
Cache.prototype['set'] = function(key, opt_value, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::set)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  if (subcache.hasOwnProperty(key)) {
    var record = subcache[key];

    record.obj = opt_value;

    if (opt_value) {
      var notifiers = record.notifiers;

      for (var i = 0, len = notifiers.length; i < len; ++i)
        notifiers[i](opt_value);

      record.notifiers = [];
    }
  } else {
    subcache[key] = {
      obj: opt_value,
      count: 1,
      notifiers: []
    };
  }
};


/**
 * Retrieves the subcache for the given name and organization, or if not specified, the current
 * model's name and organization.
 *
 * @private
 *
 * @param {string=} opt_name Optional model name. If not specified, uses the current Model's name.
 * @param {string=} opt_organization Optional organization name. If both this opt_name are
 *   unspecified, uses the current Model's organization.
 *
 * @return {Object} The model's subcache.
 */
Cache.prototype.getSubcache_ = function(opt_name, opt_organization) {
  var name, organization;

  if (!opt_name) {

    name = this.modelName_;
    organization = this.modelOrganization_;

  } else {

    name = opt_name;
    organization = opt_organization || defaultOrganization_;

  }

  if (!this.cache_.hasOwnProperty(organization))
    this.cache_[organization] = {};

  var organizationCache = this.cache_[organization];

  if (!organizationCache.hasOwnProperty(name))
    organizationCache[name] = {};

  return organizationCache[name];
};


/**
 * The name of the model customized for.
 *
 * @private
 * @type {string}
 */
Cache.prototype.modelName_ = '';


/**
 * The organization of the model customized for.
 *
 * @private
 * @type {string}
 */
Cache.prototype.modelOrganization_ = '';
