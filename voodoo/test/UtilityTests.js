// ----------------------------------------------------------------------------
// File: UtilityTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for the utility functions.
 *
 * @constructor
 */
var UtilityTests = TestCase('UtilityTests');


/**
 * Shuts down the engine between test cases.
 */
UtilityTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the conversions between CSS colors and Three.Js colors work.
 */
UtilityTests.prototype.testColorConversions = function() {
  var utility = voodoo.utility;

  // Test hex colors
  var teal = utility.convertCssColorToThreeJsColor('#00FFFF');
  assertEquals(0.0, teal.r);
  assertEquals(1.0, teal.g);
  assertEquals(1.0, teal.b);

  // Test RGB colors
  var magenta = utility.convertCssColorToThreeJsColor('rgb(255, 0, 255)');
  assertEquals(1.0, magenta.r);
  assertEquals(0.0, magenta.g);
  assertEquals(1.0, magenta.b);

  // Test RGBA colors
  var yellow = utility.convertCssColorToThreeJsColor('rgba(255, 255, 0, 0.5)');
  assertEquals(1.0, yellow.r);
  assertEquals(1.0, yellow.g);
  assertEquals(0.0, yellow.b);

  // Test HSL colors
  var green = utility.convertCssColorToThreeJsColor('hsl(120, 50%, 50%)');
  var error = 0.005;
  assert(green.r < 64.0 / 255.0 + error);
  assert(green.r > 64.0 / 255.0 - error);
  assert(green.g < 191.0 / 255.0 + error);
  assert(green.g > 191.0 / 255.0 - error);
  assert(green.b < 64.0 / 255.0 + error);
  assert(green.b > 64.0 / 255.0 - error);

  // Test HSLA colors
  var blue = utility.convertCssColorToThreeJsColor('hsla(240, 80%, 80%, 0.5)');
  assert(blue.r < 163.0 / 255.0 + error);
  assert(blue.r > 163.0 / 255.0 - error);
  assert(blue.g < 163.0 / 255.0 + error);
  assert(blue.g > 163.0 / 255.0 - error);
  assert(blue.b < 245.0 / 255.0 + error);
  assert(blue.b > 245.0 / 255.0 - error);

  // Test direct color conversions
  var red = utility.convertCssColorToThreeJsColor('red');
  assertEquals(1.0, red.r);
  assertEquals(0.0, red.g);
  assertEquals(0.0, red.b);
};


/**
 * Tests that the conversions between CSS colors and Three.Js colors work.
 */
UtilityTests.prototype.testFindAbsolutePosition = function() {
  /*:DOC +=
    <div style="position:absolute; left:500px; top:600px" id="element">
      <p>element</p>
    </div>
  */
  var element = document.getElementById('element');
  var pos = voodoo.utility.findAbsolutePosition(element);
  assertEquals(500, pos.x);
  assertEquals(600, pos.y);
};
