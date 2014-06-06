// ----------------------------------------------------------------------------
// File: WireframeTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Wireframe class works as expected.
 *
 * @constructor
 */
var WireframeTests = TestCase('WireframeTests');


/**
 * Shutdown the engine between test cases.
 */
WireframeTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Wireframe class can be extended from other types.
 */
WireframeTests.prototype.testWireframeExtend = function() {
  var WireframeBase = SimpleModel.extend(voodoo.Wireframe);
  var BaseWireframe = voodoo.Wireframe.extend(SimpleModel);

  var instance1 = new WireframeBase();
  var instance2 = new BaseWireframe();

  instance1.wireframe = false;
  instance2.setWireframe(false);
};


/**
 * Tests that the changeWireframe events work.
 */
WireframeTests.prototype.testWireframeEvents = function() {
  var Wireframe = voodoo.Wireframe.extend(DummyModel);
  var instance = new Wireframe();

  var changeWireframe = 0;
  instance.on('changeWireframe', function() { changeWireframe++; });

  instance.wireframe = false;
  instance.setWireframe(true);

  assertEquals(2, changeWireframe);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
WireframeTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Wireframe = voodoo.Wireframe.extend(DummyModel);
  var instance = new Wireframe();

  assertException(function() {
    new voodoo.Wireframe({
      wireframe: 'true'
    });
  });

  assertException(function() {
    instance.wireframe = null;
  });

  assertException(function() {
    instance.setWireframe(0);
  });
};
