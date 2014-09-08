// ------------------------------------------------------------------------------------------------
// File: TestModels.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * A fake model that may be used for testing. Displays nothing.
 *
 * @constructor
 */
var DummyModel = voodoo.Model.extend({

  name: 'DummyModel',

  viewType: voodoo.View.extend()

});



/**
 * A simple model with simple geometry.
 *
 * @constructor
 */
var SimpleModel = voodoo.Model.extend({

  name: 'SimpleModel',

  viewType: voodoo.View.extend({
    load: function() {
      this.base.load();

      var geometry = new THREE.BoxGeometry(200, 200, 200);
      var material = new THREE.MeshBasicMaterial();
      var mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh);
    }
  })

});



/**
 * A simple model with simple geometry that attaches to an element provided.
 *
 * @constructor
 */
var AttachedModel = voodoo.Model.extend({

  name: 'AttachedModel',

  initialize: function(options) {
    this.base.initialize(options);

    this.element = options.element;
  },

  viewType: voodoo.View.extend({
    load: function() {
      this.base.load();

      var geometry = new THREE.BoxGeometry(200, 200, 200);
      var material = new THREE.MeshLambertMaterial();
      var mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh);
      this.attach(this.model.element);
      this.triggers.add(mesh);
    }
  })

});
