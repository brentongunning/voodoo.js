// ----------------------------------------------------------------------------
// File: Mesh.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that loads a mesh from a file.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var MeshView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.loaded = false;
    this.pendingAnimation = null;

    if (this.model.format === Mesh.Format.JSON)
      this.loadJson();
  },

  loadJson: function() {
    var self = this;
    var loader = new THREE.JSONLoader();
    loader.load(this.model.mesh, function(geometry, materials) {
      var mesh;

      for (var i = 0; i < materials.length; ++i) {
        var material = materials[i];
        if (material && typeof material.map !== 'undefined' &&
            material.map !== null)
          materials.map.flipY = false;
      }

      if (self.model.animated) {
        var material = materials[0];
        material.morphTargets = true;
        material.map.flipY = false;
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.MorphAnimMesh(geometry, faceMaterial);
      } else {
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.Mesh(geometry, faceMaterial);
      }

      self.mesh = mesh;
      self.scene.add(mesh);
      self.triggers.add(mesh);
      self.scene.attach(self.model.element, self.model.center,
          self.model.pixelScale);
      self.loaded = true;
    });
  },

  playAnimation: function(animation) {
    if (!this.loaded) {
      this.pendingAnimation = animation;
      return;
    }

    this.mesh.time = 0;
    this.mesh.duration = animation.duration;

    if (animation.forward)
      this.mesh.setDirectionForward();
    else this.mesh.setDirectionBackward();

    this.mesh.setFrameRange(animation.start, animation.end);
  },

  updateAnimation: function(deltaTimeMs) {
    if (!this.loaded)
      return;

    if (this.pendingAnimation !== null) {
      this.playAnimation(this.pendingAnimation);
      this.pendingAnimation = null;
    }

    this.mesh.updateAnimation(deltaTimeMs);
    this.dirty();
  },

  getLastTime: function() {
    return this.loaded ? this.mesh.time : 0;
  },

  setToLastFrame: function() {
    this.mesh.time = 1;
    this.mesh.updateAnimation(0);
    this.dirty();
  }

});



/**
 * A 3D mesh loaded from a file.
 *
 * Options:
 *
 * - element {HTMLElement} HTML element to attach to.
 * - mesh {string}  3D mesh file to load.
 * - format {Mesh.Format} Mesh file format. Default is JSON.
 * - animated {boolean} Whether the mesh supports animations. Default is true.
 * - center {boolean} Whether to center the mesh in the element. Default is
 *     true.
 * - pixelScale {boolean} Whether the unit's scale is pixels or units that
 *     scale with the element. Default is true.
 *
 * Events:
 *
 * - play
 * - stop
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Mesh = this.Mesh = voodoo.Model.extend({

  name: 'Mesh',
  organization: 'spellbook',
  viewType: MeshView_,

  initialize: function(options) {
    this.base.initialize(options);

    this.element = options.element;
    if (typeof options.element === 'undefined')
      throw '[Mesh] element must be defined';

    this.mesh = options.mesh;
    if (typeof options.mesh === 'undefined')
      throw '[Mesh] mesh must be defined';
    this.format = typeof options.format !== 'undefined' ?
        options.format : Mesh.Format.JSON;

    this.animated = typeof options.animated !== 'undefined' ?
        options.animated : true;
    this.center = typeof options.center !== 'undefined' ?
        options.center : true;
    this.pixelScale = typeof options.pixelScale !== 'undefined' ?
        options.pixelScale : true;

    this.animations = {};
    this.playing_ = false;
    this.looping_ = false;

    Object.defineProperty(this, 'looping', {
      get: function() { return this.looping_; },
      writeable: false
    });

    Object.defineProperty(this, 'playing', {
      get: function() { return this.playing_; },
      set: function(playing) {
        if (playing)
          throw 'Cannot set playing to true. Call play()';
        else this.stop();
      },
      writeable: false
    });
  },

  update: function(deltaTime) {
    if (this.playing_) {
      var deltaTimeMs = deltaTime * 1000;
      this.view.updateAnimation(deltaTimeMs);
      if (typeof this.stencilView !== 'undefined' && this.stencilView)
        this.stencilView.updateAnimation(deltaTimeMs);

      if (!this.looping_) {
        var lastTime = this.view.getLastTime();
        if (lastTime < this.lastTime) {
          this.view.setToLastFrame();
          if (typeof this.stencilView !== 'undefined' && this.stencilView)
            this.stencilView.setToLastFrame();
          this.stop();
        } else this.lastTime = lastTime;
      }
    }
  }

});


/**
 * Defines an animation.
 *
 * @param {string} name Name of the animation.
 * @param {number} start Start frame.
 * @param {number} end End frame.
 * @param {number} seconds Duration in seconds.
 * @param {boolean=} opt_loop Whether to loop the animation. Default is true.
 * @param {boolean=} opt_forward Whether to play forward, or backward. Default
 *     is true.
 *
 * @return {Mesh}
 */
Mesh.prototype.setAnimation = function(name, start, end, seconds, opt_loop,
    opt_forward) {
  this.animations[name] = {
    start: start,
    end: end,
    duration: seconds * 1000,
    loop: typeof opt_loop !== 'undefined' ? opt_loop : true,
    forward: typeof opt_forward === 'undefined' ? true : opt_forward
  };

  return this;
};


/**
 * Plays or resumes an animation.
 *
 * @param {string} name Name of the animation.
 *
 * @return {Mesh}
 */
Mesh.prototype.play = function(name) {
  var animation = this.animations[name];

  this.view.playAnimation(animation);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.playAnimation(animation);

  if (!this.playing_)
    this.dispatch(new voodoo.Event('play', this));

  this.playing_ = true;
  this.looping_ = animation.loop;
  this.lastTime = 0;

  return this;
};


/**
 * Pauses an animation.
 *
 * @return {Mesh}
 */
Mesh.prototype.stop = function() {
  this.dispatch(new voodoo.Event('stop', this));
  this.playing_ = false;
  return this;
};


/**
 * Gets whether the mesh animation is looping.
 *
 * @type {boolean}
 */
Mesh.prototype.looping = false;


/**
 * Gets or sets whether the mesh is playing an animation.
 *
 * @type {boolean}
 */
Mesh.prototype.playing = false;


/**
 * Enumeration for the file format.
 *
 * @enum {number}
 */
Mesh.Format = {
  JSON: 1
};
