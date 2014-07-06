// ----------------------------------------------------------------------------
// File: ScalableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Scalable class works as expected.
 *
 * @constructor
 */
var ScalableTests = TestCase('ScalableTests');


/**
 * Shutdown the engine between test cases.
 */
ScalableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Scalable class can be extended from other types.
 */
ScalableTests.prototype.testScalableExtend = function() {
  var ScalableBase = SimpleModel.extend(voodoo.Scalable);
  var BaseScalable = voodoo.Scalable.extend(SimpleModel);

  var instance1 = new ScalableBase({scale: 2});
  var instance2 = new BaseScalable({scale: [1, 1, 0]});
};


/**
 * Tests that the scale can be set in multiple ways.
 */
ScalableTests.prototype.testScalableSetScale = function() {
  var Scalable = voodoo.Scalable.extend(DummyModel);
  var instance = new Scalable({scale: 2});

  var instanceScale = instance.scale;
  assertEquals(2, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(2, instanceScale.z);

  var instanceTargetScale = instance.targetScale;
  assertEquals(2, instanceTargetScale.x);
  assertEquals(2, instanceTargetScale.y);
  assertEquals(2, instanceTargetScale.z);

  instance.scale.x = 1;

  instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(2, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(1, instanceTargetScale.x);
  assertEquals(2, instanceTargetScale.y);
  assertEquals(2, instanceTargetScale.z);

  instance.scale = [0.25, 0.5, 0.75];

  instanceScale = instance.scale;
  assertEquals(0.25, instanceScale.x);
  assertEquals(0.5, instanceScale.y);
  assertEquals(0.75, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(0.25, instanceTargetScale.x);
  assertEquals(0.5, instanceTargetScale.y);
  assertEquals(0.75, instanceTargetScale.z);

  instance.scale = {x: 0.1, y: 0.2, z: 0.3};

  instanceScale = instance.scale;
  assertEquals(0.1, instanceScale.x);
  assertEquals(0.2, instanceScale.y);
  assertEquals(0.3, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(0.1, instanceTargetScale.x);
  assertEquals(0.2, instanceTargetScale.y);
  assertEquals(0.3, instanceTargetScale.z);

  instance.scale = 5;

  instanceScale = instance.scale;
  assertEquals(5, instanceScale.x);
  assertEquals(5, instanceScale.y);
  assertEquals(5, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(5, instanceTargetScale.x);
  assertEquals(5, instanceTargetScale.y);
  assertEquals(5, instanceTargetScale.z);

  instance.setScale([1, 2, 3]);

  instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(3, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(1, instanceTargetScale.x);
  assertEquals(2, instanceTargetScale.y);
  assertEquals(3, instanceTargetScale.z);

  instance.scaleTo(0.1, 0);

  instanceScale = instance.scale;
  assertEquals(0.1, instanceScale.x);
  assertEquals(0.1, instanceScale.y);
  assertEquals(0.1, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(0.1, instanceTargetScale.x);
  assertEquals(0.1, instanceTargetScale.y);
  assertEquals(0.1, instanceTargetScale.z);
};


/**
 * Tests that the scaleBegin and scaleEnd events work.
 */
ScalableTests.prototype.testScalableEvents = function() {
  var Scalable = voodoo.Scalable.extend(DummyModel);
  var instance = new Scalable();

  var scaleBegin = false;
  var scaleEnd = false;
  var scale = false;

  var instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(1, instanceScale.y);
  assertEquals(1, instanceScale.z);

  var instanceTargetScale = instance.targetScale;
  assertEquals(1, instanceTargetScale.x);
  assertEquals(1, instanceTargetScale.y);
  assertEquals(1, instanceTargetScale.z);

  instance.on('scaleBegin', function() { scaleBegin = true; });
  instance.on('scaleEnd', function() { scaleEnd = true; });
  instance.on('scale', function() { scale = true; });

  instance.scaleTo([0.5, 0.4, 0.3], 0.0001);

  instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(1, instanceScale.y);
  assertEquals(1, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(0.5, instanceTargetScale.x);
  assertEquals(0.4, instanceTargetScale.y);
  assertEquals(0.3, instanceTargetScale.z);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!scaleEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Scale Begin', scaleBegin);
  assert('Scale End', scaleEnd);
  assert('Scale', scale);

  instanceScale = instance.scale;
  assertEquals(0.5, instanceScale.x);
  assertEquals(0.4, instanceScale.y);
  assertEquals(0.3, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(0.5, instanceTargetScale.x);
  assertEquals(0.4, instanceTargetScale.y);
  assertEquals(0.3, instanceTargetScale.z);
};


/**
 * Tests that scales may be paused.
 */
ScalableTests.prototype.testPauseScale = function() {
  var Scalable = voodoo.Scalable.extend(DummyModel);
  var instance = new Scalable();

  instance.scale = [1, 2, 3];
  instance.scaleTo([4, 5, 6], 0.1);

  var instanceScale = instance.scale;
  assertEquals(1, instanceScale.x);
  assertEquals(2, instanceScale.y);
  assertEquals(3, instanceScale.z);

  var instanceTargetScale = instance.targetScale;
  assertEquals(4, instanceTargetScale.x);
  assertEquals(5, instanceTargetScale.y);
  assertEquals(6, instanceTargetScale.z);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 50)
    voodooEngine.frame();

  assertTrue('Scaling:', instance.scaling);
  instance.setScaling(false);

  var pausedScale = instance.scale;
  assertNotEquals(1, pausedScale.x);
  assertNotEquals(2, pausedScale.y);
  assertNotEquals(3, pausedScale.z);
  assertNotEquals(4, pausedScale.x);
  assertNotEquals(5, pausedScale.y);
  assertNotEquals(6, pausedScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(4, instanceTargetScale.x);
  assertEquals(5, instanceTargetScale.y);
  assertEquals(6, instanceTargetScale.z);

  // Kill time which shouldn't do anything
  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 25)
    voodooEngine.frame();

  instanceScale = instance.scale;
  assertEquals(pausedScale.x, instanceScale.x);
  assertEquals(pausedScale.y, instanceScale.y);
  assertEquals(pausedScale.z, instanceScale.z);

  // Resume
  instance.scaling = true;

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (instance.scaling && new Date() - start < 100)
    voodooEngine.frame();

  instanceScale = instance.scale;
  assertEquals(4, instanceScale.x);
  assertEquals(5, instanceScale.y);
  assertEquals(6, instanceScale.z);

  instanceTargetScale = instance.targetScale;
  assertEquals(4, instanceTargetScale.x);
  assertEquals(5, instanceTargetScale.y);
  assertEquals(6, instanceTargetScale.z);

  assertFalse('Scaling:', instance.scaling);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
ScalableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Scalable = voodoo.Scalable.extend(DummyModel);
  var instance = new Scalable({
    scale: [0, 0, 0]
  });

  assertException(function() {
    new Scalable({
      scale: [0, 1]
    });
  });

  assertException(function() {
    instance.scaleTo({}, 2);
  });

  assertException(function() {
    instance.scaleTo([0, 1, 2], false);
  });

  assertException(function() {
    instance.setScale([0, 1, 2, 3]);
  });

  assertException(function() {
    instance.setScaling();
  });

  assertException(function() {
    instance.scale = {x: '1', y: '2', z: '3'};
  });

  assertException(function() {
    instance.scaling = 'true';
  });
};
