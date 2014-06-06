// ----------------------------------------------------------------------------
// File: AttachableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Attachable class works as expected.
 *
 * @constructor
 */
var AttachableTests = TestCase('AttachableTests');


/**
 * Shutdown the engine between test cases.
 */
AttachableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Attachable class can be extended from other types.
 */
AttachableTests.prototype.testAttachableExtend = function() {
  var AttachableBase = SimpleModel.extend(voodoo.Attachable);
  var BaseAttachable = voodoo.Attachable.extend(SimpleModel);

  var instance1 = new AttachableBase();
  var instance2 = new BaseAttachable();
};


/**
 * Tests that the attach and detach events work.
 */
AttachableTests.prototype.testAttachableEvents = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var Attachable = voodoo.Attachable.extend(DummyModel);
  var instance = new Attachable({
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


/**
 * Tests that there are errors when providing invalid properties.
 */
AttachableTests.prototype.testInvalidProperties = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  if (!DEBUG)
    return;

  var Attachable = voodoo.Attachable.extend(DummyModel);

  assertException(function() {
    new Attachable({
      element: 'abcde'
    });
  });

  assertException(function() {
    new Attachable({
      element: {}
    });
  });

  assertException(function() {
    new Attachable({
      center: 2
    });
  });

  assertException(function() {
    new Attachable({
      pixelScale: 'false'
    });
  });

  var instance = new Attachable({
    element: document.getElementById('anchor'),
    center: false,
    pixelScale: true
  });

  assertException(function() {
    instance.attach(null);
  });
};
