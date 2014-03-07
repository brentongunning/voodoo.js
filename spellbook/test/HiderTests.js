// ----------------------------------------------------------------------------
// File: HiderTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Hider class works as expected.
 *
 * @constructor
 */
HiderTests = TestCase('HiderTests');


/**
 * Shutdown the engine between test cases.
 */
HiderTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Hider class can be extended from other types.
 */
HiderTests.prototype.testHiderExtend = function() {
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

  var HiderBase = Base.extend(voodoo.Hider);
  var BaseHider = voodoo.Hider.extend(Base);

  var instance1 = new HiderBase();
  var instance2 = new BaseHider();

  instance1.show();
  instance2.hide();
};


/**
 * Tests that the show and hide events work.
 */
HiderTests.prototype.testHiderEvents = function() {
  var instance = new voodoo.Hider();

  var show = 0;
  var hide = 0;

  instance.on('show', function() {
    show++;
  });

  instance.on('hide', function() {
    hide++;
  });

  instance.visible = false;
  instance.show();
  instance.hide();
  instance.visible = true;

  assertEquals(2, show);
  assertEquals(2, hide);
};
