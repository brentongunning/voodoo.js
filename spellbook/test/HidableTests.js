// ----------------------------------------------------------------------------
// File: HidableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Hidable class works as expected.
 *
 * @constructor
 */
var HidableTests = TestCase('HidableTests');


/**
 * Shutdown the engine between test cases.
 */
HidableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Hidable class can be extended from other types.
 */
HidableTests.prototype.testHidableExtend = function() {
  var HidableBase = SimpleModel.extend(voodoo.Hidable);
  var BaseHidable = voodoo.Hidable.extend(SimpleModel);

  var instance1 = new HidableBase();
  var instance2 = new BaseHidable();

  instance1.show();
  instance2.hide();
};


/**
 * Tests that the show and hide events work.
 */
HidableTests.prototype.testHidableEvents = function() {
  var Hidable = voodoo.Hidable.extend(DummyModel);
  var instance = new Hidable();

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


/**
 * Tests that there are errors when providing invalid properties.
 */
HidableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Hidable = voodoo.Hidable.extend(DummyModel);
  var instance = new Hidable();

  assertException(function() {
    new voodoo.Hidable({
      visible: 'abcde'
    });
  });

  assertException(function() {
    new voodoo.Hidable({
      visible: 1
    });
  });

  assertException(function() {
    instance.visible = 'abcde';
  });

  assertException(function() {
    instance.visible = 0;
  });
};
