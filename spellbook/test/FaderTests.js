// ----------------------------------------------------------------------------
// File: FaderTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Fader class works as expected.
 *
 * @constructor
 */
FaderTests = TestCase('FaderTests');


/**
 * Shutdown the engine between test cases.
 */
FaderTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Fader class can be extended from other types.
 */
FaderTests.prototype.testFaderExtend = function() {
  var Base = voodoo.Model.extend({
    name: 'Base',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
      }
    })
  });

  var FadedBase = Base.extend(voodoo.Fader);
  var BaseFaded = voodoo.Fader.extend(Base);

  var instance1 = new FadedBase();
  var instance2 = new BaseFaded();

  instance1.fadeIn(1);
  instance2.fadeTo(0.5, 1);
};


/**
 * Tests that the fadeBegin and fadeEnd events work.
 */
FaderTests.prototype.testFaderEvents = function() {
  var instance = new voodoo.Fader();

  var fadeInBegin = false;
  var fadeInEnd = false;
  var fadeOutBegin = false;
  var fadeOutEnd = false;

  instance.on('fadeBegin', function() {
    if (instance.alpha === 0)
      fadeInBegin = true;
    else if (instance.alpha === 1)
      fadeOutBegin = true;
  });

  instance.on('fadeEnd', function() {
    if (instance.alpha === 0)
      fadeOutEnd = true;
    else if (instance.alpha === 1) {
      fadeInEnd = true;
      this.fadeOut(0.0001);
    }
  });

  instance.fadeIn(0.0001);

  var start = new Date;
  while (!fadeOutEnd && new Date() - start < 1000)
    voodoo.engine.frame();

  assert('Did not start fading in', fadeInBegin);
  assert('Did not start fading out', fadeOutBegin);
  assert('Did not finish fading in', fadeInEnd);
  assert('Did not finish fading out', fadeOutEnd);
};
