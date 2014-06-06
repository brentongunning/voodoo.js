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

    this.scene.attach(this.model.element_, false, false);

    this.loaded = false;
  },

  createMaterial_: function() {
    return new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      ambient: 0x000000,
      map: this.texture_,
      transparent: this.model.transparent_,
      morphTargets: true,
      morphNormals: true
    });
  },

  computeNormals_: function(geometry) {
    log_.assert_(geometry, 'geometry must be valid.',
        '(Image3DView_::computeNormals_)');

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeMorphNormals();
  },

  getDepth_: function(data, i) {
    log_.assert_(data, 'data must be valid.', '(Image3DView_::getDepth_)');

    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    var avg = (r + g + b) / 3.0;
    return avg / 255.0 * this.model.maxHeight_;
  },

  createSmoothGeometry_: function(geometry, vertices, data, createFaces) {
    log_.assert_(geometry, 'geometry must be valid.',
        '(Image3DView_::createSmoothGeometry_)');
    log_.assert_(vertices, 'vertices must be valid.',
        '(Image3DView_::createSmoothGeometry_)');
    log_.assert_(data, 'data must be valid.',
        '(Image3DView_::createSmoothGeometry_)');

    // Constants
    var width = this.model.heightmapWidth_;
    var height = this.model.heightmapHeight_;
    var invWidthMinusOne = 1.0 / (width - 1);
    var invHeightMinusOne = 1.0 / (height - 1);
    var stride = width * 4;

    var THREEVector3 = THREE.Vector3;
    var THREEFace3 = THREE.Face3;
    var THREEVector2 = THREE.Vector2;

    // Vertices
    var i = 0;
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var depth = this.getDepth_(data, i);
        vertices.push(new THREEVector3(
            x * invWidthMinusOne,
            y * invHeightMinusOne,
            depth));
        i += 4;
      }
    }

    var geometryFaces = geometry.faces;
    var geometryFaceVertexUvs = geometry.faceVertexUvs[0];

    // Indices
    if (createFaces) {
      var yi = 0, yi2 = width;
      for (var y = 0; y < height - 1; ++y) {
        for (var x = 0; x < width - 1; ++x) {
          var x2 = x + 1;
          geometryFaces.push(new THREEFace3(yi + x, yi + x2, yi2 + x2));
          geometryFaces.push(new THREEFace3(yi + x, yi2 + x2, yi2 + x));

          var u1 = x * invWidthMinusOne;
          var u2 = x2 * invWidthMinusOne;
          var v1 = y * invHeightMinusOne;
          var v2 = (y + 1) * invHeightMinusOne;

          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v1),
            new THREEVector2(u2, v2)
          ]);
          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v2),
            new THREEVector2(u1, v2)
          ]);
        }
        yi += width;
        yi2 += width;
      }
    }
  },

  createBlockGeometry_: function(geometry, vertices, data, createFaces) {
    log_.assert_(geometry, 'geometry must be valid.',
        '(Image3DView_::createBlockGeometry_)');
    log_.assert_(vertices, 'vertices must be valid.',
        '(Image3DView_::createBlockGeometry_)');
    log_.assert_(data, 'data must be valid.',
        '(Image3DView_::createBlockGeometry_)');

    // Constants
    var width = this.model.heightmapWidth_;
    var height = this.model.heightmapHeight_;
    var invWidth = 1.0 / width;
    var invHeight = 1.0 / height;
    var textureImage = this.texture_.image;
    var textureImageWidth = textureImage.width;
    var textureImageHeight = textureImage.height;
    var widthRatio = textureImageWidth / width;
    var heightRatio = textureImageHeight / height;
    var invTextureWidth = 1.0 / textureImageWidth;
    var invTextureHeight = 1.0 / textureImageHeight;

    // Precalculate depth
    var depths = new Array(height);
    var i = 0;
    for (var y = 0; y < height; ++y) {
      var line = new Array(width);
      for (var x = 0; x < width; ++x) {
        line[x] = this.getDepth_(data, i);
        i += 4;
      }
      depths[y] = line;
    }

    var geometryFaces = geometry.faces;
    var geometryFaceVertexUvs = geometry.faceVertexUvs[0];

    var THREEVector3 = THREE.Vector3;
    var THREEFace3 = THREE.Face3;
    var THREEVector2 = THREE.Vector2;

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

        // Front

        var j = v;
        vertices.push(new THREEVector3(x1, y1, depth));
        vertices.push(new THREEVector3(x2, y1, depth));
        vertices.push(new THREEVector3(x2, y2, depth));
        vertices.push(new THREEVector3(x1, y2, depth));

        if (createFaces) {
          v += 4;

          geometryFaces.push(new THREEFace3(j, j + 1, j + 2));
          geometryFaces.push(new THREEFace3(j, j + 2, j + 3));
          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v1),
            new THREEVector2(u2, v2)
          ]);
          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v2),
            new THREEVector2(u1, v2)
          ]);
        }

        // Left

        if (depth > depthLeft) {
          vertices.push(new THREEVector3(x1, y1, depthLeft));
          vertices.push(new THREEVector3(x1, y2, depthLeft));

          if (createFaces) {
            geometryFaces.push(new THREEFace3(j, j + 3, v + 1));
            geometryFaces.push(new THREEFace3(j, v + 1, v));
            geometryFaceVertexUvs.push([
              new THREEVector2(u1, v1),
              new THREEVector2(u1, v2),
              new THREEVector2(u1, v2)
            ]);
            geometryFaceVertexUvs.push([
              new THREEVector2(u1, v1),
              new THREEVector2(u1, v2),
              new THREEVector2(u1, v1)
            ]);

            v += 2;
          }
        }

        // Right

        if (depth > depthRight) {
          vertices.push(new THREEVector3(x2, y1, depthRight));
          vertices.push(new THREEVector3(x2, y2, depthRight));

          if (createFaces) {
            geometryFaces.push(new THREEFace3(j + 2, j + 1, v + 0));
            geometryFaces.push(new THREEFace3(j + 2, v + 0, v + 1));
            geometryFaceVertexUvs.push([
              new THREEVector2(u2, v2),
              new THREEVector2(u2, v1),
              new THREEVector2(u2, v1)
            ]);
            geometryFaceVertexUvs.push([
              new THREEVector2(u2, v2),
              new THREEVector2(u2, v1),
              new THREEVector2(u2, v2)
            ]);

            v += 2;
          }
        }

        // Top

        if (depth > depthTop) {
          vertices.push(new THREEVector3(x1, y1, depthTop));
          vertices.push(new THREEVector3(x2, y1, depthTop));

          if (createFaces) {
            geometryFaces.push(new THREEFace3(j + 1, j, v));
            geometryFaces.push(new THREEFace3(j + 1, v, v + 1));
            geometryFaceVertexUvs.push([
              new THREEVector2(u2, v1),
              new THREEVector2(u1, v1),
              new THREEVector2(u1, v1)
            ]);
            geometryFaceVertexUvs.push([
              new THREEVector2(u2, v1),
              new THREEVector2(u1, v1),
              new THREEVector2(u2, v1)
            ]);

            v += 2;
          }
        }

        // Bottom

        if (depth > depthBottom) {
          vertices.push(new THREEVector3(x1, y2, depthBottom));
          vertices.push(new THREEVector3(x2, y2, depthBottom));

          if (createFaces) {
            geometryFaces.push(new THREEFace3(j + 3, j + 2, v + 1));
            geometryFaces.push(new THREEFace3(j + 3, v + 1, v));
            geometryFaceVertexUvs.push([
              new THREEVector2(u1, v2),
              new THREEVector2(u2, v2),
              new THREEVector2(u2, v2)
            ]);
            geometryFaceVertexUvs.push([
              new THREEVector2(u1, v2),
              new THREEVector2(u2, v2),
              new THREEVector2(u1, v2)
            ]);

            v += 2;
          }
        }
      }
    }
  },

  createFloatGeometry_: function(geometry, vertices, data, createFaces) {
    log_.assert_(geometry, 'geometry must be valid.',
        '(Image3DView_::createFloatGeometry_)');
    log_.assert_(vertices, 'vertices must be valid.',
        '(Image3DView_::createFloatGeometry_)');
    log_.assert_(data, 'data must be valid.',
        '(Image3DView_::createFloatGeometry_)');

    // Constants
    var width = this.model.heightmapWidth_;
    var height = this.model.heightmapHeight_;
    var invWidth = 1.0 / width;
    var invHeight = 1.0 / height;
    var textureImage = this.texture_.image;
    var textureImageWidth = textureImage.width;
    var textureImageHeight = textureImage.height;
    var widthRatio = textureImageWidth / width;
    var heightRatio = textureImageHeight / height;
    var invTextureWidth = 1.0 / textureImageWidth;
    var invTextureHeight = 1.0 / textureImageHeight;

    var THREEVector3 = THREE.Vector3;
    var THREEFace3 = THREE.Face3;
    var THREEVector2 = THREE.Vector2;

    var i = 0;
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var depth = this.getDepth_(data, i);

        var x1 = x * invWidth;
        var x2 = (x + 1) * invWidth;
        var y1 = y * invHeight;
        var y2 = (y + 1) * invHeight;

        vertices.push(new THREEVector3(x1, y1, depth));
        vertices.push(new THREEVector3(x2, y1, depth));
        vertices.push(new THREEVector3(x2, y2, depth));
        vertices.push(new THREEVector3(x1, y2, depth));

        i += 4;
      }
    }

    var geometryFaces = geometry.faces;
    var geometryFaceVertexUvs = geometry.faceVertexUvs[0];

    if (createFaces) {
      i = 0;
      for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
          var xr = x * widthRatio;
          var yr = y * heightRatio;
          var u1 = (xr + 0.5) * invTextureWidth;
          var u2 = (xr + widthRatio - 0.5) * invTextureWidth;
          var v1 = (yr + 0.5) * invTextureHeight;
          var v2 = (yr + heightRatio - 0.5) * invTextureHeight;

          geometryFaces.push(new THREEFace3(i, i + 1, i + 2));
          geometryFaces.push(new THREEFace3(i, i + 2, i + 3));

          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v1),
            new THREEVector2(u2, v2)
          ]);
          geometryFaceVertexUvs.push([
            new THREEVector2(u1, v1),
            new THREEVector2(u2, v2),
            new THREEVector2(u1, v2)
          ]);

          i += 4;
        }
      }
    }
  },

  createHeightmapGeometry_: function(data, geometry, vertices, createFaces) {
    log_.assert_(geometry, 'geometry must be valid.',
        '(Image3DView_::createHeightmapGeometry_)');
    log_.assert_(vertices, 'vertices must be valid.',
        '(Image3DView_::createHeightmapGeometry_)');
    log_.assert_(data, 'data must be valid.',
        '(Image3DView_::createHeightmapGeometry_)');

    switch (this.model.geometryStyle_) {
      case Image3D.GeometryStyle.Smooth:
        this.createSmoothGeometry_(geometry, vertices, data, createFaces);
        break;
      case Image3D.GeometryStyle.Block:
        this.createBlockGeometry_(geometry, vertices, data, createFaces);
        break;
      case Image3D.GeometryStyle.Float:
        this.createFloatGeometry_(geometry, vertices, data, createFaces);
        break;
    }
  },

  createGeometry_: function() {
    var geometry = new THREE.Geometry();

    var modelHeightmaps = this.model.heightmaps_;
    var modelHeightmapData = this.model.heightmapData_;

    var numValidHeightmaps = 0;
    for (var i = 0; i < 4; ++i) {
      if (modelHeightmaps[i])
        ++numValidHeightmaps;
    }

    this.createHeightmapGeometry_(modelHeightmapData[0],
        geometry, geometry.vertices, true);

    // Make sure there are no morph targets for block geometry
    log_.assert_(numValidHeightmaps <= 1 ||
        this.model.geometryStyle_ !== Image3D.GeometryStyle.Block,
        'Block geometry does not support multiple heightmaps.',
        '(Image3DView_::createGeometry)');

    for (var i = 0; i < 4; ++i) {
      var morphTarget = {
        name: 'target' + i.toString(),
        vertices: []
      };

      if (!modelHeightmaps[i] || i === 0) {
        morphTarget.vertices = geometry.vertices;
      } else {
        this.createHeightmapGeometry_(modelHeightmapData[i], geometry,
            morphTarget.vertices, false);
      }

      geometry.morphTargets.push(morphTarget);
    }

    this.computeNormals_(geometry);

    return geometry;
  },

  createMesh_: function() {
    if (!this.texture_)
      return;

    var geometry = this.createGeometry_();
    var material = this.createMaterial_();
    this.mesh_ = new THREE.Mesh(geometry, material);

    this.mesh_.morphTargetInfluences = this.model.currentMorphTargets_;

    this.scene.add(this.mesh_);
    this.triggers.add(this.mesh_);

    this.loaded = true;
  },

  destroyMesh_: function() {
    this.scene.remove(this.mesh_);
    this.triggers.remove(this.mesh_);
  },

  setMorphTargetInfluences_: function(influences) {
    if (this.mesh_) {
      this.mesh_.morphTargetInfluences = influences;
      this.dirty();
    }
  },

  setImage_: function(image, imageSrc) {
    log_.assert_(image, 'image must be valid.', '(Image3DView_::setImage_)');
    log_.assert_(imageSrc, 'imageSrc must be valid.',
        '(Image3DView_::setImage_)');

    if (!this.texture_) {
      this.texture_ = new THREE.Texture(undefined);

      this.texture_.flipY = false;
      this.texture_.miFilter = THREE.NearestFilter;
      this.texture_.magFilter = THREE.NearestFilter;
    }

    this.texture_.needsUpdate = true;
    this.texture_.image = image;
    this.texture_.sourceFile = imageSrc;

    this.rebuildGeometry_();
  },

  rebuildGeometry_: function() {
    if (this.mesh_)
      this.destroyMesh_();

    this.createMesh_();
  },

  setTransparent_: function(transparent) {
    if (this.mesh_)
      this.mesh_.material.transparent = transparent;
  }

});



