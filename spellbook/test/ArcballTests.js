// ----------------------------------------------------------------------------
// File: ArcballTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Arcball class works as expected.
 *
 * @constructor
 */
ArcballTests = TestCase('ArcballTests');


/**
 * Test case initialization. Runs once before each test.
 */
ArcballTests.prototype.setUp = function() {
  voodoo.engine = new voodoo.Engine({ frameLoop: false, stencils: true });

  enableMouseEvents();
};


/**
 * Shutdown the engine between test cases.
 */
ArcballTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Arcball class rotates meshes correctly.
 */
ArcballTests.prototype.testArcball = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var Model = voodoo.Arcball.extend(AttachedModel);
  var model = new Model();

  model.arcballCenter = [20, 30, 40];
  model.arcballRadius = 100;

  var modelRotation = model.rotation;
  var startRotationX = modelRotation.x;
  var startRotationY = modelRotation.y;
  var startRotationZ = modelRotation.z;

  fireMouseEvent('mousedown', 600, 550);
  fireMouseEvent('mousemove', 700, 750);
  fireMouseEvent('mouseup', 700, 750);

  assertNotEquals(modelRotation.x, startRotationX);
  assertNotEquals(modelRotation.y, startRotationY);
  assertNotEquals(modelRotation.z, startRotationZ);

  assertEquals(20, model.arcballCenter.x);
  assertEquals(30, model.arcballCenter.y);
  assertEquals(40, model.arcballCenter.z);
  assertEquals(100, model.arcballRadius);
};


/**
 * Tests that the changeArcballRadius and changeArcballCenter events work.
 */
ArcballTests.prototype.testArcballEvents = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var Model = voodoo.Arcball.extend(AttachedModel);
  var instance = new Model();

  var changeArcballCenter = 0;
  var changeArcballRadius = 0;

  instance.on('changeArcballCenter', function() { changeArcballCenter++; });
  instance.on('changeArcballRadius', function() { changeArcballRadius++; });

  instance.arcballCenter = [0, 1, 2];
  instance.setArcballCenter(null);

  instance.arcballRadius = 2;
  instance.setArcballRadius(0);

  assertEquals(2, changeArcballCenter);
  assertEquals(2, changeArcballRadius);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
ArcballTests.prototype.testInvalidProperties = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  if (!DEBUG)
    return;

  var Model = voodoo.Arcball.extend(AttachedModel);
  var model = new Model();

  assertException(function() {
    new voodoo.Arcball({
      arcballCenter: {}
    });
  });

  assertException(function() {
    new voodoo.Arcball({
      arcballRadius: 'badRadius'
    });
  });

  // Arcball centers must be options with x, y, z properties, or an
  // array with 3 components, or null.

  assertException(function() {
    model.arcballCenter = 10;
  });

  assertException(function() {
    model.setArcballCenter(10);
  });

  assertException(function() {
    model.setArcballCenter([1, 2]);
  });

  assertException(function() {
    model.setArcballCenter({
      x: 10,
      z: 40
    });
  });

  // Negative radii are not allowed.

  assertException(function() {
    model.arcballRadius = -10;
  });

  assertException(function() {
    model.setArcballRadius(-10);
  });

  // Radii must be numbers.

  assertException(function() {
    model.arcballRadius = [20, 30, 40];
  });

};
