// ----------------------------------------------------------------------------
// File: EngineTests.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for the engine as a whole.
 *
 * @constructor
 */
EngineTests = TestCase('EngineTests');


/**
 * Placeholder for engine test case setup.
 */
EngineTests.prototype.setUp = function() {
  // No-op
};


/**
 * Shuts down the engine between test cases.
 */
EngineTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined')
    voodoo.engine.destroy();
};


/**
 * Tests that an engine can be created using default options.
 */
EngineTests.prototype.testCreateEngineWithDefaultOptions = function() {
  voodoo.engine = new voodoo.Engine(new voodoo.Options());
};


/**
 * Tests that can engine can be created with simple custom options.
 */
EngineTests.prototype.testCreateEngineWithCustomOptions = function() {
  var options = new voodoo.Options();
  options.aboveLayer = true;
  options.aboveZIndex = 100;
  options.antialias = false;
  options.belowLayer = true;
  options.belowZIndex = -100;
  options.fovY = 45;
  options.frameLoop = true;
  options.renderer = voodoo.Renderer.ThreeJs;
  options.standardLighting = false;

  voodoo.engine = new voodoo.Engine(options);
};


/**
 * Tests that can engine can be created with simple custom options.
 */
EngineTests.prototype.testCreateEngineWithInvalidOptions = function() {
  var options = new voodoo.Options();
  options.aboveLayer = false;
  options.belowLayer = false;

  assertException('Invalid engine options', function() {
    voodoo.engine = new voodoo.Engine(options);
  });
};


/**
 * Tests that an engine can be destroyed after it is created.
 */
EngineTests.prototype.testDestroyEngine = function() {
  voodoo.engine = new voodoo.Engine(new voodoo.Options());
  voodoo.engine.destroy();

  assert(typeof voodoo.engine === 'undefined');
};


/**
 * Tests that the ThreeJs renderer is used by default.
 */
EngineTests.prototype.testThreeJsRenderer = function() {
  var renderer = null;

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() { renderer = this.renderer; }
    })
  });
  new CustomModel();

  assertEquals(voodoo.Renderer.ThreeJs, renderer);
};
