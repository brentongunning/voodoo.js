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
var MeshTests = AsyncTestCase('MeshTests');


/**
 * Shutdown the engine between test cases.
 */
MeshTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
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
      format: voodoo.Mesh.Format.JSON,
      mesh: '/test/test/assets/monster.json',
      animated: false
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
  var instance = new voodoo.Mesh({
    format: voodoo.Mesh.Format.JSON,
    mesh: '/test/test/assets/monster.json',
    animated: true
  }).setAnimation('walk', 0, 23, 0.01, true).play('walk');

  assert('Playing', instance.playing);
  assertEquals('walk', instance.animation);

  instance.stop();
  assert('Stopped', !instance.playing);
  assertEquals('', instance.animation);
};


/**
 * Tests that the Mesh class can play a non-looping animation.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testMeshNonLoopAnimations = function(queue) {
  var instance;

  queue.call(function(callbacks) {
    instance = new voodoo.Mesh({
      format: voodoo.Mesh.Format.JSON,
      mesh: '/test/test/assets/monster.json',
      animated: true
    }).on('load', callbacks.add(function() {}));
  });

  queue.call(function(callbacks) {
    assert('Loaded', instance.loaded);

    // Focus on the window to start the delta timer.
    window.focus();
    setTimeout(callbacks.add(function() {}), 1100);
  });

  queue.call(function(callbacks) {
    instance.setAnimation('walk', 0, 23, 0.01, false).play('walk');
    assertEquals('walk', instance.animation);
    assert('Looping', !instance.looping);

    var start = new Date();
    var voodooEngine = voodoo.engine;
    while (instance.playing && new Date() - start < 1000)
      voodooEngine.frame();

    assert('Finished', !instance.playing);
    assertEquals('', instance.animation);
  });
};


/**
 * Tests that the Mesh class can play a non-looping animation.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testMeshEvents = function(queue) {
  var instance = new voodoo.Mesh({
    format: voodoo.Mesh.Format.JSON,
    mesh: '/test/test/assets/monster.json',
    animated: true
  });

  var play = false;
  var stop = false;
  instance.on('play', function() { play = true; });
  instance.on('stop', function() { stop = true; });

  instance.setAnimation('walk', 0, 23, 0.01, false).play('walk');
  instance.playing = false;

  assert('Play Event', play);
  assert('Stop Event', stop);
};


/**
 * Tests that there are errors when providing invalid properties.
 *
 * @param {Object} queue Async queue.
 */
MeshTests.prototype.testInvalidProperties = function(queue) {
  if (!DEBUG)
    return;

  var instance = new voodoo.Mesh({
    format: voodoo.Mesh.Format.JSON,
    mesh: '/test/test/assets/monster.json',
    animated: true
  });

  assertException(function() {
    new voodoo.Mesh({
      mesh: '/test/test/assets/monster.json',
      format: 'md5'
    });
  });

  assertException(function() {
    new voodoo.Mesh({
      mesh: 34567,
      format: 'json'
    });
  });

  assertException(function() {
    new voodoo.Mesh({
      mesh: '/test/test/assets/monster.json',
      animated: 'false'
    });
  });

  assertException(function() {
    instance.setAnimation(2);
  });

  assertException(function() {
    instance.setAnimation('walk', 'ten', '11');
  });

  assertException(function() {
    instance.setAnimation('walk', 0, 1, []);
  });

  assertException(function() {
    instance.play(1);
  });

  assertException(function() {
    instance.play('walk');
  });
};
