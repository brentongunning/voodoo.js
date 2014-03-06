// ----------------------------------------------------------------------------
// File: RotatorTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Rotator class works as expected.
 *
 * @constructor
 */
RotatorTests = AsyncTestCase('RotatorTests');


/**
 * Shutdown the engine between test cases.
 */
RotatorTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Rotator class can be extended from other types.
 */
RotatorTests.prototype.testRotatorExtend = function() {
  var Base = voodoo.Model.extend({
    name: 'Base',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
      }
    })
  });

  var RotatorBase = Base.extend(voodoo.Rotator);
  var BaseRotator = voodoo.Rotator.extend(Base);

  var instance1 = new RotatorBase({rotation: {
    x: 1,
    y: 2,
    z: 3
  }});
  var instance2 = new BaseRotator({rotation: [1, 1, 0]});
};


/**
 * Tests that the rotation can be set in multiple ways.
 */
RotatorTests.prototype.testRotatorSetRotation = function() {
  var instance = new voodoo.Rotator({rotation: [2, 3, 4]});

  assertEquals(2, instance.rotation.x);
  assertEquals(3, instance.rotation.y);
  assertEquals(4, instance.rotation.z);

  instance.rotation.x = 1;

  assertEquals(1, instance.rotation.x);
  assertEquals(3, instance.rotation.y);
  assertEquals(4, instance.rotation.z);

  instance.rotation = [0.25, 0.5, 0.75];

  assertEquals(0.25, instance.rotation.x);
  assertEquals(0.5, instance.rotation.y);
  assertEquals(0.75, instance.rotation.z);

  instance.rotation = {x: 0.1, y: 0.2, z: 0.3};

  assertEquals(0.1, instance.rotation.x);
  assertEquals(0.2, instance.rotation.y);
  assertEquals(0.3, instance.rotation.z);

  instance.setRotation([1, 2, 3]);

  assertEquals(1, instance.rotation.x);
  assertEquals(2, instance.rotation.y);
  assertEquals(3, instance.rotation.z);

  instance.setRotation(2, 3, 4);

  assertEquals(2, instance.rotation.x);
  assertEquals(3, instance.rotation.y);
  assertEquals(4, instance.rotation.z);

  instance.rotateTo(0.1, 0.2, 0.3, 0);

  assertEquals(0.1, instance.rotation.x);
  assertEquals(0.2, instance.rotation.y);
  assertEquals(0.3, instance.rotation.z);
};


/**
 * Tests that the rotate() changes the mesh continuously.
 *
 * @param {Object} queue Async queue.
 */
RotatorTests.prototype.testRotatorRotate = function(queue) {
  var instance = new voodoo.Rotator({
    rotation: [0, 0, 0]
  });

  queue.call(function(callbacks) {
    // Focus on the window to start the delta timer.
    window.focus();
    setTimeout(callbacks.add(function() {
      instance.rotate(0.5, 0.4, 0.3, true);
    }), 1100);
  });

  queue.call(function(callbacks) {
    var start = new Date();
    while (new Date() - start < 1000)
      voodoo.engine.frame();

    assertNotEquals(0, instance.rotation.x);
    assertNotEquals(0, instance.rotation.y);
    assertNotEquals(0, instance.rotation.z);

    assertNotEquals(0.5, instance.rotation.x);
    assertNotEquals(0.4, instance.rotation.y);
    assertNotEquals(0.3, instance.rotation.z);
  });
};


/**
 * Tests that the rotateBegin and rotateEnd events work.
 */
RotatorTests.prototype.testRotatorEvents = function() {
  var instance = new voodoo.Rotator();

  var rotateBegin = false;
  var rotateEnd = false;
  instance.on('rotateBegin', function() { rotateBegin = true; });
  instance.on('rotateEnd', function() { rotateEnd = true; });

  instance.rotateTo(0.5, 0.4, 0.3, 0.0001);

  var start = new Date;
  while (!rotateEnd && new Date() - start < 1000)
    voodoo.engine.frame();

  assert('Rotate Begin', rotateBegin);
  assert('Rotate End', rotateEnd);

  assertEquals(0.5, instance.rotation.x);
  assertEquals(0.4, instance.rotation.y);
  assertEquals(0.3, instance.rotation.z);
};