/**
 * A image shown in 3D using heightmaps.
 *
 * Options:
 *
 * - element {HTMLElement} HTML element to attach to.
 * - imageSrc {string=} Optional image source.
 * - heightmap {string} Initial heightmap image path.
 * - heightmap2 {string=} Optional second heightmap path.
 * - heightmap3 {string=} Optional third heightmap path.
 * - heightmap4 {string=} Optional fourth heightmap path.
 * - maxHeight {number=} Optional maximum depth of the heightmap.
 *     Default is 200.
 * - geometryStyle {(Image3D.GeometryStyle|string)=} Optional geometry style.
 *     Default is smooth.
 * - transparent {boolean=} Whether to allow in-between transparency.
 *     Default is true.
 *
 * Events:
 *
 * - morphBegin
 * - morphEnd
 * - changeImageSrc
 * - chamgeHeightmap
 * - changeHeightmap2
 * - changeHeightmap3
 * - changeHeightmap4
 * - changeGeometryStyle
 * - changeMaxHeight
 * - changeTransparent
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

    this.element_ = options.element;
    log_.assert_(options.element, 'element must be valid.',
        '(Image3D::initalize)');

    this.imageSrc_ = options.imageSrc ?
        getAbsoluteUrl_(options.imageSrc) :
        getAbsoluteUrl_(options.element.src);

    this.heightSources_ = [
      options.heightmap ? getAbsoluteUrl_(options.heightmap) : '',
      options.heightmap2 ? getAbsoluteUrl_(options.heightmap2) : '',
      options.heightmap3 ? getAbsoluteUrl_(options.heightmap3) : '',
      options.heightmap4 ? getAbsoluteUrl_(options.heightmap4) : ''
    ];

    log_.assert_(options.heightmap, 'heightmap must be valid.',
        '(Image3D::initalize)');

    if (typeof options.maxHeight !== 'undefined') {
      log_.assert_(typeof options.maxHeight === 'number',
          'maxHeight must be a number.', options.maxHeight,
          '(Image3D::initalize)');

      log_.assert_(options.maxHeight >= 0, 'maxHeight must be >= 0.',
          options.maxHeight, '(Image3D::initalize)');

      this.maxHeight_ = options.maxHeight;
    } else {
      this.maxHeight_ = 200;
    }

    this.geometryStyle_ = options.geometryStyle ||
        Image3D.GeometryStyle.Smooth;

    if (typeof options.transparent !== 'undefined') {
      log_.assert_(typeof options.transparent === 'boolean',
          'transparent must be a boolean.', options.transparent,
          '(Image3D::initalize)');

      this.transparent_ = options.transparent;
    } else {
      this.transparent_ = true;
    }

    this.morphing_ = false;
    this.morphStartTime_ = 0;
    this.morphDuration_ = 0;
    this.morphElapsed_ = 0;
    this.startMorphTargets_ = [1, 0, 0, 0];
    this.currentMorphTargets_ = [1, 0, 0, 0];
    this.endMorphTargets_ = [1, 0, 0, 0];

    this.createPublicProperties_();
  },

  setUpViews: function() {
    this.base.setUpViews();

    var that = this;
    this.loadHeightmaps_(function() {
      var src = that.imageSrc_;
      that.imageSrc_ = null;
      that.setImageSrc(src);
    });
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (!this.loaded)
      return;

    if (this.element_.tagName.toLowerCase() === 'img' &&
        this.element_.src !== this.imageSrc_)
      this.setImageSrc(this.element_.src);

    if (this.morphing_) {
      var now = new Date();
      var duration = now - this.morphStartTime_;
      var time = duration / this.morphDuration_;

      if (time > 1) {
        // Finish animations
        this.morphing_ = false;
        this.morphDuration_ = 0;
        this.morphElapsed_ = 0;

        this.view.setMorphTargetInfluences_(this.endMorphTargets_);
        if (this.stencilView)
          this.stencilView.setMorphTargetInfluences_(this.endMorphTargets_);

        this.currentMorphTargets_ = this.endMorphTargets_.slice(0);
        this.startMorphTargets_ = this.currentMorphTargets_.slice(0);

        this.dispatch(new voodoo.Event('morphEnd', this));
      } else {
        var invTime = 1.0 - time;
        for (var i = 0, len = this.endMorphTargets_.length; i < len; ++i) {
          this.currentMorphTargets_[i] =
              this.startMorphTargets_[i] * invTime +
              this.endMorphTargets_[i] * time;
        }
        this.view.setMorphTargetInfluences_(this.currentMorphTargets_);
        if (this.stencilView)
          this.stencilView.setMorphTargetInfluences_(this.currentMorphTargets_);
      }
    }
  },

  createPublicProperties_: function() {
    var that = this;

    Object.defineProperty(this, 'geometryStyle', {
      get: function() { return that.geometryStyle_; },
      set: function(geometryStyle) { that.setGeometryStyle(geometryStyle); },
      enumerable: true
    });

    Object.defineProperty(this, 'heightmap', {
      get: function() { return that.heightSources_[0]; },
      set: function(heightmap) { that.setHeightmap(heightmap, 1); },
      enumerable: true
    });

    Object.defineProperty(this, 'heightmap2', {
      get: function() { return that.heightSources_[1]; },
      set: function(heightmap) { that.setHeightmap(heightmap, 2); },
      enumerable: true
    });

    Object.defineProperty(this, 'heightmap3', {
      get: function() { return that.heightSources_[2]; },
      set: function(heightmap) { that.setHeightmap(heightmap, 3); },
      enumerable: true
    });

    Object.defineProperty(this, 'heightmap4', {
      get: function() { return that.heightSources_[3]; },
      set: function(heightmap) { that.setHeightmap(heightmap, 4); },
      enumerable: true
    });

    Object.defineProperty(this, 'imageSrc', {
      get: function() { return that.imageSrc_; },
      set: function(imageSrc) { that.setImageSrc(imageSrc); },
      enumerable: true
    });

    Object.defineProperty(this, 'maxHeight', {
      get: function() { return that.maxHeight_; },
      set: function(maxHeight) { that.setMaxHeight(maxHeight); },
      enumerable: true
    });
    Object.defineProperty(this, 'morphing', {
      get: function() { return that.morphing_; },
      set: function(morphing) { that.setMorphing(morphing); },
      enumerable: true
    });

    Object.defineProperty(this, 'transparent', {
      get: function() { return that.transparent_; },
      set: function(transparent) { that.setTransparent(transparent); },
      enumerable: true
    });
  },

  loadHeightmap_: function(heightmapSrc, index, callback) {
    if (!heightmapSrc)
      return;

    function onLoad(index) {
      var heightmap = this.heightmaps_[index];
      var heightmapWidth = heightmap.width;
      var heightmapHeight = heightmap.height;

      var canvas = document.createElement('canvas');
      canvas.width = heightmapWidth;
      canvas.height = heightmapHeight;

      var context = canvas.getContext('2d');
      context.drawImage(heightmap, 0, 0, heightmapWidth, heightmapHeight);
      this.heightmapData_[index] = context.getImageData(0, 0,
          heightmapWidth, heightmapHeight).data;

      callback();
    }

    var heightmap = new Image();
    heightmap.onload = onLoad.bind(this, index);
    this.heightmaps_[index] = heightmap;
    heightmap.src = heightmapSrc;
  },

  loadHeightmaps_: function(callback) {
    log_.assert_(callback, 'callback must be valid.',
        '(Image3D::loadHeightmaps_)');
    log_.assert_(typeof callback === 'function',
        'callback must be a function.', '(Image3D::loadHeightmaps_)');

    this.heightmapWidth_ = 0;
    this.heightmapHeight_ = 0;

    var numLoaded = 0;
    var numToLoad = 0;
    function onLoad(index) {
      var heightmap = this.heightmaps_[index];

      // Ensure all heightmaps are the same size
      if (numLoaded === 0) {
        this.heightmapWidth_ = heightmap.width;
        this.heightmapHeight_ = heightmap.height;
      } else {
        log_.assert_(
            this.heightmapWidth_ === heightmap.width &&
            this.heightmapHeight_ === heightmap.height,
            'All heightmaps must be the same size.',
            '(Image3D::loadHeightmaps_)');
      }

      numLoaded++;
      if (numLoaded === numToLoad)
        callback();
    }

    this.heightmaps_ = [];
    this.heightmapData_ = [];
    for (var i = 0; i < 4; ++i) {
      if (this.heightSources_[i] !== '')
        numToLoad++;
    }
    for (var i = 0; i < 4; ++i)
      this.loadHeightmap_(this.heightSources_[i], i, onLoad.bind(this, i));
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
  log_.assert_(typeof index === 'number', 'index must be a number.',
      index, '(Image3D::morph)');
  log_.assert_(typeof seconds === 'number', 'seconds must be a number.',
      seconds, '(Image3D::morph)');
  log_.assert_(index >= 0 && index < 4, 'index must be between 0 and 4.',
      index, '(Image3D::morph)');

  var morphTargetInfluences = [0, 0, 0, 0];
  morphTargetInfluences[index - 1] = 1;

  if (seconds > 0) {
    // Animate over time
    this.startMorphTargets_ = this.currentMorphTargets_.slice(0);
    this.endMorphTargets_ = morphTargetInfluences.slice(0);
    this.morphDuration_ = seconds * 1000;
    this.morphStartTime_ = new Date();
    this.morphElapsed_ = 0;
    this.morphing_ = true;

    this.dispatch(new voodoo.Event('morphBegin', this));
  } else {
    // Animate immediately
    this.startMorphTargets_ = morphTargetInfluences.slice(0);
    this.endMorphTargets_ = morphTargetInfluences.slice(0);
    this.currentMorphTargets_ = morphTargetInfluences.slice(0);

    this.morphing_ = false;
    this.morphDuration_ = 0;
    this.morphElapsed_ = 0;

    this.view.setMorphTargetInfluences_(morphTargetInfluences);
    if (this.stencilView)
      this.stencilView.setMorphTargetInfluences_(morphTargetInfluences);
  }

  return this;
};


/**
 * Sets the geometry style.
 *
 * @param {Image3D.GeometryStyle|string} geometryStyle Geometry style.
 *
 * @return {Image3D}
 */
