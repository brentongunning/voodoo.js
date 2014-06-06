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
 * Tests standard lighting will create a camera and ambient light.
 */
LightTests.prototype.testEnableStandardLighting = function() {
  var cameraLight = null, ambientLight = null;

  var engine = voodoo.engine = new voodoo.Engine({});
  var models = engine.models;

  assertEquals(2, models.length);

  for (var i = 0, len = models.length; i < len; ++i) {
    var model = models[i];
    var modelName = model.name;

    if (modelName === 'CameraLight') {
      cameraLight = model;
    } else if (modelName === 'AmbientLight') {
      ambientLight = model;
    }
  }

  assertNotNull(cameraLight);
  assertNotNull(ambientLight);

  assertEquals('white', cameraLight.color);
  assertEquals('white', ambientLight.color);
};


/**
 * Tests disabling standing lighting will not create any default lights.
 */
LightTests.prototype.testDisableStandardLighting = function() {
  var cameraLight = null, ambientLight = null;

  var options = new voodoo.Options();
  options.standardLighting = false;
  var engine = voodoo.engine = new voodoo.Engine(options);

  assertEquals(0, engine.models.length);
};
