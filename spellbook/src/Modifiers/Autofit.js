// ----------------------------------------------------------------------------
// File: Autofit.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that autoscales and autoscenters meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var AutofitView_ = voodoo.View.extend({

  above: false,
  below: false,

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      this.autofitMeshGeometry_(e.object);
      this.dirty();
    });

    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      this.autofitMeshGeometry_(sceneObject);
    }

    this.dirty();
  },

  autofitMeshGeometry_: function(sceneObject) {
    var geometry = sceneObject['geometry'];
    if (!geometry)
      return;

    if (!geometry.boundingSphere)
      geometry.computeBoundingSphere();

    var boundingSphere = geometry.boundingSphere;
    var center = boundingSphere.center;
    var radius = boundingSphere.radius;

    if (center.x === 0 && center.y === 0 && center.z === 0 && radius === 0.5)
      return;

    var radius2 = radius * 2;

    var vertices = geometry.vertices;
    for (var i = 0, len = vertices.length; i < len; ++i) {
      var vertex = vertices[i];

      vertex.x = (vertex.x - center.x) / radius2;
      vertex.y = (vertex.y - center.y) / radius2;
      vertex.z = (vertex.z - center.z) / radius2;
    }

    var morphTargets = geometry.morphTargets;
    if (morphTargets) {
      for (var i = 0, len = morphTargets.length; i < len; ++i) {
        var morphTarget = morphTargets[i];
        var morphTargetVertices = morphTarget.vertices;

        if (morphTargetVertices) {
          for (var j = 0, len2 = morphTargetVertices.length; j < len2; ++j) {
            var vertex = morphTargetVertices[j];

            vertex.x = (vertex.x - center.x) / radius2;
            vertex.y = (vertex.y - center.y) / radius2;
            vertex.z = (vertex.z - center.z) / radius2;
          }
        }
      }
    }

    geometry.verticesNeedUpdate = true;
    geometry.morphTargetsNeedUpdate = true;
    geometry.computeBoundingSphere();
  }

});



/**
 * Automatically scales and centers meshes added to the scene to fit
 * between -0.5 and 0.5.
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Autofit = this.Autofit = voodoo.Model.extend({

  name: 'Autofit',
  organization: 'spellbook',
  viewType: AutofitView_

});