Image3D.prototype.setGeometryStyle = function(geometryStyle) {
  log_.assert_(typeof geometryStyle === 'string',
      'geometryStyle must be a string.', geometryStyle,
      '(Image3D::setGeometryStyle)');

  log_.assert_(geometryStyle === 'smooth' ||
      geometryStyle === 'block' ||
      geometryStyle === 'float',
      'geometryStyle must be valid.', geometryStyle,
      '(Image3D::setGeometryStyle)');

  if (this.geometryStyle_ !== geometryStyle) {
    this.geometryStyle_ = geometryStyle;

    this.dispatch(new voodoo.Event('changeGeometryStyle', this));

    this.view.rebuildGeometry_();
    if (this.stencilView)
      this.stencilView.rebuildGeometry_();
  }

  return this;
};


/**
 * Sets a heightmap.
 *
 * @param {string} heightmap Heightmap filename.
 * @param {number=} opt_index Heightmap number. Default is 1, the main
 *   heightmap.
 *
 * @return {Image3D}
 */
Image3D.prototype.setHeightmap = function(heightmap, opt_index) {
  log_.assert_(heightmap, 'heightmap must be valid.',
      '(Image3D::setHeightmap)');

  heightmap = getAbsoluteUrl_(heightmap);

  var index = typeof opt_index === 'undefined' ? 0 : opt_index - 1;

  if (this.heightSources_[index] === heightmap)
    return this;

  this.heightSources_[index] = heightmap;

  if (index === 0)
    this.dispatch(new voodoo.Event('changeHeightmap', this));
  else
    this.dispatch(new voodoo.Event('changeHeightmap' + (index + 1), this));

  /** @type {?} */
  var that = this;

  that.loadHeightmap_(heightmap, index, function() {
    that.view.rebuildGeometry_();
    if (that.stencilView)
      that.stencilView.rebuildGeometry_();
  });

  return this;
};


