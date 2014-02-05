// ----------------------------------------------------------------------------
// File: Extendable.js
//
// Copyright (c) 2014 VoodooJs Authors
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
    * Base type is the current type without the constructor. Extended type
    * will set its protototype to this
    * @constructor.
    * @private
    */
  function BaseType_() {}
  var baseTypePrototype = baseType['prototype'];
  BaseType_.prototype = baseTypePrototype;

  /**
    * Extended type is the new type we return. It has all the same
    * function as the base type.
    * @constructor
    * @private
    */
  var ExtendedType_ = function() {
    // Pass arguments up the chain and then to construct
    baseType['apply'](this, arguments);
  };
  ExtendedType_['extend'] = Extendable['extend'];
  ExtendedType_.prototype = new BaseType_();
  ExtendedType_.prototype.constructor = ExtendedType_;

  // Append the new functions and variables from opt_object onto ExtendedType
  if (typeof opt_object !== 'undefined') {
    var isObject = typeof opt_object !== 'function';
    log_.assert_(isObject || typeof opt_object['extend'] !== 'undefined',
        'Extend must either be pased null, an object or another Extendable.');
    var newFunctions = isObject ? opt_object : opt_object.prototype;
    for (var key in newFunctions)
      ExtendedType_.prototype[key] = newFunctions[key];
  }

  return ExtendedType_;
};

// Exports
this['Extendable'] = Extendable;
