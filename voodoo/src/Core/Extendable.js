// ----------------------------------------------------------------------------
// File: Extendable.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates an extendable type.
 *
 * Extendable provides some aspects of a classical inheritance system in
 * javascript. Each extended object:
 *
 *   1) Inherits all methods and variables from its parent.
 *   2) Automatically call construct() when instantiated via new.
 *   3) Enable calling overridden parent methods via this.base.
 *
 * Both Model and View derive from Extendable and override construct to perform
 * custom initialization. User models and views must inherit from them.
 *
 * @constructor
 * @ignore
 */
function Extendable() {
  // Remove methods that are the same as the top of the method stack because
  // the user will call them via this.method not this.base.method. These
  // duplicates are a side effect of the way we build the method stack.

  var methodStack = this['extendableMethodStack'];
  for (var name in methodStack) {
    if (!methodStack.hasOwnProperty(name))
      continue;

    var record = methodStack[name];
    if (this[name] === record.methods[record.current])
      --record.current;
  }

  // Set the base instance so the method stack functions to work properly.

  this['base'].instance = this;

  // Call the construct method to initialize the object.

  this['construct'].apply(this, arguments);
}


/**
 * Constructs this type. This is called when an instance is created.
 *
 * Extended types should override this.
 *
 * @ignore
 */
Extendable.prototype['construct'] = function() {
  log_.error_('Extendable::construct not implemented',
      '(Extendable::construct)');
};


/**
 * Parent method accessor. This work like base in C# or super in Java.
 *
 * @type {Object}
 */
Extendable.prototype['base'] = {};


/**
 * Derives a new type from a base type. Both the Model and View are base types.
 *
 * @this {?}
 * @ignore
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
Extendable['extend'] = function(opt_object) {
  function Child() {
    Extendable.apply(this, arguments);
  }

  Child['extend'] = Extendable['extend'];

  // Clone the current object.

  var parentPrototype = this.prototype;
  var childPrototype = Child.prototype;

  for (var property in parentPrototype) {
    if (parentPrototype.hasOwnProperty(property))
      childPrototype[property] = parentPrototype[property];
  }

  // Clone the current method stack.
  //
  // The method stack keeps track of all methods with the same name on this
  // object, as well as the current ones available from the base so that we
  // can let the user call this.base.method() and access a parent method.
  //
  // Each method in the method stack is tracked by a method record which stores
  // its unique methods in order as well as the index of the current one.

  var parentMethodStack = parentPrototype['extendableMethodStack'];
  var childMethodStack = childPrototype['extendableMethodStack'] = {};

  for (var name in parentMethodStack) {
    if (!parentMethodStack.hasOwnProperty(name))
      continue;

    var methodRecord = parentMethodStack[name];
    childMethodStack[name] = {
      methods: methodRecord.methods.slice(0),
      current: methodRecord.current
    };
  }

  // Add any missing parent methods to the method stack.
  // This can happen when the user adds methods to the prototype.
  // Here is an example. ## represents a comment.
  //
  //   var A = Extendable.extend();
  //
  //   ## A.method stack is currently:
  //   ##   {
  //   ##     'construct': {
  //   ##       methods: [Extendable.prototype.construct],
  //   ##       current: 0
  //   ##     }
  //   ##   }
  //
  //   A.prototype.initialize = function() {
  //     alert('Initializing'});
  //   };
  //
  //   ## A's method stack remains unchanged.
  //
  //   var B = A.extend();
  //
  //   ## B's method stack picks up A.initialize and is then:
  //   ##   {
  //   ##     'construct': {
  //   ##       methods: [Extendable.prototype.construct],
  //   ##       current: 0
  //   ##     },
  //   ##     'initialize': {
  //   ##       methods: [A.prototype.initialize],
  //   ##       current: 0
  //   ##     }
  //   ##   }

  function addToMethodStack(stack, name, method) {
    // Create the entry if it doesn't exist.

    var record = stack[name];
    if (!record)
      record = stack[name] = { methods: [], current: -1 };

    // Add the method iff it is different than our current top-of-stack.
    // This precludes duplicate methods.

    var recordMethods = record.methods;
    if (recordMethods[record.current] !== method) {
      recordMethods.push(method);
      ++record.current;
    }
  }

  for (var name in parentPrototype) {
    var parentMethod = parentPrototype[name];

    if (typeof parentMethod !== 'function')
      continue;

    if (!parentPrototype.hasOwnProperty(name))
      continue;

    addToMethodStack(childMethodStack, name, parentMethod);
  }

  // If there is no optional object provided, create the base and exit.

  function createBase() {
    var base = childPrototype['base'] = {};

    for (var name in childMethodStack) {
      if (!childMethodStack.hasOwnProperty(name))
        continue;

      var record = childMethodStack[name];
      var recordMethods = record.methods;

      base[name] = function(base, record, recordMethods) {
        return function() {
          if (record.current >= 0) {
            var current = record.current--;
            try {
              var ret = recordMethods[current].apply(base.instance, arguments);
            }
            catch (e) {
              record.current = record.methods.length - 1;
              throw e;
            }
            ++record.current;
            return ret;
          }
        };
      }(base, record, recordMethods);
    }
  }

  if (!opt_object) {
    createBase();
    return Child;
  }

  // Merge the method stack of the optional object with our new object's stack.

  if (typeof opt_object === 'function')
    opt_object = opt_object.prototype;

  var opt_objectMethodStack = opt_object['extendableMethodStack'];
  if (opt_objectMethodStack) {
    for (var name in opt_objectMethodStack) {
      if (!opt_objectMethodStack.hasOwnProperty(name))
        continue;

      var record = opt_objectMethodStack[name];
      var recordMethods = record.methods;

      for (var i = 0, len = recordMethods.length; i < len; ++i)
        addToMethodStack(childMethodStack, name, recordMethods[i]);
    }
  }

  // Append all methods and variables from the optional object onto our new
  // object and its method stack.

  for (var property in opt_object) {
    if (!opt_object.hasOwnProperty(property))
      continue;

    var propertyValue = opt_object[property];
    if (propertyValue === opt_objectMethodStack)
      continue;

    if (typeof propertyValue === 'function')
      addToMethodStack(childMethodStack, property, propertyValue);

    childPrototype[property] = propertyValue;
  }

  createBase();

  return Child;
};

// Exports
this['Extendable'] = Extendable;
