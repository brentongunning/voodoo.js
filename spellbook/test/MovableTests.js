// ----------------------------------------------------------------------------
// File: MovableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Movable class works as expected.
 *
 * @constructor
 */
var MovableTests = TestCase('MovableTests');


/**
 * Shutdown the engine between test cases.
 */
MovableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Movable class can be extended from other types.
 */
MovableTests.prototype.testMovableExtend = function() {
  var MovableBase = SimpleModel.extend(voodoo.Movable);
  var BaseMovable = voodoo.Movable.extend(SimpleModel);

  var instance1 = new MovableBase({position: {
    x: 1,
    y: 2,
    z: 3
  }});

  var instance2 = new BaseMovable({position: [1, 1, 0]});
};


/**
 * Tests that the position can be set in multiple ways.
 */
MovableTests.prototype.testMovableSetPosition = function() {
  var Movable = voodoo.Movable.extend(DummyModel);
  var instance = new Movable({position: [2, 3, 4]});

  var instancePosition = instance.position;
  assertEquals(2, instancePosition.x);
  assertEquals(3, instancePosition.y);
  assertEquals(4, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(2, instanceTargetPosition.x);
  assertEquals(3, instanceTargetPosition.y);
  assertEquals(4, instanceTargetPosition.z);

  instance.position.x = 1;

  instancePosition = instance.position;
  assertEquals(1, instancePosition.x);
  assertEquals(3, instancePosition.y);
  assertEquals(4, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(1, instanceTargetPosition.x);
  assertEquals(3, instanceTargetPosition.y);
  assertEquals(4, instanceTargetPosition.z);

  instance.position = [0.25, 0.5, 0.75];

  instancePosition = instance.position;
  assertEquals(0.25, instancePosition.x);
  assertEquals(0.5, instancePosition.y);
  assertEquals(0.75, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(0.25, instanceTargetPosition.x);
  assertEquals(0.5, instanceTargetPosition.y);
  assertEquals(0.75, instanceTargetPosition.z);

  instance.position = {x: 0.1, y: 0.2, z: 0.3};

  instancePosition = instance.position;
  assertEquals(0.1, instancePosition.x);
  assertEquals(0.2, instancePosition.y);
  assertEquals(0.3, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(0.1, instanceTargetPosition.x);
  assertEquals(0.2, instanceTargetPosition.y);
  assertEquals(0.3, instanceTargetPosition.z);

  instance.setPosition([1, 2, 3]);

  instancePosition = instance.position;
  assertEquals(1, instancePosition.x);
  assertEquals(2, instancePosition.y);
  assertEquals(3, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(1, instanceTargetPosition.x);
  assertEquals(2, instanceTargetPosition.y);
  assertEquals(3, instanceTargetPosition.z);

  instance.moveTo([0.1, 0.2, 0.3], 0, voodoo.easing.easeOutBounce);

  instancePosition = instance.position;
  assertEquals(0.1, instancePosition.x);
  assertEquals(0.2, instancePosition.y);
  assertEquals(0.3, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(0.1, instanceTargetPosition.x);
  assertEquals(0.2, instanceTargetPosition.y);
  assertEquals(0.3, instanceTargetPosition.z);
};


/**
 * Tests that the moveBegin and moveEnd events work.
 */
MovableTests.prototype.testMovableMoveEvents = function() {
  var Movable = voodoo.Movable.extend(DummyModel);
  var instance = new Movable();

  var moveBegin = false;
  var moveEnd = false;
  var move = false;

  instance.on('moveBegin', function() { moveBegin = true; });
  instance.on('moveEnd', function() { moveEnd = true; });
  instance.on('move', function() { move = true; });

  instance.moveTo([0.5, 0.4, 0.3], 0.0001);

  var instancePosition = instance.position;
  assertNotEquals(0.5, instancePosition.x);
  assertNotEquals(0.4, instancePosition.y);
  assertNotEquals(0.3, instancePosition.z);

  var instanceTargetPosition = instance.targetPosition;
  assertEquals(0.5, instanceTargetPosition.x);
  assertEquals(0.4, instanceTargetPosition.y);
  assertEquals(0.3, instanceTargetPosition.z);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!moveEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Move Begin', moveBegin);
  assert('Move End', moveEnd);
  assert('Move', moveEnd);

  instancePosition = instance.position;
  assertEquals(0.5, instancePosition.x);
  assertEquals(0.4, instancePosition.y);
  assertEquals(0.3, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(0.5, instanceTargetPosition.x);
  assertEquals(0.4, instanceTargetPosition.y);
  assertEquals(0.3, instanceTargetPosition.z);
};


/**
 * Tests that moves may be paused.
 */
MovableTests.prototype.testPauseMove = function() {
  var Movable = voodoo.Movable.extend(DummyModel);
  var instance = new Movable();

  instance.position = [0, 0, 0];
  instance.moveTo([600, 700, 800], 0.1);

  var instancePosition = instance.position;
  assertEquals(0, instancePosition.x);
  assertEquals(0, instancePosition.y);
  assertEquals(0, instancePosition.z);

  var instanceTargetPosition = instance.targetPosition;
  assertEquals(600, instanceTargetPosition.x);
  assertEquals(700, instanceTargetPosition.y);
  assertEquals(800, instanceTargetPosition.z);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 50)
    voodooEngine.frame();

  assertTrue('Moving:', instance.moving);
  instance.setMoving(false);

  var pausedPosition = instance.position;
  assertNotEquals(0, pausedPosition.x);
  assertNotEquals(0, pausedPosition.y);
  assertNotEquals(0, pausedPosition.z);
  assertNotEquals(600, pausedPosition.x);
  assertNotEquals(700, pausedPosition.y);
  assertNotEquals(800, pausedPosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(600, instanceTargetPosition.x);
  assertEquals(700, instanceTargetPosition.y);
  assertEquals(800, instanceTargetPosition.z);

  // Kill time which shouldn't do anything
  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 25)
    voodooEngine.frame();

  instancePosition = instance.position;
  assertEquals(pausedPosition.x, instancePosition.x);
  assertEquals(pausedPosition.y, instancePosition.y);
  assertEquals(pausedPosition.z, instancePosition.z);

  // Resume
  instance.moving = true;

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (instance.moving && new Date() - start < 100)
    voodooEngine.frame();

  instancePosition = instance.position;
  assertEquals(600, instancePosition.x);
  assertEquals(700, instancePosition.y);
  assertEquals(800, instancePosition.z);

  instanceTargetPosition = instance.targetPosition;
  assertEquals(600, instanceTargetPosition.x);
  assertEquals(700, instanceTargetPosition.y);
  assertEquals(800, instanceTargetPosition.z);

  assertFalse('Moving:', instance.moving);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
MovableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Movable = voodoo.Movable.extend(DummyModel);

  assertException(function() {
    new Movable({
      position: 'abcde'
    });
  });

  var instance = new Movable();

  assertException(function() {
    instance.moveTo([0], 1);
  });

  assertException(function() {
    instance.moveTo([0, 2, 3], []);
  });

  assertException(function() {
    instance.setMoving('true');
  });

  assertException(function() {
    instance.setPosition({});
  });

  assertException(function() {
    instance.moving = null;
  });

  assertException(function() {
    instance.position = { x: 1, z: 2 };
  });
};