/**
 * Sets the texture.
 *
 * @param {string} imageSrc Texture filename.
 *
 * @return {Image3D}
 */
Image3D.prototype.setImageSrc = function(imageSrc) {
  log_.assert_(imageSrc, 'imageSrc must be valid.',
      '(Image3D::setImageSrc)');

  imageSrc = getAbsoluteUrl_(imageSrc);

  if (this.imageSrc_ === imageSrc)
    return this;

  var initialized = this.imageSrc_ !== null;
  this.imageSrc_ = imageSrc;

  if (this.element_.tagName.toLowerCase() === 'img')
    this.element_.src = imageSrc;

  if (initialized)
    this.dispatch(new voodoo.Event('changeImageSrc', this));

  function onLoad(index) {
    this.view.setImage_(this.image_, this.imageSrc_);
    if (this.stencilView)
      this.stencilView.setImage_(this.image_, this.imageSrc_);
  }

  this.image_ = new Image();
  this.image_.onload = onLoad.bind(this);
  this.image_.src = imageSrc;

  return this;
};


/**
 * Sets the maximum height of the image.
 *
 * @param {number} maxHeight Maximum Z height.
 *
 * @return {Image3D}
 */
Image3D.prototype.setMaxHeight = function(maxHeight) {
  log_.assert_(typeof maxHeight === 'number', 'maxHeight must be a number.',
      maxHeight, '(Image3D::setMaxHeight)');
  log_.assert_(maxHeight >= 0, 'maxHeight must be >= 0.', maxHeight,
      '(Image3D::setMaxHeight)');

  if (this.maxHeight_ !== maxHeight) {
    this.maxHeight_ = maxHeight;

    this.dispatch(new voodoo.Event('changeMaxHeight', this));

    this.view.rebuildGeometry_();
    if (this.stencilView)
      this.stencilView.rebuildGeometry_();
  }

  return this;
};


