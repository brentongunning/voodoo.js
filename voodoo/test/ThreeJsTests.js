// ----------------------------------------------------------------------------
// File: ThreeJsTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests the ThreeJs interface
 *
 * @constructor
 */
ThreeJsTests = TestCase('ThreeJsTests');


/**
 * Placeholder for ThreeJs test case setup.
 */
ThreeJsTests.prototype.setUp = function() {
  voodoo.engine = new voodoo.Engine({ fovY: 45 });
};


/**
 * Shuts down the engine between test cases.
 */
ThreeJsTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests the ThreeJs camera interface generally works.
 */
ThreeJsTests.prototype.testCamera = function() {
  new voodoo.Model.extend({
    name: 'TestModel',
    viewType: voodoo.View.extend({
      load: function() {
        assertEquals('FovY unexpected', 45, this.camera.fovY);
        assertNotEquals('X position unexpected', 0, this.camera.position.x);

        // Y and Z are zero because there is no height to the canvases
        assertEquals('Y position unexpected', 0, this.camera.position.y);
        assertEquals('Z position unexpected', 0, this.camera.position.z);

        assertNotNull('ZNear unexpected', this.camera.zNear);
        assertNotNull('ZFar unexpected', this.camera.zFar);
      }
    })
  });
};
