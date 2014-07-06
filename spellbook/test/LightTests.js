// ----------------------------------------------------------------------------
// File: LightTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for the lights.
 *
 * @constructor
 */
var LightTests = TestCase('LightTests');


/**
 * Placeholder for light test case setup.
 */
LightTests.prototype.setUp = function() {
  //No-op
};


/**
 * Shuts down the engine between test cases.
 */
LightTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests the operations of an ambient light.
 */
LightTests.prototype.testAmbientLight = function() {
  var ambientLight = new voodoo.AmbientLight({
    color: 'red'
  });

  assertEquals('red', ambientLight.color);
};


/**
 * Tests the operations of a camera light.
 */
LightTests.prototype.testCameraLight = function() {
  var cameraLight = new voodoo.CameraLight({
    color: 'rgb(10, 50, 200)'
  });

  assertEquals('rgb(10, 50, 200)', cameraLight.color);
};


/**
 * Tests the operations of a mouse light.
 */
LightTests.prototype.testMouseLight = function() {
  var mouseLight = new voodoo.MouseLight();

  mouseLight.setColor('black');
  mouseLight.setHeight(100);
  mouseLight.height = 0;

  assertEquals('black', mouseLight.color);
};


/**
 * Tests that the light events work correctly
 */
LightTests.prototype.testLightEvents = function() {
  var ambientLight = new voodoo.AmbientLight({
    color: 'red'
  });

  var numColorChanges = 0;

  ambientLight.on('changeColor', function() {
    ++numColorChanges;
  });

  assertEquals(0, numColorChanges);

  ambientLight.color = 'red';
  assertEquals(0, numColorChanges);

  ambientLight.setColor('blue');
  assertEquals(1, numColorChanges);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
LightTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  assertException(function() {
    new voodoo.AmbientLight({
      color: []
    });
  });

  assertException(function() {
    new voodoo.CameraLight({
      color: 2
    });
  });

  assertException(function() {
    new voodoo.MouseLight({
      color: {}
    });
  });
};
