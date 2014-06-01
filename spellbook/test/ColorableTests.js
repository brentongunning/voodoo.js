// ----------------------------------------------------------------------------
// File: ColorableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Colorable class works as expected.
 *
 * @constructor
 */
ColorableTests = TestCase('ColorableTests');


/**
 * Shutdown the engine between test cases.
 */
ColorableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Colorable class can be extended from other types.
 */
ColorableTests.prototype.testColorableExtend = function() {
  var ColorableBase = SimpleModel.extend(voodoo.Colorable);
  var BaseColorable = voodoo.Colorable.extend(SimpleModel);

  var instance1 = new ColorableBase();
  var instance2 = new BaseColorable();

  instance1.color = 'white';
  instance2.setColor('rgb(10, 20, 30)');
};


/**
 * Tests that the changeColor events work.
 */
ColorableTests.prototype.testColorableEvents = function() {
  var Colorable = voodoo.Colorable.extend(DummyModel);
  var instance = new Colorable();

  var changeColor = 0;
  instance.on('changeColor', function() { changeColor++; });

  instance.color = 'black';
  instance.setColor('rgb(100, 200, 250)');

  assertEquals(2, changeColor);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
ColorableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Colorable = voodoo.Colorable.extend(DummyModel);
  var instance = new Colorable();

  assertException(function() {
    new Colorable({
      color: 'abcde'
    });
  });

  assertException(function() {
    instance.color = 'rgb';
  });

  assertException(function() {
    instance.setColor(2);
  });
};

