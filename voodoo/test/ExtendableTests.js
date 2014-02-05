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


/**
 * Tests that it's always OK to call this.base.X when X is
 * is defined on an extended type at this level. The function
 * called should just be a dummy.
 */
ExtendableTests.prototype.testDummyBase = function() {
  done = false;

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { this.base.foo(); done = true; }
  });

  new Base().foo();
  assertTrue('Base.foo() called', done);
};


/**
 * Tests this.base on an object extended.
 */
ExtendableTests.prototype.testBaseWithObject = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { fooCallers.push('Base'); }
  });

  A = Base.extend({
    foo: function() { this.base.foo(); fooCallers.push('A'); }
  });

  new A();

  assertEquals(2, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
};


/**
 * Tests this.base on an Extendable extended.
 */
ExtendableTests.prototype.testBaseWithExtendable = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { fooCallers.push('Base'); }
  });

  A = voodoo.Extendable.extend({
    construct: function() {}
  });
  A.prototype.foo = function() {
    this.base.foo();
    fooCallers.push('A');
  };

  Extended = Base.extend(A);

  new Extended();

  assertEquals(2, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
};


/**
 * Tests this.base on a chain of multiple types.
 */
ExtendableTests.prototype.testBaseWithTypeChain = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { fooCallers.push('Base'); }
  });

  A = Base.extend({
    foo: function() { this.base.foo(); fooCallers.push('A'); }
  });

  B = A.extend({
    foo: function() { this.base.foo(); fooCallers.push('B'); }
  });

  C = B.extend({
    foo: function() { this.base.foo(); fooCallers.push('C'); }
  });

  new C();

  assertEquals(4, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
  assertEquals('B', fooCallers[2]);
  assertEquals('B', fooCallers[3]);
};


/**
 * Tests this.base on an object chain created by inserting
 * one object in the middle of others.
 */
ExtendableTests.prototype.testBaseWithInsertedType = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {}
  });

  A = Base.extend();
  A.prototype.foo = function() { this.base.foo(); fooCallers.push('A'); };

  B = Base.extend();
  B.prototype.foo = function() { this.base.foo(); fooCallers.push('B'); };

  C = Base.extend();
  C.prototype.foo = function() { this.base.foo(); fooCallers.push('C'); };

  D = Base.extend();
  D.prototype.foo = function() { this.base.foo(); fooCallers.push('D'); };

  AB = A.extend(B);
  CD = C.extend(D);
  ABCD = AB.extend(CD);

  new ABCD();

  assertEquals(4, fooCallers.length);
  assertEquals('A', fooCallers[0]);
  assertEquals('B', fooCallers[1]);
  assertEquals('C', fooCallers[2]);
  assertEquals('D', fooCallers[3]);
};
