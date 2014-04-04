// ----------------------------------------------------------------------------
// File: ColorerTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Colorer class works as expected.
 *
 * @constructor
 */
ColorerTests = TestCase('ColorerTests');


/**
 * Shutdown the engine between test cases.
 */
ColorerTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Colorer class can be extended from other types.
 */
ColorerTests.prototype.testColorerExtend = function() {
  var ColorerBase = SimpleModel.extend(voodoo.Colorer);
  var BaseColorer = voodoo.Colorer.extend(SimpleModel);

  var instance1 = new ColorerBase();
  var instance2 = new BaseColorer();

  instance1.color = 'white';
  instance2.setColor('rgb(10, 20, 30)');
};


/**
 * Tests that the changeColor events work.
 */
ColorerTests.prototype.testColorerEvents = function() {
  var Colorer = voodoo.Colorer.extend(DummyModel);
  var instance = new Colorer();

  var changeColor = 0;
  instance.on('changeColor', function() { changeColor++; });

  instance.color = 'black';
  instance.setColor('rgb(100, 200, 250)');

  assertEquals(2, changeColor);
};
