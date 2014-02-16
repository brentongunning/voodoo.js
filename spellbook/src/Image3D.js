// ----------------------------------------------------------------------------
// File: Image3D.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that loads the heightmaps and geometry for a 3D image.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var Image3DView_ = voodoo.View.extend({

  below: false,

  load: function() {
    this.base.load();

    var self = this;
    this.loadHeightmaps(function() {
      self.loadTexture(function() {
        self.createMesh();
        self.loaded = true;
      });
    });

    this.loaded = false;
  },

  loadHeightmaps: function(callback) {
    this.heightmapWidth = 0;
    this.heightmapHeight = 0;

    var numLoaded = 0;
    var numToLoad = 0;
    function onLoad(heightmap) {
      // Ensure all heightmaps are the same size
      if (numLoaded == 0) {
        this.heightmapWidth = heightmap.width;
        this.heightmapHeight = heightmap.height;
      } else {
        if (this.heightmapWidth != heightmap.width ||
            this.heightmapHeight != heightmap.height)
          throw '[Image3D]: All heightmaps must be the same size';
      }

      numLoaded++;
      if (numLoaded == numToLoad) {
        callback();
      }
    }

    this.heightmaps = [];
    for (var i = 0; i < 4; ++i) {
      if (this.model.heightSources[i] !== '') {
        var heightmap = new Image();
        heightmap.onload = onLoad.bind(this, heightmap);
        numToLoad++;
        this.heightmaps.push(heightmap);
      }
      else this.heightmaps.push(null);
    }

    for (var i = 0; i < 4; ++i) {
      var heightmap = this.heightmaps[i];
      if (heightmap != null)
        heightmap.src = this.model.heightSources[i];
    }
  },

  loadTexture: function(callback) {
    var self = this;
    this.texture = THREE.ImageUtils.loadTexture(this.model.imageSrc, {},
        function() {
          self.initializeTexture();
          callback();
        });
  },

  initializeTexture: function(texture) {
    this.texture.flipY = false;
    this.texture.miFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
  },

  createMaterial: function() {
    if (this.model.lightingStyle !== Image3D.LightingStyle.None) {
      return new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        ambient: 0x000000,
        map: this.texture,
        transparent: this.model.transparent,
        morphTargets: this.anyMorphTargets,
        morphNormals: this.anyMorphTargets
      });
    } else {
      return new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        map: this.texture,
        transparent: this.model.transparent
      });
    }
  },

  computeNormals: function(geometry, anyMorphTargets) {
    switch (this.model.lightingStyle) {
      case Image3D.LightingStyle.Vertex:
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        break;
      case Image3D.LightingStyle.Face:
        geometry.computeFaceNormals();
        break;
      case Image3D.LightingStyle.None:
        break;
    }

    if (anyMorphTargets)
      geometry.computeMorphNormals();
  },

  getDepth: function(data, i) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    var avg = (r + g + b) / 3.0;
    return avg / 255.0 * this.model.maxHeight;
  },

  createSmoothGeometry: function(geometry, vertices, data, createFaces) {
    // Constants
    var width = this.heightmapWidth;
    var height = this.heightmapHeight;
    var invWidthMinusOne = 1.0 / (width - 1);
    var invHeightMinusOne = 1.0 / (height - 1);
    var stride = width * 4;

    // Vertices
    var i = 0;
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var depth = this.getDepth(data, i);
        vertices.push(new THREE.Vector3(
            x * invWidthMinusOne,
            y * invHeightMinusOne,
            depth));
        i += 4;
      }
    }

    // Indices
    if (createFaces) {
      var yi = 0, yi2 = width;
      for (var y = 0; y < height - 1; ++y) {
        for (var x = 0; x < width - 1; ++x) {
          var x2 = x + 1;
          geometry.faces.push(new THREE.Face3(yi + x, yi + x2, yi2 + x2));
          geometry.faces.push(new THREE.Face3(yi + x, yi2 + x2, yi2 + x));

          var u1 = x * invWidthMinusOne;
          var u2 = x2 * invWidthMinusOne;
          var v1 = y * invHeightMinusOne;
          var v2 = (y + 1) * invHeightMinusOne;

          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u2, v2)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u1, v2)
          ]);
        }
        yi += width;
        yi2 += width;
      }
    }
  },

  createBlockGeometry: function(geometry, data) {
    // Constants
    var width = this.heightmapWidth;
    var height = this.heightmapHeight;
    var invWidth = 1.0 / width;
    var invHeight = 1.0 / height;
    var widthRatio = this.texture.image.width / width;
    var heightRatio = this.texture.image.height / height;
    var invTextureWidth = 1.0 / this.texture.image.width;
    var invTextureHeight = 1.0 / this.texture.image.height;

    // Precalculate depth
    var depths = new Array(height);
    var i = 0;
    for (var y = 0; y < height; ++y) {
      var line = new Array(width);
      for (var x = 0; x < width; ++x) {
        line[x] = this.getDepth(data, i);
        i += 4;
      }
      depths[y] = line;
    }

    var v = 0;
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var depth = depths[y][x];
        var depthLeft = x > 0 ? depths[y][x - 1] : 0;
        var depthTop = y > 0 ? depths[y - 1][x] : 0;
        var depthRight = x < width - 1 ? depths[y][x + 1] : 0;
        var depthBottom = y < height - 1 ? depths[y + 1][x] : 0;

        var x1 = x * invWidth;
        var x2 = (x + 1) * invWidth;
        var y1 = y * invHeight;
        var y2 = (y + 1) * invHeight;

        var xr = x * widthRatio;
        var yr = y * heightRatio;
        var u1 = (xr + 0.5) * invTextureWidth;
        var u2 = (xr + widthRatio - 0.5) * invTextureWidth;
        var v1 = (yr + 0.5) * invTextureHeight;
        var v2 = (yr + heightRatio - 0.5) * invTextureHeight;

        var j = v;
        geometry.vertices.push(new THREE.Vector3(x1, y1, depth));
        geometry.vertices.push(new THREE.Vector3(x2, y1, depth));
        geometry.vertices.push(new THREE.Vector3(x2, y2, depth));
        geometry.vertices.push(new THREE.Vector3(x1, y2, depth));
        v += 4;

        // Front

        geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
        geometry.faces.push(new THREE.Face3(j, j + 2, j + 3));
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2(u1, v1),
          new THREE.Vector2(u2, v1),
          new THREE.Vector2(u2, v2)
        ]);
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2(u1, v1),
          new THREE.Vector2(u2, v2),
          new THREE.Vector2(u1, v2)
        ]);

        // Left

        if (depth > depthLeft) {
          geometry.vertices.push(new THREE.Vector3(x1, y1, depthLeft));
          geometry.vertices.push(new THREE.Vector3(x1, y2, depthLeft));

          geometry.faces.push(new THREE.Face3(j, j + 3, v + 1));
          geometry.faces.push(new THREE.Face3(j, v + 1, v));
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u1, v2),
            new THREE.Vector2(u1, v2)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u1, v2),
            new THREE.Vector2(u1, v1)
          ]);

          v += 2;
        }

        // Right

        if (depth > depthRight) {
          geometry.vertices.push(new THREE.Vector3(x2, y1, depthRight));
          geometry.vertices.push(new THREE.Vector3(x2, y2, depthRight));

          geometry.faces.push(new THREE.Face3(j + 2, j + 1, v + 0));
          geometry.faces.push(new THREE.Face3(j + 2, v + 0, v + 1));
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u2, v1)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u2, v2)
          ]);

          v += 2;
        }

        // Top

        if (depth > depthTop) {
          geometry.vertices.push(new THREE.Vector3(x1, y1, depthTop));
          geometry.vertices.push(new THREE.Vector3(x2, y1, depthTop));

          geometry.faces.push(new THREE.Face3(j + 1, j, v));
          geometry.faces.push(new THREE.Face3(j + 1, v, v + 1));
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u1, v1)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u2, v1)
          ]);

          v += 2;
        }

        // Bottom

        if (depth > depthBottom) {
          geometry.vertices.push(new THREE.Vector3(x1, y2, depthBottom));
          geometry.vertices.push(new THREE.Vector3(x2, y2, depthBottom));

          geometry.faces.push(new THREE.Face3(j + 3, j + 2, v + 1));
          geometry.faces.push(new THREE.Face3(j + 3, v + 1, v));
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v2),
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u2, v2)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v2),
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u1, v2)
          ]);

          v += 2;
        }
      }
    }
  },

  createFloatGeometry: function(geometry, vertices, data, createFaces) {
    // Constants
    var width = this.heightmapWidth;
    var height = this.heightmapHeight;
    var invWidth = 1.0 / width;
    var invHeight = 1.0 / height;
    var widthRatio = this.texture.image.width / width;
    var heightRatio = this.texture.image.height / height;
    var invTextureWidth = 1.0 / this.texture.image.width;
    var invTextureHeight = 1.0 / this.texture.image.height;

    var i = 0;
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var depth = this.getDepth(data, i);

        var x1 = x * invWidth;
        var x2 = (x + 1) * invWidth;
        var y1 = y * invHeight;
        var y2 = (y + 1) * invHeight;

        vertices.push(new THREE.Vector3(x1, y1, depth));
        vertices.push(new THREE.Vector3(x2, y1, depth));
        vertices.push(new THREE.Vector3(x2, y2, depth));
        vertices.push(new THREE.Vector3(x1, y2, depth));

        if (createFaces) {
          var xr = x * widthRatio;
          var yr = y * heightRatio;
          var u1 = (xr + 0.5) * invTextureWidth;
          var u2 = (xr + widthRatio - 0.5) * invTextureWidth;
          var v1 = (yr + 0.5) * invTextureHeight;
          var v2 = (yr + heightRatio - 0.5) * invTextureHeight;

          geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
          geometry.faces.push(new THREE.Face3(i, i + 2, i + 3));

          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u2, v1),
            new THREE.Vector2(u2, v2)
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u1, v1),
            new THREE.Vector2(u2, v2),
            new THREE.Vector2(u1, v2)
          ]);
        }

        i += 4;
      }
    }
  },

  createHeightmapGeometry: function(geometry, vertices, index, isPrimary) {
    this.context.drawImage(this.heightmaps[index], 0, 0,
        this.heightmapWidth, this.heightmapHeight);
    var data = this.context.getImageData(0, 0,
        this.heightmapWidth, this.heightmapHeight).data;

    switch (this.model.geometryStyle) {
      case Image3D.GeometryStyle.Smooth:
        this.createSmoothGeometry(geometry, vertices, data, isPrimary);
        break;
      case Image3D.GeometryStyle.Block:
        this.createBlockGeometry(geometry, data);
        break;
      case Image3D.GeometryStyle.Float:
        this.createFloatGeometry(geometry, vertices, data, isPrimary);
        break;
    }
  },

  createGeometry: function() {
    var geometry = new THREE.Geometry();

    var canvas = document.createElement('canvas');
    canvas.width = this.heightmapWidth;
    canvas.height = this.heightmapHeight;
    this.context = canvas.getContext('2d');

    this.createHeightmapGeometry(geometry, geometry.vertices, 0, true);

    // Morph targets are not supported for the block style.
    this.anyMorphTargets = false;
    if (this.model.geometryStyle !== Image3D.GeometryStyle.Block) {
      for (var i = 1; i < 4; ++i) {
        if (this.heightmaps[i]) {
          var morphTarget = {
            name: 'target' + i.toString(),
            vertices: []
          };
          this.createHeightmapGeometry(geometry, morphTarget.vertices,
              i, false);
          geometry.morphTargets.push(morphTarget);
          this.anyMorphTargets = true;
        }
      }
    }

    this.computeNormals(geometry, this.anyMorphTargets);

    // Make sure there are no morph targets for block geometry
    if (this.anyMorphTargets &&
        this.model.geometryStyle == Image3D.GeometryStyle.Block)
      throw '[Image3D] Block geometry does not support alternate heightmaps';

    return geometry;
  },

  createMesh: function() {
    var geometry = this.createGeometry();
    var material = this.createMaterial();
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.morphTargetInfluences = this.model.currentMorphTargets;

    this.scene.add(this.mesh);
    this.scene.attach(this.model.element, false, false);
  },

  setMorphTargetInfluences: function(influences) {
    if (this.mesh) {
      this.mesh.morphTargetInfluences = influences;
      this.dirty();
    }
  }

});