/**
 * Sets whether we are currently morphing. This may be used to pause and
 * resume animations.
 *
 * @param {boolean} morphing Whether to enable or disable morphing.
 *
 * @return {Image3D}
 */
Image3D.prototype.setMorphing = function(morphing) {
  log_.assert_(typeof morphing === 'boolean',
      'morphing must be a boolean.', morphing,
      '(Image3D::setMorphing)');

  if (!morphing && this.morphing_) {

    this.morphing_ = false;
    this.morphElapsed_ = new Date() - this.morphStartTime_;

  } else if (morphing && !this.morphing_) {

    this.morphing_ = true;
    this.morphStartTime_ = new Date() - this.morphElapsed_;

  }

  return this;
};


/**
 * Sets whether the texture may be transparent.
 *
 * @param {boolean} transparent Enable transparency.
 *
 * @return {Image3D}
 */
Image3D.prototype.setTransparent = function(transparent) {
  if (this.transparent_ !== transparent) {
    log_.assert_(typeof transparent === 'boolean',
        'transparent must be a boolean.', transparent,
        '(Image3D::setTransparent)');

    this.transparent_ = transparent;

    this.dispatch(new voodoo.Event('changeTransparent', this));

    this.view.setTransparent_(transparent);
    if (this.stencilView)
      this.stencilView.setTransparent_(transparent);
  }

  return this;
};


