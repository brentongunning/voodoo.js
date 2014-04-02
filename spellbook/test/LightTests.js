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
LightTests = TestCase('LightTests');


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

  assertEquals('black', mouseLight.color);
};
