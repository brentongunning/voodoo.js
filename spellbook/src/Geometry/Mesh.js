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
    this.pendingAnimation_ = null;

    if (this.model.format_ === Mesh.Format.JSON)
      this.loadJson_();
  },

  loadJson_: function() {
    var that = this;
    var loader = new THREE.JSONLoader();
    loader.load(this.model.mesh_, function(geometry, materials) {
      var mesh;

      for (var i = 0, len = i < materials.length; i < len; ++i) {
        var material = materials[i];
        if (material && material.map)
          materials.map.flipY = false;
      }

      if (that.model.animated_) {
        var material = materials[0];

        material.morphTargets = true;
        material.map.flipY = false;

        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.MorphAnimMesh(geometry, faceMaterial);
      } else {
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
        mesh = new THREE.Mesh(geometry, faceMaterial);
      }

      that.mesh_ = mesh;

      that.scene.add(mesh);
      that.triggers.add(mesh);

      that.loaded = true;
    });
  },

  playAnimation_: function(animation) {
    if (!this.loaded) {
      this.pendingAnimation_ = animation;
      return;
    }

    this.mesh_.time = 0;
    this.mesh_.duration = animation.duration;

    if (animation.forward)
      this.mesh_.setDirectionForward();
    else
      this.mesh_.setDirectionBackward();

    this.mesh_.setFrameRange(animation.start, animation.end);
  },

  updateAnimation_: function(deltaTimeMs) {
    if (!this.loaded)
      return;

    if (this.pendingAnimation_ !== null) {
      this.playAnimation_(this.pendingAnimation_);
      this.pendingAnimation_ = null;
    }

    if (this.mesh_.updateAnimation) {
      this.mesh_.updateAnimation(deltaTimeMs);
      this.dirty();
    }
  },

  getLastTime_: function() {
    return this.loaded ? this.mesh_.time : 0;
  },

  setToLastFrame_: function() {
    if (this.mesh_.updateAnimation) {
      this.mesh_.time = 1;
      this.mesh_.updateAnimation(0);
      this.dirty();
    }
  }

});



/**
 * A 3D mesh loaded from a file.
 *
 * Options:
 *
 * - mesh {string} 3D mesh file to load.
 * - format {Mesh.Format} Mesh file format. Default is JSON.
 * - animated {boolean} Whether the mesh supports animations. Default is true.
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
    options = options || {};

    this.base.initialize(options);

    log_.assert_(options.mesh, 'mesh must be valid.', options.mesh,
        '(Mesh::initialize)');
    log_.assert_(typeof options.mesh === 'string', 'mesh must be a string.',
        options.mesh, '(Mesh::initialize)');
    this.mesh_ = options.mesh;

    if (typeof options.format !== 'undefined') {
      log_.assert_(options.format === 'json', 'format must be valid.',
          options.format, '(Mesh::initialize)');

      this.format_ = options.format;
    } else {
      this.format_ = Mesh.Format.JSON;
    }

    if (typeof options.animated !== 'undefined') {
      log_.assert_(typeof options.animated === 'boolean',
          'animated must be a boolean.',
          options.animated, '(Mesh::initialize)');

      this.animated_ = options.animated;
    } else {
      this.animated_ = true;
    }

    this.animations_ = {};
    this.animation_ = '';
    this.playing_ = false;
    this.looping_ = false;

    var that = this;

    Object.defineProperty(this, 'animation', {
      get: function() { return that.animation_; },
      enumerable: true
    });

    Object.defineProperty(this, 'looping', {
      get: function() { return that.looping_; },
      enumerable: true
    });

    Object.defineProperty(this, 'playing', {
      get: function() { return that.playing_; },
      set: function(playing) {
        if (playing)
          that.play();
        else
          that.stop();
      },
      enumerable: true
    });
  },

  update: function(deltaTime) {
    if (this.playing_) {
      var deltaTimeMs = deltaTime * 1000;

      this.view.updateAnimation_(deltaTimeMs);
      if (this.stencilView)
        this.stencilView.updateAnimation_(deltaTimeMs);

      if (!this.looping_) {
        var lastTime = this.view.getLastTime_();

        if (lastTime < this.lastTime_) {
          this.view.setToLastFrame_();
          if (this.stencilView)
            this.stencilView.setToLastFrame_();

          this.stop();
        } else {
          this.lastTime_ = lastTime;
        }
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
  log_.assert_(name, 'name must be valid.', '(Mesh::setAnimation)');
  log_.assert_(typeof name === 'string', name, 'name must be a string.',
      '(Mesh::setAnimation)');
  log_.assert_(typeof start === 'number', 'start must be a number.',
      start, '(Mesh::setAnimation)');
  log_.assert_(start >= 0, 'start must be >= 0.', start,
      '(Mesh::setAnimation)');
  log_.assert_(typeof end === 'number', 'end must be a number.',
      end, '(Mesh::setAnimation)');
  log_.assert_(end >= 0, 'end must be >= 0.', end,
      '(Mesh::setAnimation)');
  log_.assert_(typeof seconds === 'number', 'seconds must be a number.',
      seconds, '(Mesh::setAnimation)');
  log_.assert_(seconds >= 0, 'seconds must be >= 0.', seconds,
      '(Mesh::setAnimation)');

  this.animations_[name] = {
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
 * @param {string=} opt_name Name of the animation. If this unspecified,
 *   then play() will animate the last animation played.
 *
 * @return {Mesh}
 */
Mesh.prototype.play = function(opt_name) {
  if (typeof opt_name === 'undefined') {
    log_.assert_(this.animation_ in this.animations_,
        'There is no last animation to play.', '(Mesh::play)');

    this.playing_ = true;

    return this;
  }

  log_.assert_(opt_name, 'name must be valid.', '(Mesh::setAnimation)');
  log_.assert_(opt_name in this.animations_, 'Animation does not exist.',
      opt_name, '(Mesh::setAnimation)');

  if (this.animation_ === opt_name) {
    this.playing_ = true;
    return this;
  }

  var animation = this.animations_[opt_name];
  this.animation_ = opt_name;

  this.view.playAnimation_(animation);
  if (this.stencilView)
    this.stencilView.playAnimation_(animation);

  if (!this.playing_)
    this.dispatch(new voodoo.Event('play', this));

  this.playing_ = true;
  this.looping_ = animation.loop;
  this.lastTime_ = 0;

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
 * Gets the currently playing animation. Readonly.
 *
 * @type {string}
 */
Mesh.prototype.animation = '';


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
 * @enum {string}
 */
Mesh.Format = {
  JSON: 'json'
};
