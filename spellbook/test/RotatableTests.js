// ------------------------------------------------------------------------------------------------
// File: RotatableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Test cases to make sure the Rotatable class works as expected.
 *
 * @constructor
 */
var RotatableTests = AsyncTestCase('RotatableTests');


/**
 * Shutdown the engine between test cases.
 */
RotatableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Rotatable class can be extended from other types.
 */
RotatableTests.prototype.testRotatableExtend = function() {
  var RotatableBase = SimpleModel.extend(voodoo.Rotatable);
  var BaseRotatable = voodoo.Rotatable.extend(SimpleModel);

  var instance1 = new RotatableBase({rotation: {
    x: 1,
    y: 2,
    z: 3
  }});

  var instance2 = new BaseRotatable({rotation: [1, 1, 0]});
};


/**
 * Tests that the rotation can be set in multiple ways.
 */
RotatableTests.prototype.testRotatableSetRotation = function() {
  var Rotatable = voodoo.Rotatable.extend(DummyModel);
  var instance = new Rotatable({rotation: [2, 0, 0]});

  var epsilon = 0.0001;

  var r = instance.rotation;
  assert(r.x > (2 - epsilon) && r.x < (2 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  var tr = instance.targetRotation;
  assert(tr.x > (2 - epsilon) && tr.x < (2 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  instance.rotation.x = 1;

  r = instance.rotation;
  assert(r.x > (1 - epsilon) && r.x < (1 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (1 - epsilon) && tr.x < (1 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  instance.rotation = [0.25, 0, 0.75];

  r = instance.rotation;
  assert(r.x > (0.25 - epsilon) && r.x < (0.25 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0.75 - epsilon) && r.z < (0.75 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0.25 - epsilon) && tr.x < (0.25 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0.75 - epsilon) && tr.z < (0.75 + epsilon));

  instance.rotation = {x: 0, y: 0.2, z: 0.3};

  r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0.2 - epsilon) && r.y < (0.2 + epsilon));
  assert(r.z > (0.3 - epsilon) && r.z < (0.3 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0 - epsilon) && tr.x < (0 + epsilon));
  assert(tr.y > (0.2 - epsilon) && tr.y < (0.2 + epsilon));
  assert(tr.z > (0.3 - epsilon) && tr.z < (0.3 + epsilon));

  instance.setRotation([0, 0.1, 0]);

  r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0.1 - epsilon) && r.y < (0.1 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0 - epsilon) && tr.x < (0 + epsilon));
  assert(tr.y > (0.1 - epsilon) && tr.y < (0.1 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  instance.rotateTo([0, 0, 3], 0);

  r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (3 - epsilon) && r.z < (3 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0 - epsilon) && tr.x < (0 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (3 - epsilon) && tr.z < (3 + epsilon));

  instance.setRotation([0, 0.1, 0, 0]);

  // No angle, so the rotations should be 0.

  r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0 - epsilon) && tr.x < (0 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  instance.setRotation({x: 2, y: 3, z: 4, angle: 0});

  r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0 - epsilon) && tr.x < (0 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));
};


/**
 * Tests that the rotateContinuous() changes the mesh continuously.
 *
 * @param {Object} queue Async queue.
 */
RotatableTests.prototype.testRotatableRotateContinuous = function(queue) {
  var Rotatable = voodoo.Rotatable.extend(DummyModel);
  var instance = new Rotatable({
    rotation: [0, 0, 0]
  });

  queue.call(function(callbacks) {
    assertFalse(instance.continuousRotation);

    // Focus on the window to start the delta timer.
    window.focus();
    setTimeout(callbacks.add(function() {
      instance.rotateContinuous([0.5, 0.4, 0.3]);
    }), 1100);
  });

  queue.call(function(callbacks) {
    assertTrue(instance.continuousRotation);

    var start = new Date();
    var voodooEngine = voodoo.engine;
    while (new Date() - start < 1000)
      voodooEngine.frame();

    var instanceRotation = instance.rotation;

    assertNotEquals(0, instanceRotation.x);
    assertNotEquals(0, instanceRotation.y);
    assertNotEquals(0, instanceRotation.z);

    assertNotEquals(0.5, instanceRotation.x);
    assertNotEquals(0.4, instanceRotation.y);
    assertNotEquals(0.3, instanceRotation.z);
  });
};


/**
 * Tests that the rotateBegin and rotateEnd events work.
 */
RotatableTests.prototype.testRotatableEvents = function() {
  var epsilon = 0.0001;

  var Rotatable = voodoo.Rotatable.extend(DummyModel);
  var instance = new Rotatable();

  var rotateBegin = false;
  var rotateEnd = false;
  var rotate = false;

  instance.on('rotateBegin', function() { rotateBegin = true; });
  instance.on('rotateEnd', function() { rotateEnd = true; });
  instance.on('rotate', function() { rotate = true; });

  instance.rotateTo([0.5, 0, 0], 0.0001);

  var r = instance.rotation;
  assertFalse(r.x > (0.5 - epsilon) && r.x < (0.5 + epsilon));

  var tr = instance.targetRotation;
  assert(tr.x > (0.5 - epsilon) && tr.x < (0.5 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!rotateEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Rotate Begin', rotateBegin);
  assert('Rotate End', rotateEnd);
  assert('Rotate', rotate);

  r = instance.rotation;
  assert(r.x > (0.5 - epsilon) && r.x < (0.5 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (0.5 - epsilon) && tr.x < (0.5 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  rotateEnd = false;
  instance.rotate([0.5, 0.4, 0.3], 0.0001);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!rotateEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Rotate End', rotateEnd);
};


/**
 * Tests that rotations may be paused.
 */
RotatableTests.prototype.testPauseRotation = function() {
  var epsilon = 0.0001;

  var Rotatable = voodoo.Rotatable.extend(DummyModel);
  var instance = new Rotatable();

  instance.rotation = [0, 0, 0];
  instance.rotateTo([1, 0, 0], 0.1);

  var r = instance.rotation;
  assert(r.x > (0 - epsilon) && r.x < (0 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  var tr = instance.targetRotation;
  assert(tr.x > (1 - epsilon) && tr.x < (1 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 50)
    voodooEngine.frame();

  assertTrue('Rotating:', instance.rotating);
  instance.setRotating(false);

  var r2 = instance.rotation;
  assertFalse(r2.x > (0 - epsilon) && r2.x < (0 + epsilon));
  assertFalse(r2.x > (1 - epsilon) && r2.x < (1 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (1 - epsilon) && tr.x < (1 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  // Kill time which shouldn't do anything
  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 25)
    voodooEngine.frame();

  r = instance.rotation;
  assert(r.x > (r2.x - epsilon) && r.x < (r2.x + epsilon));
  assert(r.y > (r2.y - epsilon) && r.y < (r2.y + epsilon));
  assert(r.z > (r2.z - epsilon) && r.z < (r2.z + epsilon));

  // Resume
  instance.rotating = true;

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (instance.rotating && new Date() - start < 100)
    voodooEngine.frame();

  r = instance.rotation;
  assert(r.x > (1 - epsilon) && r.x < (1 + epsilon));
  assert(r.y > (0 - epsilon) && r.y < (0 + epsilon));
  assert(r.z > (0 - epsilon) && r.z < (0 + epsilon));

  tr = instance.targetRotation;
  assert(tr.x > (1 - epsilon) && tr.x < (1 + epsilon));
  assert(tr.y > (0 - epsilon) && tr.y < (0 + epsilon));
  assert(tr.z > (0 - epsilon) && tr.z < (0 + epsilon));

  assertFalse('Rotating:', instance.rotating);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
RotatableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Rotatable = voodoo.Rotatable.extend(DummyModel);
  var instance = new Rotatable({
    rotation: [0, 0, 0]
  });

  assertException(function() {
    new Rotatable({
      rotation: 'abcde'
    });
  });

  assertException(function() {
    instance.rotateTo({});
  });

  assertException(function() {
    instance.rotate(['myRotation']);
  });

  assertException(function() {
    instance.rotateContinuous([0, 1, 2, 3, 5]);
  });

  assertException(function() {
    instance.setRotating(1);
  });

  assertException(function() {
    instance.setRotation(2);
  });

  assertException(function() {
    instance.rotating = 'true';
  });

  assertException(function() {
    instance.rotation = {x: '0', y: '1', z: '2', w: '3'};
  });
};
