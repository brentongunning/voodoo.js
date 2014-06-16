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
var ThreeJsTests = TestCase('ThreeJsTests');


/**
 * Placeholder for ThreeJs test case setup.
 */
ThreeJsTests.prototype.setUp = function() {
  voodoo.engine = new voodoo.Engine();
};


/**
 * Shuts down the engine between test cases.
 */
ThreeJsTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests the ThreeJs camera interface generally works.
 */
ThreeJsTests.prototype.testCamera = function() {
  var Model = voodoo.Model.extend({
    name: 'TestModel',
    viewType: voodoo.View.extend({
      load: function() {
        assertNotEquals('X position unexpected', 0, this.camera.position.x);

        assertNotNull('ZNear unexpected', this.camera.zNear);
        assertNotNull('ZFar unexpected', this.camera.zFar);
      }
    })
  });
  new Model();
};
