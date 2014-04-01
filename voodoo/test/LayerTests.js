// ----------------------------------------------------------------------------
// File: LayerTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases against Views existing in only the above or below layers.
 *
 * @constructor
 */
LayerTests = TestCase('LayerTests');


/**
 * Test case setup. Runs once before each test.
 */
LayerTests.prototype.setUp = function() {
  // Create an engine with no antialiasing so no seam layers.
  voodoo.engine = new voodoo.Engine({ antialias: false });
};


/**
 * Shuts down the engine between test cases.
 */
LayerTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that by default Views are created in both above and below layers.
 */
LayerTests.prototype.testBothLayers = function() {
  var views = 0;

  var LayerCounterView = voodoo.View.extend({
    load: function() {
      views++;
    }
  });

  var LayerCounterModel = voodoo.Model.extend({
    name: 'LayerCounterModel',
    viewType: LayerCounterView
  });

  new LayerCounterModel();

  // Above, below, stencil layers
  assertEquals(3, views);
};


/**
 * Tests that by default Views are created just the above layer when
 * the below property of the view is set to false.
 */
LayerTests.prototype.testAboveLayer = function() {
  var views = 0;

  var LayerCounterView = voodoo.View.extend({
    load: function() {
      views++;
    },
    below: false
  });

  var LayerCounterModel = voodoo.Model.extend({
    name: 'LayerCounterModel',
    viewType: LayerCounterView
  });

  new LayerCounterModel();

  // Just the above layer
  assertEquals(1, views);
};


/**
 * Tests that by default Views are created just the below layer when
 * the above property of the view is set to false.
 */
LayerTests.prototype.testBelowLayer = function() {
  var views = 0;

  var LayerCounterView = voodoo.View.extend({
    load: function() {
      views++;
    },
    above: false
  });

  var LayerCounterModel = voodoo.Model.extend({
    name: 'LayerCounterModel',
    viewType: LayerCounterView
  });

  new LayerCounterModel();

  // The below and stencil layers
  assertEquals(2, views);
};


/**
 * Tests that an error is thrown when a view tries to be instantiated
 * but it exists in no layers.
 */
LayerTests.prototype.testNoLayers = function() {
  var LayerCounterView = voodoo.View.extend({
    above: false,
    below: false
  });

  var LayerCounterModel = voodoo.Model.extend({
    name: 'LayerCounterModel',
    viewType: LayerCounterView
  });

  assertException('Invalid View layers', function() {
    new LayerCounterModel();
  });
};
