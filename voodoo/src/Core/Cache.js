// ----------------------------------------------------------------------------
// File: Cache.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * A reference-counted storage cache where geometry, materials, and other data
 * may be stored and shared between different 3D components.
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
 * Increases the reference count of an object in the cache. This should
 * normally be paired with a call to release later.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
 */
Cache.prototype['addRef'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::addRef)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  log_.assert_(subcache.hasOwnProperty(key), 'key must exist in cache.',
      '(Cache::addRef)');

  subcache[key].count++;
};


/**
 * Removes an object from the cache regardless of its current reference count.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
 */
Cache.prototype['delete'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::delete)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  delete subcache[key];
};


/**
 * Gets the object stored under a given key.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
 *
 * @return {Object} The object for the given key.
 */
Cache.prototype['get'] = function(key, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return null;

  log_.assert_(key, 'key must be valid.', '(Cache::get)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  return subcache[key].obj;
};


/**
 * Checks if an object exists in the cache for a given key.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
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
 * Decreases the reference count of an object in the cache. Once the object's
 * reference count reaches zero, the object is deleted from the cache.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
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
 * Stores an object in the cache under a given key. If the key is not yet in
 * the cace, this will set its reference count to 1. If the key is already in
 * the cache, the reference count will remain the same.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {Object} value Value to store.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If not
 * specified, uses the current Model's organization.
 */
Cache.prototype['set'] = function(key, value, opt_name, opt_organization) {
  if (DEBUG && window['voodoo']['debug']['disableCache'])
    return;

  log_.assert_(key, 'key must be valid.', '(Cache::set)');

  var subcache = this.getSubcache_(opt_name, opt_organization);

  if (subcache.hasOwnProperty(key)) {
    subcache[key].obj = value;
  } else {
    subcache[key] = {
      obj: value,
      count: 1
    };
  }
};


/**
 * Retrieves the subcache for the given name and organization, or if not
 * specified, the current model's name and organization.
 *
 * @private
 *
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name. If both this
 * opt_name are unspecified, uses the current Model's organization.
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
