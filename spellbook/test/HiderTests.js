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
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Hider class can be extended from other types.
 */
HiderTests.prototype.testHiderExtend = function() {
  var HiderBase = SimpleModel.extend(voodoo.Hider);
  var BaseHider = voodoo.Hider.extend(SimpleModel);

  var instance1 = new HiderBase();
  var instance2 = new BaseHider();

  instance1.show();
  instance2.hide();
};


/**
 * Tests that the show and hide events work.
 */
HiderTests.prototype.testHiderEvents = function() {
  var Hider = voodoo.Hider.extend(DummyModel);
  var instance = new Hider();

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
