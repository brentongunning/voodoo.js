// ----------------------------------------------------------------------------
// File: Positioner.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------



/**
 * The view that positions scene meshes.
 *
 * @constructor
 * @private
 * @extends {voodoo.View}
 */
var PositionerView_ = voodoo.View.extend({

  load: function() {
    this.base.load();

    this.scene.on('add', function(e) {
      var position = this.model.position_;
      var objectPosition = e.object.position;
      objectPosition.x = position.x;
      objectPosition.y = position.y;
      objectPosition.z = position.z;
      this.dirty();
    });
  },

  setPosition: function(position) {
    var sceneObjects = this.scene.objects;
    for (var i = 0; i < sceneObjects.length; ++i) {
      var sceneObject = sceneObjects[i];
      var sceneObjectPosition = sceneObject.position;
      sceneObjectPosition.x = position.x;
      sceneObjectPosition.y = position.y;
      sceneObjectPosition.z = position.z;
    }

    this.dirty();
  },

  attachScene: function(element, center, pixels) {
    this.scene.attach(element, center, pixels);
  },

  detachScene: function() {
    this.scene.detach();
  }

});



/**
 * Adds functions to position meshes.
 *
 * Options:
 *
 * - element {HTMLElement} Element to attach to.
 * - center {boolean} Whether to center the mesh on the attached element.
 * - pixelScale {boolean} Whether the scale of the attached mesh is in pixels.
 * - position {Object} Initial position. This can be an array of length 3, or
 *     an object with x, y, and z properties.
 *
 * Events:
 *
 * - attach
 * - detach
 * - moveBegin
 * - moveEnd
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Positioner = this.Positioner = voodoo.Model.extend({

  name: 'Positioner',
  organization: 'spellbook',
  viewType: PositionerView_,
  stencilViewType: PositionerView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (typeof options.position !== 'undefined') {
      this.position_ = this.parsePosition_(options.position);
    } else this.position_ = { x: 0, y: 0, z: 0 };

    this.element_ = options.element;
    this.center_ = options.center;
    this.pixelScale_ = options.pixelScale;

    this.startPosition = {
      x: this.position_.x,
      y: this.position_.y,
      z: this.position_.z
    };
    this.targetPosition = {
      x: this.position_.x,
      y: this.position_.y,
      z: this.position_.z
    };
    this.moveStartTime = null;
    this.moveDuration = 0;

    var self = this;
    var proxy = {};
    Object.defineProperty(proxy, 'x', {
      get: function() { return self.position_.x; },
      set: function(x) { self.setPosition(x, self.position_.y,
          self.position_.z); },
      writeable: false
    });
    Object.defineProperty(proxy, 'y', {
      get: function() { return self.position_.y; },
      set: function(y) { self.setPosition(self.position_.x, y,
          self.position_.z); },
      writeable: false
    });
    Object.defineProperty(proxy, 'z', {
      get: function() { return self.position_.z; },
      set: function(z) { self.setPosition(self.position_.x,
          self.position_.y, z); },
      writeable: false
    });

    Object.defineProperty(this, 'position', {
      get: function() { return proxy; },
      set: function(position) { this.setPosition(position); },
      writeable: false
    });
  },

  setUpViews: function() {
    this.base.setUpViews();

    if (typeof this.element_ !== 'undefined' && this.element_)
      this.attach(this.element_, this.center_, this.pixelScale_);
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.position_.x !== this.targetPosition.x ||
        this.position_.y !== this.targetPosition.y ||
        this.position_.z !== this.targetPosition.z) {
      var now = new Date();
      var duration = now - this.moveStartTime;
      var t = duration / this.moveDuration;

      if (t < 1.0) {
        var invT = 1 - t;
        this.position_.x = this.startPosition.x * invT +
            this.targetPosition.x * t;
        this.position_.y = this.startPosition.y * invT +
            this.targetPosition.y * t;
        this.position_.z = this.startPosition.z * invT +
            this.targetPosition.z * t;
      } else {
        this.position_.x = this.targetPosition.x;
        this.position_.y = this.targetPosition.y;
        this.position_.z = this.targetPosition.z;
      }

      if (this.position_.x === this.targetPosition.x &&
          this.position_.y === this.targetPosition.y &&
          this.position_.z === this.targetPosition.z)
        this.dispatch(new voodoo.Event('moveEnd', this));

      this.view.setPosition(this.position_);
      if (typeof this.stencilView !== 'undefined' && this.stencilView)
        this.stencilView.setPosition(this.position_);
    }
  }

});


/**
  * Attaches scene meshes to an HTML element.
  *
  * @param {HTMLElement} element Element to attach to.
  * @param {boolean} center Whether to center the meshes within the element.
  * @param {boolean} pixelScale Whether to scale meshes in pixels, or units.
  *
  * @return {Positioner}
  */
