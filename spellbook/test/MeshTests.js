// ----------------------------------------------------------------------------
// File: MeshTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Mesh class works as expected.
 *
 * @constructor
 */
MeshTests = AsyncTestCase('MeshTests');


/**
 * Shutdown the engine between test cases.
 */
MeshTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Mesh class can be created on a div.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testMeshLoad = function(queue) {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var loaded = false;

  queue.call(function(callbacks) {
    new voodoo.Mesh({
      element: document.getElementById('anchor'),
      format: voodoo.Mesh.Format.JSON,
      mesh: '/test/test/assets/monster.json',
      animated: false,
      center: false,
      pixelScale: false
    }).on('load', callbacks.add(function() {
      loaded = true;
    }));
  });

  queue.call(function() {
    assert('Mesh loaded:', loaded);
  });
};


/**
 * Tests that the Mesh can play a looping animation.
 */
MeshTests.prototype.testMeshLoopAnimations = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var mesh = new voodoo.Mesh({
    element: document.getElementById('anchor'),
    format: voodoo.Mesh.Format.JSON,
    mesh: '/test/test/assets/monster.json',
    animated: true,
    center: false,
    pixelScale: false
  }).animation('walk', 0, 23, 0.01, true).play('walk');

  assert('Playing', mesh.playing);

  mesh.stop();
  assert('Stopped', !mesh.playing);
};


/**
 * Tests that the Mesh class can play a non-looping animation.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testMeshNonLoopAnimations = function(queue) {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var mesh;

  queue.call(function(callbacks) {
    mesh = new voodoo.Mesh({
      element: document.getElementById('anchor'),
      format: voodoo.Mesh.Format.JSON,
      mesh: '/test/test/assets/monster.json',
      animated: true,
      center: false,
      pixelScale: false
    }).on('load', callbacks.add(function() {}));
  });

  queue.call(function(callbacks) {
    assert('Loaded', mesh.loaded);

    // Focus on the window to start the delta timer.
    window.focus();
    setTimeout(callbacks.add(function() {}), 1100);
  });

  queue.call(function(callbacks) {
    mesh.animation('walk', 0, 23, 0.01, false).play('walk');
    assert('Looping', !mesh.looping);

    var start = new Date();
    while (mesh.playing && new Date() - start < 1000)
      voodoo.engine.frame();

    assert('Finished', !mesh.playing);
  });
};


/**
 * Tests that the Mesh class can play a non-looping animation.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testMeshEvents = function(queue) {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var mesh = new voodoo.Mesh({
    element: document.getElementById('anchor'),
    format: voodoo.Mesh.Format.JSON,
    mesh: '/test/test/assets/monster.json',
    animated: true,
    center: false,
    pixelScale: false
  });

  var play = false;
  var stop = false;
  mesh.on('play', function() { play = true; });
  mesh.on('stop', function() { stop = true; });

  mesh.animation('walk', 0, 23, 0.01, false).play('walk');
  mesh.playing = false;

  assert('Play Event', play);
  assert('Stop Event', stop);
};
