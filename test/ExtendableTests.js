// ----------------------------------------------------------------------------
// File: ExtendableTests.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests the Extendable base class.
 *
 * @constructor
 */
ExtendableTests = TestCase('ExtendableTests');


/**
 * Shuts down the engine between test cases.
 */
ExtendableTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined')
    voodoo.engine.destroy();
};


/**
 * Tests that derived types have their base type's constructors called.
 */
ExtendableTests.prototype.testExtendableConstruction = function() {
  var constructCount = 0;

  BaseType = voodoo.Extendable.extend({
    construct: function() {
      constructCount++;
    }
  });

  DerivedType = BaseType.extend();

  new BaseType();
  assertEquals(1, constructCount);

  new DerivedType();
  assertEquals(2, constructCount);
};


/**
 * Tests that base type members are copied into derived types.
 */
ExtendableTests.prototype.testExtendableTypeProperties = function() {
  BaseType = voodoo.Extendable.extend({
    name: 'BaseType',
    construct: function() {}
  });

  DerivedType = BaseType.extend();
  assertEquals('BaseType', new DerivedType().name);

  DerivedType.prototype.name = 'DerivedType';
  assertEquals('BaseType', new BaseType().name);
  assertEquals('DerivedType', new DerivedType().name);
};
