// ----------------------------------------------------------------------------
// File: AutofitTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Autofit class works as expected.
 *
 * @constructor
 */
var AutofitTests = TestCase('AutofitTests');


/**
 * Shutdown the engine between test cases.
 */
AutofitTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Autofit class can be extended from other types.
 */
AutofitTests.prototype.testAutofitExtend = function() {
  var AutofitBase = SimpleModel.extend(voodoo.Autofit);
  var BaseAutofit = voodoo.Autofit.extend(SimpleModel);

  var instance1 = new AutofitBase();
  var instance2 = new BaseAutofit();
};