/**
 * Enumeration for the different ways of building the geometry.
 *
 * @enum {string}
 */
Image3D.GeometryStyle = {
  Smooth: 'smooth',
  Block: 'block',
  Float: 'float'
};


/**
 * Gets or sets the geometry style. Default is smooth.
 *
 * @type {Image3D.GeometryStyle|string}
 */
Image3D.prototype.geometryStyle = Image3D.GeometryStyle.Smooth;


/**
 * Gets or sets the source file for the primary heightmap.
 *
 * @type {string}
 */
Image3D.prototype.heightmap = '';


/**
 * Gets or sets the source file for the second heightmap.
 *
 * @type {string}
 */
Image3D.prototype.heightmap2 = '';


/**
 * Gets or sets the source file for the third heightmap.
 *
 * @type {string}
 */
Image3D.prototype.heightmap3 = '';


/**
 * Gets or sets the source file for the fourth heightmap.
 *
 * @type {string}
 */
Image3D.prototype.heightmap4 = '';


/**
 * Gets or sets the source file for the texture.
 *
 * @type {string}
 */
Image3D.prototype.imageSrc = '';


/**
 * Gets or sets the maximum z-height. Default is 200.
 *
 * @type {number}
 */
Image3D.prototype.maxHeight = 200;


/**
 * Gets or sets whether we are currently morphing between heightmaps.
 *
 * @type {boolean}
 */
Image3D.prototype.morphing = false;


/**
 * Gets or sets whether the texture may be transparent. Default is true.
 *
 * @type {boolean}
 */
Image3D.prototype.transparent = true;
