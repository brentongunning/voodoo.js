// ----------------------------------------------------------------------------
// File: PositionerTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Positioner class works as expected.
 *
 * @constructor
 */
PositionerTests = TestCase('PositionerTests');


/**
 * Shutdown the engine between test cases.
 */
PositionerTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Positioner class can be extended from other types.
 */
PositionerTests.prototype.testPositionerExtend = function() {
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

  var PositionerBase = Base.extend(voodoo.Positioner);
  var BasePositioner = voodoo.Positioner.extend(Base);

  var instance1 = new PositionerBase({position: {
    x: 1,
    y: 2,
    z: 3
  }});
  var instance2 = new BasePositioner({position: [1, 1, 0]});
};


/**
 * Tests that the position can be set in multiple ways.
 */
PositionerTests.prototype.testPositionerSetPosition = function() {
  var instance = new voodoo.Positioner({position: [2, 3, 4]});

  assertEquals(2, instance.position.x);
  assertEquals(3, instance.position.y);
  assertEquals(4, instance.position.z);

  instance.position.x = 1;

  assertEquals(1, instance.position.x);
  assertEquals(3, instance.position.y);
  assertEquals(4, instance.position.z);

  instance.position = [0.25, 0.5, 0.75];

  assertEquals(0.25, instance.position.x);
  assertEquals(0.5, instance.position.y);
  assertEquals(0.75, instance.position.z);

  instance.position = {x: 0.1, y: 0.2, z: 0.3};

  assertEquals(0.1, instance.position.x);
  assertEquals(0.2, instance.position.y);
  assertEquals(0.3, instance.position.z);

  instance.setPosition([1, 2, 3]);

  assertEquals(1, instance.position.x);
  assertEquals(2, instance.position.y);
  assertEquals(3, instance.position.z);

  instance.setPosition(2, 3, 4);

  assertEquals(2, instance.position.x);
  assertEquals(3, instance.position.y);
  assertEquals(4, instance.position.z);

  instance.moveTo(0.1, 0.2, 0.3, 0);

  assertEquals(0.1, instance.position.x);
  assertEquals(0.2, instance.position.y);
  assertEquals(0.3, instance.position.z);
};


/**
 * Tests that the moveBegin and moveEnd events work.
 */
PositionerTests.prototype.testPositionerMoveEvents = function() {
  var instance = new voodoo.Positioner();

  var moveBegin = false;
  var moveEnd = false;
  instance.on('moveBegin', function() { moveBegin = true; });
  instance.on('moveEnd', function() { moveEnd = true; });

  instance.moveTo(0.5, 0.4, 0.3, 0.0001);

  var start = new Date;
  while (!moveEnd && new Date() - start < 1000)
    voodoo.engine.frame();

  assert('Move Begin', moveBegin);
  assert('Move End', moveEnd);

  assertEquals(0.5, instance.position.x);
  assertEquals(0.4, instance.position.y);
  assertEquals(0.3, instance.position.z);
};


/**
 * Tests that the attach and detach events work.
 */
PositionerTests.prototype.testPositionerAttachEvents = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var instance = new voodoo.Positioner({
    element: document.getElementById('anchor'),
    center: false,
    pixelScale: true
  });

  var detach = false;
  var attach = false;
  instance.on('detach', function() { detach = true; });
  instance.on('attach', function() { attach = true; });

  instance.detach();
  instance.attach(document.getElementById('anchor'));

  assert('Detach', detach);
  assert('Attach', attach);
};
