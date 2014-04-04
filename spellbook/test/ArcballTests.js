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
};
