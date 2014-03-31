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

  var Cube = voodoo.Arcball.extend({
    initialize: function(options) {
      this.base.initialize(options);
      this.element = options.element;
    },

    viewType: voodoo.View.extend({
      load: function() {
        this.base.load();

        var geometry = new THREE.CubeGeometry(200, 200, 200);
        var material = new THREE.MeshLambertMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.scene.attach(this.model.element);
        this.triggers.add(mesh);
      }
    })
  });

  cube = new Cube();

  var cubeRotation = cube.rotation;
  var startRotationX = cubeRotation.x;
  var startRotationY = cubeRotation.y;
  var startRotationZ = cubeRotation.z;

  fireMouseEvent('mousedown', 600, 550);
  fireMouseEvent('mousemove', 700, 750);
  fireMouseEvent('mouseup', 700, 750);

  assertNotEquals(cubeRotation.x, startRotationX);
  assertNotEquals(cubeRotation.y, startRotationY);
  assertNotEquals(cubeRotation.z, startRotationZ);
};
