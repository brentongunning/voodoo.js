// ----------------------------------------------------------------------------
// File: BaseTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests the this.base property of Extendable.
 *
 * @constructor
 */
BaseTests = TestCase('BaseTests');


/**
 * Shuts down the engine between test cases.
 */
BaseTests.prototype.tearDown = function() {
  if (voodoo.engine)
    voodoo.engine.destroy();
};


/**
 * Tests this.base on an object extended.
 */
BaseTests.prototype.testBaseWithObject = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { fooCallers.push('Base'); }
  });

  A = Base.extend({
    foo: function() { this.base.foo(); fooCallers.push('A'); }
  });

  new A().foo();

  assertEquals(2, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
};


/**
 * Tests this.base on an extended object.
 */
BaseTests.prototype.testBaseWithExtendable = function() {
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

  new Extended().foo();

  assertEquals(2, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
};


/**
 * Tests this.base on a chain of multiple types.
 */
BaseTests.prototype.testBaseWithTypeChain = function() {
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

  new C().foo();

  assertEquals(4, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
  assertEquals('B', fooCallers[2]);
  assertEquals('C', fooCallers[3]);
};


/**
 * Tests this.base on an object chain created by inserting
 * one object in the middle of others.
 */
BaseTests.prototype.testBaseWithInsertedType = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() {
      if (typeof this.base.foo !== 'undefined')
        this.base.foo();
    }
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

  new ABCD().foo();

  assertEquals(4, fooCallers.length);
  assertEquals('A', fooCallers[0]);
  assertEquals('B', fooCallers[1]);
  assertEquals('C', fooCallers[2]);
  assertEquals('D', fooCallers[3]);
};


/**
 * Tests this.base on a chain of that has function gaps.
 */
BaseTests.prototype.testBaseWithIncompleteTypeChain = function() {
  var fooCallers = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { fooCallers.push('Base'); }
  });

  A = Base.extend({
    foo: function() { this.base.foo(); fooCallers.push('A'); }
  });

  B = A.extend();

  C = B.extend({
    foo: function() { this.base.foo(); fooCallers.push('C'); }
  });

  D = C.extend();

  new D().foo();

  assertEquals(3, fooCallers.length);
  assertEquals('Base', fooCallers[0]);
  assertEquals('A', fooCallers[1]);
  assertEquals('C', fooCallers[2]);
};


/**
 * Tests this.base functions with arguments.
 */
BaseTests.prototype.testBaseArguments = function() {
  var args = [];

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function(a, b) { args.push(a); args.push(b); }
  });

  A = Base.extend({
    foo: function(a, b) { this.base.foo(1, 2); args.push(a); args.push(b); }
  });

  new A().foo(3, 4);

  assertEquals(4, args.length);
  assertEquals(1, args[0]);
  assertEquals(2, args[1]);
  assertEquals(3, args[2]);
  assertEquals(4, args[3]);
};


/**
 * Tests return values from this.base functions.
 */
BaseTests.prototype.testBaseReturnValue = function() {
  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { return 'Base'; }
  });

  A = Base.extend({
    foo: function() { return this.base.foo() + 'A'; }
  });

  var a = new A();
  assertEquals('BaseA', a.foo());
};


/**
 * Tests that other functions at the base level are called.
 */
BaseTests.prototype.testBaseOverriddenFunctions = function() {
  var baseCalled = false;
  var aCalled = false;

  Base = voodoo.Extendable.extend({
    construct: function() {},
    foo: function() { this.bar(); },
    bar: function() { baseCalled = true; }
  });

  A = Base.extend({
    foo: function() { this.base.foo(); },
    bar: function() { aCalled = true; }
  });

  new A().foo();

  assert(baseCalled === false);
  assert(aCalled === true);
};
