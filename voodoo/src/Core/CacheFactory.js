// ----------------------------------------------------------------------------
// File: CacheFactory.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates caches for a Model or View.
 *
 * @constructor
 * @private
 */
function CacheFactory_() {
  log_.info_('Creating Cache Factory');

  this.cache_ = {};
}


/**
 * Creates a cache specific to a Model or View.
 *
 * @private
 *
 * @param {Model} model Model owner, or the Model of a View owner.
 * @return {Cache} Instantiated Cache.
 */
CacheFactory_.prototype.createCache_ = function(model) {
  var cache = new Cache(this.cache_);

  cache.modelName_ = model['name'];
  cache.modelOrganization_ = model['organization'];

  return cache;
};
