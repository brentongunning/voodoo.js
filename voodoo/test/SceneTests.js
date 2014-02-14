// ----------------------------------------------------------------------------
// File: SceneTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for scenes and local coordinate systems.
 *
 * @constructor
 */
SceneTests = TestCase('SceneTests');


/**
 * Test case initialization. Runs once before each test.
 */
SceneTests.prototype.setUp = function() {
  // Just create an above layer.
  voodoo.engine = new voodoo.Engine({
    seamLayer: false,
    stencils: false,
    belowLayer: false,
    frameLoop: false
  });

  enableMouseEvents();
};


/**
 * Test case shutdown. Runs once after each test.
 */
SceneTests.prototype.tearDown = function() {
  // Shutdown the engine between test cases.
  if (typeof voodoo.engine !== 'undefined' && voodoo.engine !== null)
    voodoo.engine.destroy();
};


/**
 * Tests that attach works for centering and scaling in pixels.
 */
SceneTests.prototype.testAttachCenterPixels = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:200px; height:200px;" id="anchor">
      <p>anchor</p>
    </div>
  */

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(100, 100, 100);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.triggers.add(mesh);

        this.scene.attach(this.model.element/*, true, true */);
      }
    }),
    initialize: function(options) {
      this.element = options.element;
    }
  });

  var anchor = document.getElementById('anchor');
  var model = new CustomModel({element: anchor});

  var click = 0;
  model.on('click', function(evt) {click++;});

  assertEquals('click events:', 0, click);
  fireClick(500, 500);
  assertEquals('click events:', 1, click);
};


/**
 * Tests that attach works for top left positioning and scaling in units.
 */
SceneTests.prototype.testAttachTopLeftUnits = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:200px; height:200px;" id="anchor">
      <p>anchor</p>
    </div>
  */

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1, 1, 100);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(0.5, 0.5, 0);

        this.scene.add(mesh);
        this.triggers.add(mesh);

        this.scene.attach(this.model.element, false, false);
      }
    }),
    initialize: function(options) {
      this.element = options.element;
    }
  });

  var anchor = document.getElementById('anchor');
  var model = new CustomModel({element: anchor});

  var click = 0;
  model.on('click', function(evt) {click++;});

  assertEquals('click events:', 0, click);
  fireClick(500, 500);
  assertEquals('click events:', 1, click);
};


/**
 * Tests that detach works.
 */
SceneTests.prototype.testDetach = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:200px; height:200px;" id="anchor">
      <p>anchor</p>
    </div>
  */

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1, 1, 100);
        var material = new THREE.MeshBasicMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.triggers.add(mesh);

        this.scene.attach(this.model.element, true, false);
      },
      detach: function() {
        this.scene.detach();
      }
    }),
    initialize: function(options) {
      this.element = options.element;
    },
    detach: function() {
      this.view.detach();
    }
  });

  var anchor = document.getElementById('anchor');
  var model = new CustomModel({element: anchor});

  var click = 0;
  model.on('click', function(evt) {click++;});

  assertEquals('click events:', 0, click);
  fireClick(500, 500);
  assertEquals('click events:', 1, click);

  // Detach and make sure our click doesn't hit.
  model.detach();
  fireClick(500, 500);
  assertEquals('click events:', 1, click);
};


/**
 * Tests scene events.
 */
SceneTests.prototype.testSceneEvents = function() {
  /*:DOC +=
    <div style="position:absolute; left:400px; top:400px;
        width:200px; height:200px;" id="anchor">
      <p>anchor</p>
    </div>
  */

  var sceneAdd = 0;
  var sceneRemove = 0;
  var sceneAttach = 0;
  var sceneDetach = 0;
  var sceneMove = 0;
  var sceneResize = 0;

  var CustomModel = voodoo.Model.extend({
    name: 'CustomModel',
    viewType: voodoo.View.extend({
      load: function() {
        this.scene.on('add', function() { sceneAdd++; });
        this.scene.on('remove', function() { sceneRemove++; });
        this.scene.on('attach', function() { sceneAttach++; });
        this.scene.on('detach', function() { sceneDetach++; });
        this.scene.on('move', function() { sceneMove++; });
        this.scene.on('resize', function() { sceneResize++; });

        var geometry = new THREE.CubeGeometry(1, 1, 100);
        var material = new THREE.MeshBasicMaterial();
        this.mesh = new THREE.Mesh(geometry, material);

        this.scene.add(this.mesh);
        this.triggers.add(this.mesh);

        this.scene.attach(this.model.element, true, false);
        assertEquals('scene objects:', 1, this.scene.objects.length);
      },
      detach: function() {
        this.scene.detach();
      },
      unload: function() {
        this.scene.remove(this.mesh);
        assertEquals('scene objects:', 0, this.scene.objects.length);
      }
    }),
    initialize: function(options) {
      this.element = options.element;
    },
    detach: function() {
      this.view.detach();
    }
  });

  var anchor = document.getElementById('anchor');
  var model = new CustomModel({element: anchor});
  voodoo.engine.frame();
  model.detach();
  model.destroy();

  assertEquals('sceneAdd:', 1, sceneAdd);
  assertEquals('sceneRemove:', 1, sceneRemove);
  assertEquals('sceneAttach:', 1, sceneAttach);
  assertEquals('sceneDetach:', 1, sceneDetach);
  assertEquals('sceneMove:', 1, sceneMove);
  assertEquals('sceneResize:', 1, sceneResize);
};

