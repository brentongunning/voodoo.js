// ------------------------------------------------------------------------------------------------
// File: FadableTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Test cases to make sure the Fadable class works as expected.
 *
 * @constructor
 */
var FadableTests = TestCase('FadableTests');


/**
 * Shutdown the engine between test cases.
 */
FadableTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Fadable class may be extended from other types.
 */
FadableTests.prototype.testFadableExtend = function() {
  var FadedBase = SimpleModel.extend(voodoo.Fadable);
  var BaseFaded = voodoo.Fadable.extend(SimpleModel);

  var instance1 = new FadedBase();
  var instance2 = new BaseFaded();

  instance1.fadeIn(1);
  instance2.fadeTo(0.5, 1);
};


/**
 * Tests that the fadeBegin and fadeEnd events work correctly.
 */
FadableTests.prototype.testFadableEvents = function() {
  var Fadable = voodoo.Fadable.extend(DummyModel);
  var instance = new Fadable();

  var fadeInBegin = false;
  var fadeInEnd = false;
  var fadeOutBegin = false;
  var fadeOutEnd = false;
  var changeAlpha = false;

  instance.on('fadeBegin', function() {
    var instanceAlpha = instance.alpha;
    if (instanceAlpha === 0)
      fadeInBegin = true;
    else if (instanceAlpha === 1)
      fadeOutBegin = true;
  });

  instance.on('fadeEnd', function() {
    var instanceAlpha = instance.alpha;
    if (instanceAlpha === 0) {
      fadeOutEnd = true;
    } else if (instanceAlpha === 1) {
      fadeInEnd = true;
      this.fadeOut(0.0001);
    }
  });

  instance.on('changeAlpha', function() {
    changeAlpha = true;
  });

  instance.fadeIn(0.0001);

  assertEquals(1.0, instance.targetAlpha);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (!fadeOutEnd && new Date() - start < 1000)
    voodooEngine.frame();

  assert('Fade In Begin', fadeInBegin);
  assert('Fade Out Begin', fadeOutBegin);
  assert('Fade In End', fadeInEnd);
  assert('Fade Out End', fadeOutEnd);
  assert('Change alpha', changeAlpha);
};


/**
 * Tests that alpha values may be changed immediately.
 */
FadableTests.prototype.testFadableSetAlpha = function() {
  var FadedBase = SimpleModel.extend(voodoo.Fadable);
  var instance = new FadedBase();

  instance.setAlpha(0.5);
  assertEquals(0.5, instance.alpha);

  instance.alpha = 0.8;
  assertEquals(0.8, instance.alpha);
};


/**
 * Tests that fading may be paused.
 */
FadableTests.prototype.testPauseFade = function() {
  var Fadable = voodoo.Fadable.extend(DummyModel);
  var instance = new Fadable();

  instance.fadeIn(0.1);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 50)
    voodooEngine.frame();

  assertTrue('Fading:', instance.fading);
  instance.setFading(false);

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (new Date() - start < 25)
    voodooEngine.frame();

  instance.fading = true;

  var start = new Date;
  var voodooEngine = voodoo.engine;
  while (instance.fading && new Date() - start < 100)
    voodooEngine.frame();

  assertFalse('Fading:', instance.fading);
};


/**
 * Tests that there are errors when providing invalid properties.
 */
FadableTests.prototype.testInvalidProperties = function() {
  if (!DEBUG)
    return;

  var Fadable = voodoo.Fadable.extend(DummyModel);
  var instance = new Fadable();

  assertException(function() {
    new voodoo.Fadable({
      alpha: 'abcde'
    });
  });

  assertException(function() {
    new voodoo.Fadable({
      alpha: -1
    });
  });

  assertException(function() {
    new voodoo.Fadable({
      alpha: 2
    });
  });

  assertException(function() {
    instance.alpha = 'abcde';
  });

  assertException(function() {
    instance.setAlpha(2);
  });

  assertException(function() {
    instance.fading = 'red';
  });

  assertException(function() {
    instance.setFading({});
  });

  assertException(function() {
    instance.fadeIn('blue');
  });

  assertException(function() {
    instance.fadeOut([1, 2, 3]);
  });

  assertException(function() {
    instance.fadeTo(-1, 0);
  });
};
