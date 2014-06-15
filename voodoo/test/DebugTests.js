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

    assertNoException(function() { voodooDebug.disableStencils = false; });
    assertNoException(function() { voodooDebug.drawStencils = false; });
    assertNoException(function() { voodooDebug.showFps = false; });

  } else {

    assertException(function() { voodooDebug.disableStencils = true; });
    assertException(function() { voodooDebug.drawStencils = true; });
    assertException(function() { voodooDebug.showFps = true; });

  }
};
