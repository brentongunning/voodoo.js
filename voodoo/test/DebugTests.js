// ----------------------------------------------------------------------------
// File: DebugTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests the debug settings.
 *
 * @constructor
 */
var DebugTests = TestCase('DebugTests');


/**
 * Shuts down the engine between test cases.
 */
DebugTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that setting debug settings in non-debug builds throws an exception.
 */
DebugTests.prototype.testReleaseBuildErrors = function() {
  var isDebug = voodoo.version.indexOf('debug') !== -1;

  voodoo.engine = new voodoo.Engine();
  var voodooDebug = voodoo.debug;

  if (isDebug) {

    assertNoException(function() { voodooDebug.disableCache = false; });
    assertNoException(function() { voodooDebug.disableStencils = false; });
    assertNoException(function() { voodooDebug.drawStencils = false; });
    assertNoException(function() { voodooDebug.showFps = false; });

  } else {

    assertException(function() { voodooDebug.disableCache = true; });
    assertException(function() { voodooDebug.disableStencils = true; });
    assertException(function() { voodooDebug.drawStencils = true; });
    assertException(function() { voodooDebug.showFps = true; });

  }
};


/**
 * Tests that caching may be disabled.
 */
DebugTests.prototype.testDisableCache = function() {
  var isDebug = voodoo.version.indexOf('debug') !== -1;

  voodoo.engine = new voodoo.Engine();
  var voodooDebug = voodoo.debug;

  var CustomView = voodoo.View.extend({
    initializeCache: function() {
      this.cache.set('one', 1);
    },

    testDisabledCache: function() {
      this.cache.set('hello', 'world');
      assertFalse(this.cache.has('hello'));

      this.cache.delete('one');
      this.cache.release('one');
    },

    testEnabledCache: function() {
      assertFalse(this.cache.has('hello'));
      assertTrue(this.cache.has('one'));
      assertEquals(1, this.cache.get('one'));

      this.cache.release('one');
      assertFalse(this.cache.has('one'));
    }
  });

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: CustomView,

    initializeCache: function() {
      this.cache.set('one', 1);

      this.view.initializeCache();
      if (this.stencilView)
        this.stencilView.initializeCache();
    },

    testDisabledCache: function() {
      this.cache.set('hello', 'world');
      assertFalse(this.cache.has('hello'));

      this.cache.delete('one');
      this.cache.release('one');

      this.view.testDisabledCache();
      if (this.stencilView)
        this.stencilView.testDisabledCache();
    },

    testEnabledCache: function() {
      assertFalse(this.cache.has('hello'));
      assertTrue(this.cache.has('one'));
      assertEquals(1, this.cache.get('one'));

      this.cache.release('one');
      assertFalse(this.cache.has('one'));

      this.view.testEnabledCache();
      if (this.stencilView)
        this.stencilView.testEnabledCache();
    }
  });

  var model = new CustomModel();
  model.initializeCache();

  if (isDebug) {
    voodooDebug.disableCache = true;
    model.testDisabledCache();
    voodooDebug.disableCache = false;
  }

  model.testEnabledCache();
};
