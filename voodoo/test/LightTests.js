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
  if (typeof voodoo.engine !== 'undefined')
    voodoo.engine.destroy();
};


/**
 * Tests the operations of an ambient light.
 *
 * @param {?} queue Test step queue.
 */
LightTests.prototype.testEnableStandardLighting = function(queue) {
  var cameraLight = null, ambientLight = null;

  voodoo.engine = new voodoo.Engine({});

  assertEquals(2, voodoo.engine.models.length);

  for (var i = 0; i < voodoo.engine.models.length; ++i) {
    if (voodoo.engine.models[i].name === 'CameraLight') {
      cameraLight = voodoo.engine.models[i];
    } else if (voodoo.engine.models[i].name === 'AmbientLight') {
      ambientLight = voodoo.engine.models[i];
    }
  }

  assertNotNull(cameraLight);
  assertNotNull(ambientLight);

  assertEquals('white', cameraLight.color);
  assertEquals('white', ambientLight.color);
};


/**
 * Tests the operations of a camera light.
 */
LightTests.prototype.testDisableStandardLighting = function() {
  var cameraLight = null, ambientLight = null;

  var options = new voodoo.Options();
  options.standardLighting = false;
  voodoo.engine = new voodoo.Engine(options);

  assertEquals(0, voodoo.engine.models.length);
};