/**
 * A image shown in 3D using heightmaps.
 *
 * Options are:
 *   element {HTMLElement} HTML element to attach to.
 *   imageSrc {string=} Optional image source.
 *   heightmap {string} Initial heightmap image path.
 *   heightmap2 {string=} Optional second heightmap path.
 *   heightmap3 {string=} Optional third heightmap path.
 *   heightmap4 {string=} Optional fourth heightmap path.
 *   maxHeight {number=} Optional maximum depth of the heightmap.
 *   geometryStyle {Image3D.GeometryStyle=} Optional geometry style.
 *   lightingStyle {Image3D.LightingStyle=} Optional lighting style.
 *   transparent {boolean=} Whether to allow in-between transparency.
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Image3D = this.Image3D = voodoo.Model.extend({

  name: 'Image3D',
  organization: 'spellbook',
  viewType: Image3DView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.element = options.element;
    if (typeof options.element === 'undefined')
      throw '[Image3D] element must be defined';

    this.imageSrc = options.imageSrc || options.element.src;
    this.heightSources = [
      typeof options.heightmap !== 'undefined' ? options.heightmap : '',
      typeof options.heightmap2 !== 'undefined' ? options.heightmap2 : '',
      typeof options.heightmap3 !== 'undefined' ? options.heightmap3 : '',
      typeof options.heightmap4 !== 'undefined' ? options.heightmap4 : ''
    ];

    if (typeof options.heightmap === 'undefined')
      throw '[Image3D] heightmap must be defined';

    this.maxHeight = typeof options.maxHeight !== 'undefined' ?
        options.maxHeight : 200;
    this.geometryStyle = typeof options.geometryStyle !== 'undefined' ?
        options.geometryStyle : Image3D.GeometryStyle.Smooth;
    this.lightingStyle = typeof options.lightingStyle !== 'undefined' ?
        options.lightingStyle : Image3D.LightingStyle.Face;
    this.transparent = typeof options.transparent !== 'undefined' ?
        options.transparent : true;

    this.animating = false;
    this.startTime = 0;
    this.animationLength = 1;
    this.startMorphTargets = [0, 0, 0];
    this.currentMorphTargets = [0, 0, 0];
    this.endMorphTargets = [0, 0, 0];
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.animating) {
      var now = new Date().getTime();
      var delta = now - this.startTime;
      var time = delta / this.animationLength;

      if (time > 1) {
        // Finish animations
        this.animating = false;
        this.view.setMorphTargetInfluences(this.endMorphTargets);
        this.currentMorphTargets = this.endMorphTargets.slice(0);
      } else {
        for (var i = 0; i < this.endMorphTargets.length; ++i) {
          this.currentMorphTargets[i] =
              this.startMorphTargets[i] * (1.0 - time) +
              this.endMorphTargets[i] * time;
        }
        this.view.setMorphTargetInfluences(this.currentMorphTargets);
      }
    }
  }

});


/**
 * Animates the geometry from one heightmap to another.
 *
 * @param {number} index Heightmap index from 1-4.
 * @param {number} seconds Animation duration.
 *
 * @return {Image3D}
 */
Image3D.prototype.morph = function(index, seconds) {
  var morphTargetInfluences = [0, 0, 0];
  if (index > 0)
    morphTargetInfluences[index - 2] = 1;

  if (seconds > 0) {
    // Animate over time
    this.startMorphTargets = this.currentMorphTargets.slice(0);
    this.endMorphTargets = morphTargetInfluences.slice(0);
    this.animationLength = seconds * 1000;
    this.startTime = new Date().getTime();
    this.animating = true;
  } else {
    // Animate immediately
    this.startMorphTargets = morphTargetInfluences.slice(0);
    this.endMorphTargets = morphTargetInfluences.slice(0);
    this.currentMorphTargets = morphTargetInfluences.slice(0);
    this.view.setMorphTargetInfluences(morphTargetInfluences);
    this.animating = false;
  }

  return this;
};


/**
 * Enumeration for the different ways of building the geometry.
 *
 * @enum {number}
 */
Image3D.GeometryStyle = {
  Smooth: 1,
  Block: 2,
  Float: 3
};


/**
 * Enumeration for the lighting style.
 *
 * @enum {number}
 */
Image3D.LightingStyle = {
  Vertex: 1,
  Face: 2,
  None: 3
};
