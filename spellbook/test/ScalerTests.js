// ----------------------------------------------------------------------------
// File: ScalerTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Scaler class works as expected.
 *
 * @constructor
 */
ScalerTests = TestCase('ScalerTests');


/**
 * Shutdown the engine between test cases.
 */
ScalerTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Scale class can be extended from other types.
 */
ScalerTests.prototype.testScalerExtend = function() {
  var ScalerBase = SimpleModel.extend(voodoo.Scaler);
  var BaseScaler = voodoo.Scaler.extend(SimpleModel);

  var instance1 = new ScalerBase({scale: 2});
  var instance2 = new BaseScaler({scale: [1, 1, 0]});
};


/**
 * Tests that the scale can be set in multiple ways.
 */
ScalerTests.prototype.testScalerSetScale = function() {
  var Scaler = voodoo.Scaler.extend(DummyModel);
  var instance = new Scaler({scale: 2});

  var instanceScale = instance.scale;
  assertEquals(2, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(2, instanceScale.z);

  instance.scale.x = 1;

  instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(2, instanceScale.z);

  instance.scale = [0.25, 0.5, 0.75];

  instanceScale = instance.scale;
  assertEquals(0.25, instanceScale.x);
  assertEquals(0.5, instanceScale.y);
  assertEquals(0.75, instanceScale.z);

  instance.scale = {x: 0.1, y: 0.2, z: 0.3};

  instanceScale = instance.scale;
  assertEquals(0.1, instanceScale.x);
  assertEquals(0.2, instanceScale.y);
  assertEquals(0.3, instanceScale.z);

  instance.scale = 5;

  instanceScale = instance.scale;
  assertEquals(5, instanceScale.x);
  assertEquals(5, instanceScale.y);
  assertEquals(5, instanceScale.z);

  instance.setScale([1, 2, 3]);

  instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(3, instanceScale.z);

  instance.setScale(2, 3, 4);

  instanceScale = instance.scale;
  assertEquals(2, instanceScale.x);
  assertEquals(3, instanceScale.y);
  assertEquals(4, instanceScale.z);

  instance.scaleTo(0.1, 0);

  instanceScale = instance.scale;
  assertEquals(0.1, instanceScale.x);
  assertEquals(0.1, instanceScale.y);
  assertEquals(0.1, instanceScale.z);
};


/**
 * Tests that the scaleBegin and scaleEnd events work.
 */
ScalerTests.prototype.testScalerEvents = function() {
  var Scaler = voodoo.Scaler.extend(DummyModel);
  var instance = new Scaler();

  var scaleBegin = false;
  var scaleEnd = false;
  var scale = false;

  instance.on('scaleBegin', function() { scaleBegin = true; });
  instance.on('scaleEnd', function() { scaleEnd = true; });
  instance.on('scale', function() { scale = true; });

  instance.scaleTo(0.5, 0.4, 0.3, 0.0001);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!scaleEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Scale Begin', scaleBegin);
  assert('Scale End', scaleEnd);
  assert('Scale', scale);

  var instanceScale = instance.scale;
  assertEquals(0.5, instanceScale.x);
  assertEquals(0.4, instanceScale.y);
  assertEquals(0.3, instanceScale.z);
};