Positioner.prototype.attach = function(element, center, pixelScale) {
  this.view.attachScene(element, center, pixelScale);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.attachScene(element, center, pixelScale);

  this.dispatch(new voodoo.Event('attach', this));

  return this;
};


/**
  * Detaches scene meshes from the attached HTML element.
  *
  * @return {Positioner}
  */
Positioner.prototype.detach = function() {
  this.dispatch(new voodoo.Event('detach', this));

  this.view.detachScene();
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.detachScene();

  return this;
};


/**
  * Moves all scene meshes to another position over time.
  *
  * position can also be specified as separate components:
  *    moveTo(x, y, z, seconds)
  *
  * @param {Object} position Target position.
  * @param {number} seconds Animation duration.
  *
  * @return {Positioner}
  */
Positioner.prototype.moveTo = function(position, seconds) {
  var endPosition;
  if (arguments.length > 2) {
    endPosition = { x: arguments[0], y: arguments[1], z: arguments[2] };
    seconds = arguments[3];
  } else endPosition = this.parsePosition_(position);

  if (seconds == 0) {
    this.setPosition(endPosition);
  } else if (this.position_.x !== endPosition.x ||
      this.position_.y !== endPosition.y ||
      this.position_.z !== endPosition.z) {
    this.startPosition.x = this.position_.x;
    this.startPosition.y = this.position_.y;
    this.startPosition.z = this.position_.z;
    this.targetPosition.x = endPosition.x;
    this.targetPosition.y = endPosition.y;
    this.targetPosition.z = endPosition.z;
    this.moveStartTime = new Date();
    this.moveDuration = seconds * 1000;

    this.dispatch(new voodoo.Event('moveBegin', this));
  }

  return this;
};


/**
  * Immediately changes the position of all scene meshes.
  *
  * position can also be specified as separate components:
  *    setPosition(x, y, z)
  *
  * @param {Object} position Position.
  *
  * @return {Positioner}
  */
Positioner.prototype.setPosition = function(position) {
  if (arguments.length > 1)
    this.position_ = { x: arguments[0], y: arguments[1], z: arguments[2] };
  else this.position_ = this.parsePosition_(position);

  this.targetPosition.x = this.position_.x;
  this.targetPosition.y = this.position_.y;
  this.targetPosition.z = this.position_.z;

  this.view.setPosition(this.position_);
  if (typeof this.stencilView !== 'undefined' && this.stencilView)
    this.stencilView.setPosition(this.position_);

  return this;
};


/**
 * Get or set the position of all scene meshes.
 *
 * If the meshes are attached to an HTML element, then this position
 * is an offset from its attached location. Otherwise, it is an absolute
 * location on the page in pixels.
 *
 * Setting the position may be done in one of three ways:
 *
 * 1. Array: object.position = [1, 1, 0.5];
 * 2. Object: object.position = {x: 1, y: 2, z: 3};
 * 3. Component: object.position.z = 0;
 *
 * As a getter, this object will always return an
 * object with x, y, and z properties.
 *
 * @type {Object}
 */
Positioner.prototype.position = null;


/**
 * Converts a position parameter into an object with x, y, z properties.
 *
 * @private
 *
 * @param {Object} position Position.
 *
 * @return {Object}
 */
Positioner.prototype.parsePosition_ = function(position) {
  if (typeof position === 'object') {
    if ('x' in position)
      return position;
    else return { x: position[0], y: position[1], z: position[2] };
  } else return { x: 0, y: 0, z: 0 };
};
