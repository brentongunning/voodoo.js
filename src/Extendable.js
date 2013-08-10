// ----------------------------------------------------------------------------
// File: Extendable.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates an extendable type.
 *
 * Both the Model and View extend this base Extendable type. Derived
 * models and views must inherit from those base classes via extend.
 *
 * @constructor
 * @ignore
 */
function Extendable() {
  // Call the one and only construct function
  this['construct'].apply(this, arguments);
}


/**
 * Constructs this type.
 *
 * Extended types should override this. If they are not derived from Extendable
 * directly, then in their constructor they should call:
 *
 *      <BaseClass>.prototype.construct.apply(this, arguments);
 *
 * @ignore
 */
Extendable.prototype['construct'] = function() {
  throw 'Extendable::construct not implemented';
};


/**
 * Derives a new type from a base type. Both the Model and View are base types.
 *
 * @this {Extendable}
 * @ignore
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
Extendable['extend'] = function(opt_object) {
  var baseType = this;

  /**
    * @constructor
    * @private
    */
  var ExtendedType_ = function() {
    // Pass arguments up the chain and then to construct
    baseType['apply'](this, arguments);
  };
  ExtendedType_['extend'] = Extendable['extend'];

  /**
    * @constructor
    * @private
    */
  function BaseTypePrototype_() {
  }
  BaseTypePrototype_.prototype = baseType['prototype'];
  ExtendedType_.prototype = new BaseTypePrototype_();
  ExtendedType_.prototype.constructor = ExtendedType_;

  // Copy each property or function from the provided object
  for (var property in opt_object)
    ExtendedType_.prototype[property] = opt_object[property];

  return ExtendedType_;
};

// Exports
this['Extendable'] = Extendable;
