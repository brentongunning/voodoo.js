// ----------------------------------------------------------------------------
// File: Movable.js
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
var MovableView_ = voodoo.View.extend({

  above: false,
  below: false,

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

    this.setPosition_(this.model.position_);
  },

  setPosition_: function(position) {
    log_.assert_(position, 'position must be valid.',
        '(MovableView_::setPosition_)');

    var sceneObjects = this.scene.objects;
    for (var i = 0, len = sceneObjects.length; i < len; ++i) {
      var sceneObject = sceneObjects[i];
      var sceneObjectPosition = sceneObject.position;

      sceneObjectPosition.x = position.x;
      sceneObjectPosition.y = position.y;
      sceneObjectPosition.z = position.z;
    }

    this.dirty();
  },

  attachScene_: function(element, center, pixels) {
    this.scene.attach(element, center, pixels);
  },

  detachScene_: function() {
    this.scene.detach();
  }

});



/**
 * Adds functions to position meshes.
 *
 * Options:
 *
 * - element {HTMLElement=} Optional element to attach to.
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
 * - move
 *
 * @constructor
 * @extends {voodoo.Model}
 *
 * @param {Object=} opt_options Options object.
 */
var Movable = this.Movable = voodoo.Model.extend({

  name: 'Movable',
  organization: 'spellbook',
  viewType: MovableView_,

  initialize: function(options) {
    this.base.initialize(options);

    if (options.position)
      this.position_ = parseVector3_(options.position);
    else
      this.position_ = { x: 0, y: 0, z: 0 };

    if (options.element) {
      log_.assert_(options.element instanceof HTMLElement,
          'element must be an HTMLElement.', '(Movable::initialize)');
    }

    this.element_ = options.element;

    if (typeof options.center !== 'undefined') {
      log_.assert_(typeof options.center === 'boolean',
          'center must be a boolean.', options.center,
          '(Movable::initialize)');

      this.center_ = options.center;
    } else {
      this.center_ = true;
    }

    if (typeof options.pixelScale !== 'undefined') {
      log_.assert_(typeof options.pixelScale === 'boolean',
          'pixelScale must be a boolean.', options.pixelScale,
          '(Movable::initialize)');

      this.pixelScale_ = options.pixelScale;
    } else {
      this.pixelScale_ = true;
    }

    this.startPosition_ = {
      x: this.position_.x,
      y: this.position_.y,
      z: this.position_.z
    };

    this.targetPosition_ = {
      x: this.position_.x,
      y: this.position_.y,
      z: this.position_.z
    };

    this.moveStartTime_ = null;
    this.moveDuration_ = 0;
    this.moving_ = false;
    this.moveElapsed_ = 0;

    var that = this;
    var proxy = {};

    Object.defineProperty(this, 'moving', {
      get: function() { return that.moving_; },
      set: function(moving) { that.setMoving(moving); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'x', {
      get: function() { return that.position_.x; },
      set: function(x) { that.setPosition(x, that.position_.y,
          that.position_.z); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'y', {
      get: function() { return that.position_.y; },
      set: function(y) { that.setPosition(that.position_.x, y,
          that.position_.z); },
      enumerable: true
    });

    Object.defineProperty(proxy, 'z', {
      get: function() { return that.position_.z; },
      set: function(z) { that.setPosition(that.position_.x,
          that.position_.y, z); },
      enumerable: true
    });

    Object.defineProperty(this, 'position', {
      get: function() { return proxy; },
      set: function(position) { that.setPosition(position); },
      enumerable: true
    });

    Object.defineProperty(this, 'targetPosition', {
      get: function() { return {
        x: that.targetPosition_.x,
        y: that.targetPosition_.y,
        z: that.targetPosition_.z
      }; },
      enumerable: true
    });
  },

  setUpViews: function() {
    this.base.setUpViews();

    if (this.element_)
      this.attach(this.element_, this.center_, this.pixelScale_);
  },

  update: function(deltaTime) {
    this.base.update(deltaTime);

    if (this.moving_) {
      var now = new Date();
      var duration = now - this.moveStartTime_;
      var t = duration / this.moveDuration_;

      if (t < 1.0) {

        var i = this.moveEasing_(t);
        var invI = 1 - i;

        this.position_.x =
            this.startPosition_.x * invI +
            this.targetPosition_.x * i;
        this.position_.y =
            this.startPosition_.y * invI +
            this.targetPosition_.y * i;
        this.position_.z =
            this.startPosition_.z * invI +
            this.targetPosition_.z * i;

      } else {
        this.position_.x = this.targetPosition_.x;
        this.position_.y = this.targetPosition_.y;
        this.position_.z = this.targetPosition_.z;
      }
      this.dispatch(new voodoo.Event('move', this));

      if (t >= 1.0) {
        this.moving_ = false;
        this.moveDuration_ = 0;
        this.moveElapsed_ = 0;

        this.startPosition_.x = this.position_.x;
        this.startPosition_.y = this.position_.y;
        this.startPosition_.z = this.position_.z;

        this.dispatch(new voodoo.Event('moveEnd', this));
      }

      this.view.setPosition_(this.position_);
      if (this.stencilView)
        this.stencilView.setPosition_(this.position_);
    }
  }

});


/**
  * Attaches scene meshes to an HTML element.
  *
  * @param {HTMLElement} element Element to attach to.
  * @param {boolean=} center Whether to center the meshes within the element.
  *   Default is true.
  * @param {boolean=} pixelScale Whether to scale meshes in pixels, or units.
  *   Default is true.
  *
  * @return {Movable}
  */
Movable.prototype.attach = function(element, center, pixelScale) {
  log_.assert_(element, 'element must be valid.',
      '(Movable::attach)');
  log_.assert_(element instanceof HTMLElement,
      'element must be an HTMLElement.', '(Movable::attach)');

  this.view.attachScene_(element, center, pixelScale);
  if (this.stencilView)
    this.stencilView.attachScene_(element, center, pixelScale);

  this.dispatch(new voodoo.Event('attach', this));

  return this;
};


/**
  * Detaches scene meshes from the attached HTML element.
  *
  * @return {Movable}
  */
Movable.prototype.detach = function() {
  this.dispatch(new voodoo.Event('detach', this));

  this.view.detachScene_();
  if (this.stencilView)
    this.stencilView.detachScene_();

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
  * @param {function(number):number=} opt_easing Optional easing function.
  *     Default is easing.easeInOutQuad.
  *
  * @return {Movable}
  */
Movable.prototype.moveTo = function(position, seconds, opt_easing) {
  var endPosition;
  if (arguments.length > 2 && typeof arguments[2] === 'number') {
    endPosition = { x: arguments[0], y: arguments[1], z: arguments[2] };
    seconds = arguments[3];
    opt_easing = arguments[4];
  } else {
    endPosition = parseVector3_(position);
  }

  log_.assert_(typeof seconds === 'number', 'seconds must be a number.',
      '(Movable::moveTo)');
  log_.assert_(seconds >= 0, 'seconds must be >= 0.',
      '(Movable::moveTo)');

  if (seconds === 0) {

    this.setPosition(endPosition);

  } else if (this.position_.x !== endPosition.x ||
      this.position_.y !== endPosition.y ||
      this.position_.z !== endPosition.z) {

    this.startPosition_.x = this.position_.x;
    this.startPosition_.y = this.position_.y;
    this.startPosition_.z = this.position_.z;

    this.targetPosition_.x = endPosition.x;
    this.targetPosition_.y = endPosition.y;
    this.targetPosition_.z = endPosition.z;

    this.moveStartTime_ = new Date();
    this.moveDuration_ = seconds * 1000;
    this.moving_ = true;
    this.moveElapsed_ = 0;

    this.moveEasing_ = opt_easing || Easing.prototype.easeInOutQuad;

    this.dispatch(new voodoo.Event('moveBegin', this));

  }

  return this;
};


/**
 * Sets whether we are currently moving. This may be used to pause and
 * resume animations.
 *
 * @param {boolean} moving Whether to enable or disable moving.
 *
 * @return {Movable}
 */
Movable.prototype.setMoving = function(moving) {
  log_.assert_(typeof moving === 'boolean', 'moving must be a boolean.',
      moving, '(Movable::setMoving)');

  if (!moving && this.moving_) {

    this.moving_ = false;
    this.moveElapsed_ = new Date() - this.moveStartTime_;

  } else if (moving && !this.moving_) {

    this.moving_ = true;
    this.moveStartTime_ = new Date() - this.moveElapsed_;

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
  * @return {Movable}
  */
Movable.prototype.setPosition = function(position) {
  log_.assert_(position, 'position must be valid.',
      '(Movable::setPosition)');

  if (arguments.length > 1)
    this.position_ = { x: arguments[0], y: arguments[1], z: arguments[2] };
  else
    this.position_ = parseVector3_(position);

  this.targetPosition_.x = this.position_.x;
  this.targetPosition_.y = this.position_.y;
  this.targetPosition_.z = this.position_.z;

  this.moving_ = false;
  this.moveDuration_ = 0;
  this.moveElapsed_ = 0;

  this.dispatch(new voodoo.Event('move', this));

  this.view.setPosition_(this.position_);
  if (this.stencilView)
    this.stencilView.setPosition_(this.position_);

  return this;
};


/**
 * Gets or sets whether we are currently animating between positions.
 *
 * @type {boolean}
 */
Movable.prototype.moving = false;


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
 * As a getter, this will always return an
 * object with x, y, and z properties.
 *
 * @type {Object}
 */
Movable.prototype.position = null;


/**
 * Gets the position the mesh is animating to. Readonly.
 *
 * If the meshes are attached to an HTML element, then this position
 * is an offset from its attached location. Otherwise, it is an absolute
 * location on the page in pixels.
 *
 * Returns an object an object with x, y, and z properties.
 *
 * @type {Object}
 */
Movable.prototype.targetPosition = null;
