// ----------------------------------------------------------------------------
// File: ScalerTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Scaler class works as expected.
 *
 * @constructor
 */
ScalerTests = TestCase('ScalerTests');


/**
 * Shutdown the engine between test cases.
 */
ScalerTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Scale class can be extended from other types.
 */
ScalerTests.prototype.testScalerExtend = function() {
  var Base = voodoo.Model.extend({
    name: 'Base',
    viewType: voodoo.View.extend({
      load: function() {
        this.base.load();
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
      }
    })
  });

  var ScalerBase = Base.extend(voodoo.Scaler);
  var BaseScaler = voodoo.Scaler.extend(Base);

  var instance1 = new ScalerBase({scale: 2});
  var instance2 = new BaseScaler({scale: [1, 1, 0]});
};


/**
 * Tests that the scale can be set in multiple ways.
 */
ScalerTests.prototype.testScalerSetScale = function() {
  var instance = new voodoo.Scaler({scale: 2});

  assertEquals(2, instance.scale.x);
  assertEquals(2, instance.scale.y);
  assertEquals(2, instance.scale.z);

  instance.scale.x = 1;

  assertEquals(1, instance.scale.x);
  assertEquals(2, instance.scale.y);
  assertEquals(2, instance.scale.z);

  instance.scale = [0.25, 0.5, 0.75];

  assertEquals(0.25, instance.scale.x);
  assertEquals(0.5, instance.scale.y);
  assertEquals(0.75, instance.scale.z);

  instance.scale = {x: 0.1, y: 0.2, z: 0.3};

  assertEquals(0.1, instance.scale.x);
  assertEquals(0.2, instance.scale.y);
  assertEquals(0.3, instance.scale.z);

  instance.scale = 5;

  assertEquals(5, instance.scale.x);
  assertEquals(5, instance.scale.y);
  assertEquals(5, instance.scale.z);

  instance.setScale([1, 2, 3]);

  assertEquals(1, instance.scale.x);
  assertEquals(2, instance.scale.y);
  assertEquals(3, instance.scale.z);

  instance.setScale(2, 3, 4);

  assertEquals(2, instance.scale.x);
  assertEquals(3, instance.scale.y);
  assertEquals(4, instance.scale.z);

  instance.scaleTo(0.1, 0);

  assertEquals(0.1, instance.scale.x);
  assertEquals(0.1, instance.scale.y);
  assertEquals(0.1, instance.scale.z);
};


/**
 * Tests that the scaleBegin and scaleEnd events work.
 */
ScalerTests.prototype.testScalerEvents = function() {
  var instance = new voodoo.Scaler();

  var scaleBegin = false;
  var scaleEnd = false;
  var scale = false;
  instance.on('scaleBegin', function() { scaleBegin = true; });
  instance.on('scaleEnd', function() { scaleEnd = true; });
  instance.on('scale', function() { scale = true; });

  instance.scaleTo(0.5, 0.4, 0.3, 0.0001);

  var start = new Date;
  while (!scaleEnd && new Date() - start < 1000)
    voodoo.engine.frame();

  assert('Scale Begin', scaleBegin);
  assert('Scale End', scaleEnd);
  assert('Scale', scale);

  assertEquals(0.5, instance.scale.x);
  assertEquals(0.4, instance.scale.y);
  assertEquals(0.3, instance.scale.z);
};
