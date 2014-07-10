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
var Image3DTests = AsyncTestCase('Image3DTests');


/**
 * Shutdown the engine between test cases.
 */
Image3DTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
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
      geometryStyle: 'block',
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
      geometryStyle: voodoo.Image3D.GeometryStyle.Float
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
    instance = new voodoo.Image3D({
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
    instance.morph(2, 0.25);

    var start = new Date;
    var voodooEngine = voodoo.engine;
    while (!morphEnd && new Date() - start < 1000)
      voodooEngine.frame();

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

  var changeImageSrc = 0;
  var changeHeightmap = 0;
  var changeHeightmap3 = 0;

  var loaded = false;

  queue.call(function(callbacks) {
    instance = new voodoo.Image3D({
      element: anchor,
      imageSrc: layers,
      heightmap: black,
      heightmap2: layers
    }).on('load', callbacks.add(function() {
      loaded = true;
    }));

    instance.on('changeImageSrc', function() { ++changeImageSrc; });
    instance.on('changeHeightmap', function() { ++changeHeightmap; });
    instance.on('changeHeightmap3', function() { ++changeHeightmap3; });
  });

  queue.call(function() {
    assert('Images loaded:', loaded);

    instance.imageSrc = black;
    assert('ImageSrc:', instance.imageSrc.indexOf(black) !== -1);
    assert('img.src:', anchor.src.indexOf(black) !== -1);

    instance.heightmap = layers;
    assert('Heightmap:', instance.heightmap.indexOf(layers) !== -1);

    instance.heightmap3 = black;
    assert('Heightmap3:', instance.heightmap3.indexOf(black) !== -1);

    anchor.src = layers;
    voodoo.engine.frame();
    assert('ImageSrc (2):', instance.imageSrc.indexOf(layers) !== -1);

    assertEquals('changeImageSrc', 2, changeImageSrc);
    assertEquals('changeHeightmap', 1, changeHeightmap);
    assertEquals('changeHeightmap3', 1, changeHeightmap3);
  });
};


/**
 * Tests that image and height sources can be changed.
 */
Image3DTests.prototype.testImage3DProperties = function() {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var anchor = document.getElementById('anchor');
  var layers = '/test/test/assets/Layers.jpg';
  var black = '/test/test/assets/Black.jpg';

  var instance = new voodoo.Image3D({
    element: anchor,
    imageSrc: layers,
    heightmap: black,
    heightmap2: layers
  });

  var changeGeometryStyle = 0;
  var changeMaxHeight = 0;
  var changeTransparent = 0;

  instance.on('changeGeometryStyle', function() { ++changeGeometryStyle; });
  instance.on('changeMaxHeight', function() { ++changeMaxHeight; });
  instance.on('changeTransparent', function() { ++changeTransparent; });

  instance.geometryStyle = 'smooth';
  instance.setGeometryStyle('block');
  instance.geometryStyle = voodoo.Image3D.GeometryStyle.Smooth;

  instance.maxHeight = 200;
  instance.setMaxHeight(500);
  instance.maxHeight = 1000;

  instance.setTransparent(true);
  instance.setTransparent(false);
  instance.transparent = true;

  assertEquals('changeGeometryStyle', 2, changeGeometryStyle);
  assertEquals('changeMaxHeight', 2, changeMaxHeight);
  assertEquals('changeTransparent', 2, changeTransparent);
};


/**
 * Tests that a morph animation may be paused and resumed.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testPauseMorph = function(queue) {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  var loaded = false;

  queue.call(function(callbacks) {
    instance = new voodoo.Image3D({
      element: document.getElementById('anchor'),
      imageSrc: '/test/test/assets/Layers.jpg',
      heightmap: '/test/test/assets/Black.jpg',
      heightmap2: '/test/test/assets/Layers.jpg'
    }).on('load', callbacks.add(function() {
      loaded = true;
    }));
  });

  queue.call(function() {
    assert('Images loaded:', loaded);
    instance.morph(2, 0.1);

    var start = new Date;
    var voodooEngine = voodoo.engine;
    while (new Date() - start < 50)
      voodooEngine.frame();

    assertTrue('Morphing:', instance.morphing);
    instance.setMorphing(false);

    // Kill time which shouldn't do anything
    var start = new Date;
    var voodooEngine = voodoo.engine;
    while (new Date() - start < 25)
      voodooEngine.frame();

    // Resume
    instance.morphing = true;
    assertTrue('Morphing:', instance.morphing);

    var start = new Date;
    var voodooEngine = voodoo.engine;
    while (instance.morphing && new Date() - start < 100)
      voodooEngine.frame();

    assertFalse('Morphing:', instance.morphing);
  });
};


/**
 * Tests that there are errors when providing invalid properties.
 *
 * @param {Object} queue Async queue.
 */
Image3DTests.prototype.testInvalidProperties = function(queue) {
  /*:DOC +=
    <img style="position:absolute; left:400px; top:400px;
        width:400px; height:300px;" id="anchor"></div>
  */

  if (!DEBUG)
    return;

  assertException(function() {
    new voodoo.Image3D({
      element: 'abcde'
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      imageSrc: 1
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      heightmap: []
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      heightmap4: null
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      maxHeight: '1234'
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      geometryStyle: 'badGeometryStye'
    });
  });

  assertException(function() {
    new voodoo.Image3D({
      transparent: 'maybe'
    });
  });

  var instance;

  queue.call(function(callbacks) {
    instance = new voodoo.Image3D({
      element: document.getElementById('anchor'),
      imageSrc: '/test/test/assets/Layers.jpg',
      heightmap: '/test/test/assets/Black.jpg',
      heightmap2: '/test/test/assets/Layers.jpg'
    });
  });

  queue.call(function(callbacks) {

    assertException(function() {
      instance.imageSrc = 1234;
    });

    assertException(function() {
      instance.heightmap2 = null;
    });

    assertException(function() {
      instance.heightmap3 = {};
    });

    assertException(function() {
      instance.maxHeight = 'red';
    });

    assertException(function() {
      instance.geometryStyle = 1;
    });

    assertException(function() {
      instance.transparent = 'false';
    });

    assertException(function() {
      instance.setImageSrc(4);
    });

    assertException(function() {
      instance.setHeightmap(false);
    });

    assertException(function() {
      instance.setMaxHeight(true);
    });

    assertException(function() {
      instance.setGeometryStyle(true);
    });

    assertException(function() {
      instance.setTransparent([false]);
    });

    assertException(function() {
      instance.morph('abcde', 2);
    });

    assertException(function() {
      instance.morph(1, false);
    });

  });
};

