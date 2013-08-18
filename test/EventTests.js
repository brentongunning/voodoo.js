// ----------------------------------------------------------------------------
// File: EventTests.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Dispatches a mouse event to the document.
 *
 * @param {string} type Type of mouse event (ie. mousemove).
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
function fireMouseEvent(type, x, y) {
  var moveEvent = document.createEvent('MouseEvents');
  moveEvent.initMouseEvent(type, true, true, window, 0, x, y,
      x, y, false, false, false, false, 0, null);
  document.dispatchEvent(moveEvent);

  voodoo.engine.frame();
}


/**
 * Dispatches mouse events to perform a click
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 */
function fireClick(x, y) {
  fireMouseEvent('mousemove', x, y);
  fireMouseEvent('mousedown', x, y);
  fireMouseEvent('mouseup', x, y);
}



/**
 * Tests for all the different event types.
 *
 * @constructor
 */
EventTests = TestCase('EventTests');


/**
 * Setup the page for mouse event testing. By default, the page is not sized
 * correctly to have any clickable regions. We resize it.
 */
EventTests.prototype.setUp = function() {
  voodoo.engine = new voodoo.Engine({ frameLoop: false });

  document.body.style.height = '1000px';

  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);
};


/**
 * Shuts down the engine between test cases.
 */
EventTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined')
    voodoo.engine.destroy();
};


/**
 * Tests that most mouse events work correctly.
 */
EventTests.prototype.testMouseEvents = function() {
  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1000, 1000, 100);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(500, 600, 0);

        this.scene.add(mesh);
        this.triggers.add(mesh);
      }
    })
  });

  var move = 0, down = 0, up = 0, click = 0, dblclick = 0;
  var dblClickEvent = null;
  var model = new CustomModel();

  model.on('mousemove', function(evt) {move++;});
  model.on('mousedown', function(evt) {down++;});
  model.on('mouseup', function(evt) {up++;});
  model.on('click', function(evt) {click++;});
  model.on('dblclick', function(evt) {
    dblclick++;
    dblClickEvent = evt;
  });

  fireClick(500, 600);

  assertEquals(1, move);
  assertEquals(1, down);
  assertEquals(1, up);
  assertEquals(1, click);
  assertEquals(0, dblclick);

  fireClick(500, 600);

  assertEquals(2, click);
  assertEquals(1, dblclick);

  assertEquals(500, dblClickEvent.client.x);
  assertEquals(600, dblClickEvent.client.y);
  assertNotEquals(0, dblClickEvent.hit.x);
  assertNotEquals(0, dblClickEvent.hit.y);
  assertNotEquals(0, dblClickEvent.hit.z);
  assertEquals('dblclick', dblClickEvent.type);
};


/**
 * Tests that stencils can block mouse events too.
 */
EventTests.prototype.testStencilClicks = function() {
  var CustomView = voodoo.View.extend();

  CustomView.prototype.load = function() {
    var geometry = new THREE.CubeGeometry(1000, 1000, 100);
    var material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(500, 600, -50.001);

    this.scene.add(this.mesh);
    this.triggers.add(this.mesh);
  };

  CustomView.prototype.unload = function() {
    this.scene.remove(this.mesh);
    this.triggers.remove(this.mesh);
  };

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: CustomView
  });

  var clicked = 0;
  var event = null;

  var model = new CustomModel();
  model.on('click', function(evt) {clicked++; event = evt;});

  // Click where the mesh should be first
  fireClick(900, 600);
  assertEquals(1, clicked);
  assertTrue(Math.abs(0 - event.hit.z) < 0.01);
  assertTrue(event.hit.z < 0);

  var CustomStencilView = voodoo.View.extend();

  CustomStencilView.prototype.load = function() {
    var geometry = new THREE.CubeGeometry(0, 0, 0.1);
    var material = new THREE.MeshBasicMaterial();
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0, 0);

    this.scene.add(mesh);
    this.triggers.add(mesh);
  };

  // Now set the stencil view and click again. It shouldn't be there.
  model.destroy();
  CustomModel.prototype.stencilViewType = CustomStencilView;
  model = new CustomModel();
  model.on('click', function(evt) {clicked++; event = evt;});

  fireClick(900, 600);
  assertEquals(1, clicked);
};


/**
 * Tests that multiple trigger ids are supported.
 */
EventTests.prototype.testMultipleTriggerIds = function() {
  var CustomView = voodoo.View.extend();

  CustomView.prototype.load = function() {
    var geometry = new THREE.CubeGeometry(1000, 1000, 100);
    var material = new THREE.MeshBasicMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    var mesh2 = new THREE.Mesh(geometry, material);

    mesh.position.set(500, 600, -50);
    mesh2.position.set(1500, 1600, -50);

    this.scene.add(mesh);
    this.scene.add(mesh2);
    this.triggers.add(mesh, 0);
    this.triggers.add(mesh2, 1);
  };

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: CustomView
  });

  var click = 0;
  var event = null;
  var model = new CustomModel();
  model.on('click', function(evt) {click++; event = evt;});

  fireClick(500, 600);

  assertEquals(1, click);
  assertEquals(0, event.triggerId);

  fireClick(1500, 1600);

  assertEquals(2, click);
  assertEquals(1, event.triggerId);
};


/**
 * Tests that camera move events work.
 */
EventTests.prototype.testCameraMove = function() {
  var numCameraMoveEvents = 0;

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend()
  });

  var model = new CustomModel();
  model.on('cameramove', function() {
    numCameraMoveEvents++;
  });

  assertEquals(0, numCameraMoveEvents);

  // Fire a window resize event which should try to move the camera
  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);

  voodoo.engine.frame();
  assertEquals(1, numCameraMoveEvents);

  // Fire a window scroll event which should try to move the camera
  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('scroll', true, false, window, 0);
  window.dispatchEvent(evt);

  voodoo.engine.frame();
  assertEquals(2, numCameraMoveEvents);
};
