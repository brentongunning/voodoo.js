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
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Positioner class can be extended from other types.
 */
PositionerTests.prototype.testPositionerExtend = function() {
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
  var Positioner = voodoo.Positioner.extend(DummyModel);
  var instance = new Positioner({position: [2, 3, 4]});

  var instancePosition = instance.position;
  assertEquals(2, instancePosition.x);
  assertEquals(3, instancePosition.y);
  assertEquals(4, instancePosition.z);

  instance.position.x = 1;

  instancePosition = instance.position;
  assertEquals(1, instancePosition.x);
  assertEquals(3, instancePosition.y);
  assertEquals(4, instancePosition.z);

  instance.position = [0.25, 0.5, 0.75];

  instancePosition = instance.position;
  assertEquals(0.25, instancePosition.x);
  assertEquals(0.5, instancePosition.y);
  assertEquals(0.75, instancePosition.z);

  instance.position = {x: 0.1, y: 0.2, z: 0.3};

  instancePosition = instance.position;
  assertEquals(0.1, instancePosition.x);
  assertEquals(0.2, instancePosition.y);
  assertEquals(0.3, instancePosition.z);

  instance.setPosition([1, 2, 3]);

  instancePosition = instance.position;
  assertEquals(1, instancePosition.x);
  assertEquals(2, instancePosition.y);
  assertEquals(3, instancePosition.z);

  instance.setPosition(2, 3, 4);

  instancePosition = instance.position;
  assertEquals(2, instancePosition.x);
  assertEquals(3, instancePosition.y);
  assertEquals(4, instancePosition.z);

  instance.moveTo(0.1, 0.2, 0.3, 0, voodoo.easing.easeOutBounce);

  instancePosition = instance.position;
  assertEquals(0.1, instancePosition.x);
  assertEquals(0.2, instancePosition.y);
  assertEquals(0.3, instancePosition.z);
};


/**
 * Tests that the moveBegin and moveEnd events work.
 */
PositionerTests.prototype.testPositionerMoveEvents = function() {
  var Positioner = voodoo.Positioner.extend(DummyModel);
  var instance = new Positioner();

  var moveBegin = false;
  var moveEnd = false;
  var move = false;

  instance.on('moveBegin', function() { moveBegin = true; });
  instance.on('moveEnd', function() { moveEnd = true; });
  instance.on('move', function() { move = true; });

  instance.moveTo(0.5, 0.4, 0.3, 0.0001);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!moveEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Move Begin', moveBegin);
  assert('Move End', moveEnd);
  assert('Move', moveEnd);

  var instancePosition = instance.position;
  assertEquals(0.5, instancePosition.x);
  assertEquals(0.4, instancePosition.y);
  assertEquals(0.3, instancePosition.z);
};


/**
 * Tests that the attach and detach events work.
 */
PositionerTests.prototype.testPositionerAttachEvents = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var Positioner = voodoo.Positioner.extend(DummyModel);
  var instance = new Positioner({
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
