// ----------------------------------------------------------------------------
// File: ModelTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for the View.
 *
 * @constructor
 */
var ViewTests = TestCase('ViewTests');


/**
 * Placeholder for View test case setup.
 */
ViewTests.prototype.setUp = function() {
  // No-op
};


/**
 * Shuts down the engine between test cases.
 */
ViewTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that when a View is extended from another View, that the
 * most conservative choice is set for above/below.
 */
ViewTests.prototype.testExtendViewWithAboveBelow = function() {
  var A = voodoo.View.extend({
    above: false,
    below: false
  });

  assertFalse('A above:', A.prototype.above);
  assertFalse('A below:', A.prototype.below);

  var B = A.extend({
    above: true,
    below: false
  });

  assertTrue('B above:', B.prototype.above);
  assertFalse('B below:', B.prototype.below);

  var C = A.extend();
  C.prototype.above = false;
  C.prototype.below = true;

  assertFalse('C above:', C.prototype.above);
  assertTrue('C below:', C.prototype.below);

  var D = B.extend(C);

  assertTrue('D above:', D.prototype.above);
  assertTrue('D below:', D.prototype.below);
};
