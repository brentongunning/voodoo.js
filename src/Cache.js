// ----------------------------------------------------------------------------
// File: Cache.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * A storage cache where geometry, materials, and other data may be stored
 * and shared between different instances of 3D controls.
 *
 * @constructor
 *
 * @param {Object} cache The cache object to use.
 */
function Cache(cache) {
  this.cache_ = cache;
}


/**
 * Removes an object from the cache.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name.
 */
Cache.prototype['delete'] = function(key, opt_name, opt_organization) {
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
 * @param {string=} opt_organization Optional organization name.
 *
 * @return {Object} The object for the given key.
 */
Cache.prototype['get'] = function(key, opt_name, opt_organization) {
  var subcache = this.getSubcache_(opt_name, opt_organization);

  return subcache[key];
};


/**
 * Checks if an object exists in the cache for a given key.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name.
 *
 * @return {boolean} True if an object exists in the cache, false if not.
 */
Cache.prototype['has'] = function(key, opt_name, opt_organization) {
  var subcache = this.getSubcache_(opt_name, opt_organization);

  return subcache.hasOwnProperty(key);
};


/**
 * Stores an object in the cache under a given key.
 *
 * @this {Cache}
 *
 * @param {string} key Storage key.
 * @param {Object} value Value to store.
 * @param {string=} opt_name Optional model name. If not specified, uses the
 * current Model's name.
 * @param {string=} opt_organization Optional organization name.
 */
Cache.prototype['set'] = function(key, value, opt_name, opt_organization) {
  var subcache = this.getSubcache_(opt_name, opt_organization);

  subcache[key] = value;
};


/**
 * Customizes the cache for a specific model.
 *
 * @private
 *
 * @param {Model} model Model to customize for.
 *
 * @return {Cache} Customized cache.
 */
Cache.prototype.applyModel_ = function(model) {
  var cache = new Cache(this.cache_);

  cache.modelName_ = model['name'];
  cache.modelOrganization_ = model['organization'];

  return cache;
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
  if (typeof opt_name === 'undefined') {
    name = this.modelName_;
    organization = this.modelOrganization_;
  } else {
    name = opt_name;
    organization = opt_organization || defaultOrganization_;
  }

  if (!this.cache_.hasOwnProperty(organization))
    this.cache_[organization] = {};

  if (!this.cache_[organization].hasOwnProperty(name))
    this.cache_[organization][name] = {};

  return this.cache_[organization][name];
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
