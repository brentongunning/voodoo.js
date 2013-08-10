// ----------------------------------------------------------------------------
// File: Composite.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates an aggregate object of objects of the same type.
 *
 * Given an array of objects of the same type, this function generates
 * a new object that has the same function signature as the original but
 * instead calls each of the individual objects internally.
 *
 * @constructor
 * @private
 *
 * @param {Array.<Object>} objects Objects to aggregate.
 */
function Composite_(objects) {
  log_.assert_(objects.length > 0, 'Composite objects must not be empty');

  // Take the first view and use it to the composite assuming the rest
  // are the same.
  var base = objects[0];
  var composite = this;

  for (var property in base) {
    try {
      // Check if this property is a function
      if (typeof(base[property]) === 'function') {
        composite[property] = (function(property, objects) {
          // Create a function that wraps calls to all object
          return function() {
            var returnVal;
            for (var index = 0; index < objects.length; ++index) {
              var object = objects[index];
              returnVal = object[property].apply(object, arguments);
            }
            return returnVal == objects[objects.length - 1] ?
                composite : returnVal;
          };
        })(property, objects);
      }
    } catch (err) {
      // No-op, ignore property reading errors
    }
  }
}
