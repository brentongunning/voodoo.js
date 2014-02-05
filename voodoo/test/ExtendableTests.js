// ----------------------------------------------------------------------------
// File: ExtendableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
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


/**
 * Tests that an extendable can be extended with another extendable.
 */
ExtendableTests.prototype.testExtendAnotherExtendable = function() {
  Base = voodoo.Extendable.extend({
    initialized: false,
    construct: function() { this.initialized = true; }
  });

  A = Base.extend({
    a: true,
    b: false
  });

  B = Base.extend({
    b: true
  });

  AB = A.extend(B);

  var ab = new AB();
  assertTrue('Base extended', ab.initialized);
  assertTrue('A extended', ab.a);
  assertTrue('B extended', ab.b);
};
