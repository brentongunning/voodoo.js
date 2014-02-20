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
