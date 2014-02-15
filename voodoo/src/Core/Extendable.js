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
  var self = this;
  this.base_ = null;

  function createBases() {
    var ancestors = self.constructor['ancestors'];
    var bases = [];

    function createBase(index) {
      var base = {};
      var type = ancestors[index];
      var proto = type.prototype;

      for (var key in proto) {
        var val = proto[key];
        if (typeof val !== 'function')
          continue;

        // The most recent function is a special case if it was not overridden
        // in the last item in the chain. We must detect it and make sure we
        // don't mistakenly think our function in the chain is unique when it
        // isn't.
        if (val === self[key]) {
          // Make sure there are no differences from this base up the chain.
          // This ensures we don't think A->B->A->B, that the first B is the
          // latest.
          var differences = false;
          for (var j = index + 1; j < ancestors.length; ++j) {
            if (ancestors[j].prototype[key] !== val) {
              differences = true;
              break;
            }
          }
          if (!differences) {
            // Change our function we're going to run when called to be
            // the next one in the chain that we would call.
            var found = false;
            for (var j = index - 1; j >= 0; --j) {
              var ancFunc = ancestors[j].prototype[key];
              if (ancFunc !== val && typeof ancFunc !== 'undefined') {
                val = function(j, key) {
                  return function() {
                    bases[j][key].apply(self, arguments);
                  }
                }(j, key);
                found = true;
                break;
              }
            }
            if (!found)
              continue;
          }
        }

        // Find this function's parent base. The parent base is the first up
        // the inheritance chain whose function is different than this one,
        // meaning it was specifically overridden.
        var parentBase = {};
        for (var j = index - 1; j >= 0; --j) {
          if (ancestors[j].prototype[key] !== val) {
            parentBase = bases[j];
            break;
          }
        }

        // Wrapped the function so that when it's called, this.base
        // obtains its new meaning inside it and all the functions are
        // those at that inheritance level.
        base[key] = function(key, val, proto, parentBase) {
          return function() {
            // Save the current base to set back later.
            var storedBase = self.base_;
            self.base_ = parentBase;

            // Set all functions at this level. Save the old ones.
            var saved = {};
            for (var protoKey in proto) {
              var protoVal = proto[protoKey];
              if (typeof protoVal !== 'function')
                continue;
              saved[protoKey] = self[protoKey];
              self[protoKey] = protoVal;
            }

            // Call the function.
            val.apply(self, arguments);

            // Set back the old functions and base.
            for (var savedKey in saved) {
              self[savedKey] = saved[savedKey];
            }
            self.base_ = storedBase;
          }
        }(key, val, proto, parentBase);
      }

      bases.push(base);
    }

    for (var i = 0; i < ancestors.length; ++i)
      createBase(i);
    self.base_ = bases.length > 0 ? bases[bases.length - 1] : {};
  }

  Object.defineProperty(this, 'base', {
    get: function() {
      if (!self.base_)
        createBases();
      return self.base_;
    },
    set: function() { log_.error_('base is read-only'); },
    writeable: false
  });

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
 * Parent object in the inheritance chain.
 *
 * @type {Object}
 */
Extendable.prototype['base'] = {};


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
  log_.assert_(typeof this === 'function', 'Invalid Extendable.');
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
  ExtendedType_['extend'] = baseType['extend'];
  ExtendedType_.prototype = new BaseType_();

  // Append opt_object's properties onto ExtendedType
  var isExtended = false;
  if (typeof opt_object !== 'undefined') {
    isExtended = typeof opt_object === 'function';
    log_.assert_(!isExtended || typeof opt_object['extend'] !== 'undefined',
        'Extend must either be pased null, an object or another Extendable.');

    var properties = isExtended ? opt_object.prototype : opt_object;
    for (var key in properties)
      ExtendedType_.prototype[key] = properties[key];
  }
  ExtendedType_.prototype.constructor = ExtendedType_;

  // Construct ancestors
  var ancestors = typeof baseType['ancestors'] === 'undefined' ?
      [] : baseType['ancestors'].slice(0);

  /** @type {Object} */
  var self = this;

  if (self !== Extendable)
    ancestors.push(baseType);
  if (isExtended) {
    ancestors = ancestors.concat(opt_object['ancestors']);
    ancestors.push(opt_object);
  }
  ExtendedType_['ancestors'] = ancestors.slice(0);

  return ExtendedType_;
};

// Exports
this['Extendable'] = Extendable;
