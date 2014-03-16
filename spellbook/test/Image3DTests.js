// ----------------------------------------------------------------------------
// File: Image3DTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Image3D class works as expected.
 *
 * @constructor
 */
Image3DTests = AsyncTestCase('Image3DTests');


/**
 * Shutdown the engine between test cases.
 */
Image3DTests.prototype.tearDown = function() {
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that the Image3D class can be created on a div.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testImage3DCreateOnDiv = function(queue) {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var loaded = false;

  queue.call(function(callbacks) {
    new voodoo.Image3D({
      element: document.getElementById('anchor'),
      imageSrc: '/test/test/assets/Layers.jpg',
      heightmap: '/test/test/assets/Black.jpg',
      maxHeight: 200,
      geometryStyle: voodoo.Image3D.GeometryStyle.Block,
      lightingStyle: voodoo.Image3D.LightingStyle.Vertex,
      transparent: true
    }).on('load', callbacks.add(function() {
      loaded = true;
    }));
  });

  queue.call(function() {
    assert('Images loaded:', loaded);
  });
};


/**
 * Tests that the Image3D class can be created on an image.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testImage3DCreateOnImg = function(queue) {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="img"
        src="/test/test/assets/Layers.jpg"></div>
  */

  var loaded = false;

  queue.call(function(callbacks) {
    new voodoo.Image3D({
      element: document.getElementById('img'),
      heightmap: '/test/test/assets/Black.jpg',
      geometryStyle: voodoo.Image3D.GeometryStyle.Float,
      lightingStyle: voodoo.Image3D.LightingStyle.Face
    }).on('load', callbacks.add(function() {
      loaded = true;
    }));
  });

  queue.call(function() {
    assert('Images loaded:', loaded);
  });
};


/**
 * Tests that the morphBegin and morphEnd events work.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testImage3DEvents = function(queue) {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var loaded = false;
  var morphBegin = false;
  var morphEnd = false;

  queue.call(function(callbacks) {
    img3d = new voodoo.Image3D({
      element: document.getElementById('anchor'),
      imageSrc: '/test/test/assets/Layers.jpg',
      heightmap: '/test/test/assets/Black.jpg',
      heightmap2: '/test/test/assets/Layers.jpg'
    }).on('load', callbacks.add(function() {
      loaded = true;
    })).on('morphBegin', function() {
      morphBegin = true;
    }).on('morphEnd', function() {
      morphEnd = true;
    });
  });

  queue.call(function() {
    assert('Images loaded:', loaded);
    img3d.morph(2, 0.25);

    var start = new Date;
    while (!morphEnd && new Date() - start < 1000)
      voodoo.engine.frame();

    assert('Morph Begin:', morphBegin);
    assert('Morph End:', morphEnd);
  });
};


/**
 * Tests that image and height sources can be changed.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testImage3DChangeSources = function(queue) {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var anchor = document.getElementById('anchor');
  var layers = '/test/test/assets/Layers.jpg';
  var black = '/test/test/assets/Black.jpg';

  queue.call(function(callbacks) {
    img3d = new voodoo.Image3D({
      element: anchor,
      imageSrc: layers,
      heightmap: black,
      heightmap2: layers
    }).on('load', callbacks.add(function() {}));
  });

  queue.call(function() {
    img3d.imageSrc = black;
    assert('ImageSrc:', img3d.imageSrc.indexOf(black) !== -1);
    assert('img.src:', anchor.src.indexOf(black) !== -1);

    img3d.heightmap = layers;
    assert('Heightmap:', img3d.heightmap.indexOf(layers) !== -1);

    img3d.heightmap3 = black;
    assert('Heightmap3:', img3d.heightmap3.indexOf(black) !== -1);

    anchor.src = layers;
    voodoo.engine.frame();
    assert('ImageSrc (2):', img3d.imageSrc.indexOf(layers) !== -1);
  });
};

