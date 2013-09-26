// ----------------------------------------------------------------------------
// File: SceneTests.js
//
// Copyright (c) 2013 VoodooJs Authors
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
  voodoo.engine = new voodoo.Engine({ frameLoop: false, stencils: false });

  enableMouseEvents();
};


/**
 * Test case shutdown. Runs once after each test.
 */
SceneTests.prototype.tearDown = function() {
  // Shutdown the engine between test cases.
  if (typeof voodoo.engine !== 'undefined')
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
