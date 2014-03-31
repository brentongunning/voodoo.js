// ----------------------------------------------------------------------------
// File: WireframeTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Wireframe class works as expected.
 *
 * @constructor
 */
WireframeTests = TestCase('WireframeTests');


/**
 * Shutdown the engine between test cases.
 */
WireframeTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Wireframe class can be extended from other types.
 */
WireframeTests.prototype.testWireframeExtend = function() {
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

  var WireframeBase = Base.extend(voodoo.Wireframe);
  var BaseWireframe = voodoo.Wireframe.extend(Base);

  var instance1 = new WireframeBase();
  var instance2 = new BaseWireframe();

  instance1.wireframe = false;
  instance2.setWireframe(false);
};


/**
 * Tests that the changeWireframe events work.
 */
WireframeTests.prototype.testWireframeEvents = function() {
  var instance = new voodoo.Wireframe();

  var changeWireframe = 0;
  instance.on('changeWireframe', function() { changeWireframe++; });

  instance.wireframe = false;
  instance.setWireframe(true);

  assertEquals(2, changeWireframe);
};
