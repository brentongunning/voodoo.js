// ----------------------------------------------------------------------------
// File: ThreeJsCamera.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The ThreeJs virtual camera that aligns 3D coordinates with 2D pixels.
 *
 * @constructor
 * @private
 *
 * @param {HTMLCanvasElement} canvas HTML canvas element.
 * @param {number} fovY Camera field of view in degrees along the y axis.
 * @param {number} zNear Minimum z distance rendered.
 * @param {number} zFar Maximum z distance rendered.
 */
function ThreeJsCamera_(canvas, fovY, zNear, zFar) {
  log_.info_('Creating ThreeJs Camera');
  this.camera_ = new THREE.Camera();
  this.frustum_ = new THREE.Frustum();

  this.canvas_ = canvas;
  this.fovY_ = fovY;
  this.zNear_ = zNear;
  this.zFar_ = zFar;

  this.initialize_();
  this.createProperties_();
}


/**
 * Inherit from Camera.
 */
ThreeJsCamera_.prototype = new Camera();


/**
 * Set the constructor back.
 */
ThreeJsCamera_.prototype.constructor = ThreeJsCamera_.constructor;


/**
 * Creates the public camera properties.
 *
 * @private
 */
ThreeJsCamera_.prototype.createProperties_ = function() {
  var that = this;

  Object.defineProperty(this, 'fovY', {
    get: function() { return that.fovY_; },
    enumerable: true
  });

  Object.defineProperty(this, 'position', {
    get: function() {
      var cameraPosition = that.camera_.position;
      return {
        'x': cameraPosition.x,
        'y': cameraPosition.y,
        'z': cameraPosition.z
      };
    },
    enumerable: true
  });

  Object.defineProperty(this, 'zNear', {
    get: function() { return that.zNear_; },
    enumerable: true
  });

  Object.defineProperty(this, 'zFar', {
    get: function() { return this.zFar_; },
    enumerable: true
  });
};


/**
 * Initializes the camera.
 *
 * @private
 */
ThreeJsCamera_.prototype.initialize_ = function() {
  this.pendingScroll_ = true;
  this.pendingResize_ = true;
  this.pendingFrustumUpdate_ = true;

  // The camera is oriented so that 0,0 is the upper-left corner
  var cameraUp = this.camera_.up;
  cameraUp.x = 0;
  cameraUp.y = -1;
  cameraUp.z = 0;

  this.onResize_();
  this.update_();

  // Register the renderer's onScroll and onResize events with the window
  var that = this;

  window.addEventListener('scroll', function() {
    that.onScroll_();
  }, false);

  window.addEventListener('resize', function() {
    that.onResize_();
  }, false);

  this.pendingCameraMoveEvent_ = true;
};


/**
 * Updates the camera's position when the page is scrolled.
 *
 * @private
 */
ThreeJsCamera_.prototype.onScroll_ = function() {
  this.pendingScroll_ = true;
};


/**
 * Updates the camera's perspective matrix and position when the browser
 * is resized.
 *
 * @private
 */
ThreeJsCamera_.prototype.onResize_ = function() {
  this.pendingResize_ = true;

  this.onScroll_();
};


/**
 * Updates the Z near and Z far distances.
 *
 * This is called by Engine when the browser window is resized.
 *
 * @private
 *
 * @param {number} zNear The minimum Z distance to render.
 * @param {number} zFar The maximum Z distance to render.
 */
ThreeJsCamera_.prototype.setZNearAndFar_ = function(zNear, zFar) {
  this.zNear_ = zNear;
  this.zFar_ = zFar;

  this.camera_.projectionMatrix.makePerspective(this.fovY_,
      this.aspectRatio_, this.zNear_, this.zFar_);

  this.pendingFrustumUpdate_ = true;
  this.update_();
};


/**
 * Called each frame to update the camera settings if necessary.
 *
 * This is done to reduce work during actual scroll/resize events.
 *
 * @private
 */
ThreeJsCamera_.prototype.update_ = function() {
  if (this.pendingResize_) {
    var canvasStyle = this.canvas_.style;
    var canvasWidth = parseInt(canvasStyle.width, 10);
    var canvasHeight = parseInt(canvasStyle.height, 10);

    this.aspectRatio_ = canvasWidth / canvasHeight;

    var fovYInRadians = Math.tan(this.fovY_ / 360.0 * Math.PI);
    this.zCamera_ = (canvasHeight / 2.0) / fovYInRadians;

    this.camera_.projectionMatrix.makePerspective(this.fovY_,
        this.aspectRatio_, this.zNear_, this.zFar_);

    this.camera_.position.z = this.zCamera_;

    // Because we have our up vector pointing the opposite way, you can imagine
    // we rotated the camera 180deg along the Z axis. Therefore, our x coords
    // are reversed now. This flips them back in place. We also have to reverse
    // the face culling which we do when setting up the renderers in Engine.cs.
    this.camera_.scale.x = -1;

    this.pendingResize_ = false;
    this.pendingCameraMoveEvent_ = true;
    this.pendingFrustumUpdate_ = true;
  }

  if (this.pendingScroll_) {
    var canvasStyle = this.canvas_.style;
    var canvasWidth = parseInt(canvasStyle.width, 10);
    var canvasHeight = parseInt(canvasStyle.height, 10);

    var cameraPosition = this.camera_.position;
    cameraPosition.x = canvasWidth / 2 + window.pageXOffset;
    cameraPosition.y = canvasHeight / 2 + window.pageYOffset;

    this.camera_.lookAt(new THREE.Vector3(cameraPosition.x,
        cameraPosition.y, 0));

    this.pendingScroll_ = false;
    this.pendingCameraMoveEvent_ = true;
    this.pendingFrustumUpdate_ = true;
  }

  if (this.pendingFrustumUpdate_) {
    this.camera_.updateMatrixWorld(true);

    var matrixWorldInverse = new THREE.Matrix4();
    matrixWorldInverse.getInverse(this.camera_.matrixWorld);

    this.frustum_.setFromMatrix(new THREE.Matrix4().multiplyMatrices(
        this.camera_.projectionMatrix, matrixWorldInverse));

    this.pendingFrustumUpdate_ = false;
  }
};


/**
 * The actual ThreeJs camera object.
 *
 * @private
 * @type {THREE.Camera}
 */
ThreeJsCamera_.prototype.camera_ = null;


/**
 * The camera's view frustum.
 *
 * @private
 * @type {THREE.Frustum}
 */
ThreeJsCamera_.prototype.frustum_ = null;


/**
 * Signals to the renderer that a camera move event should be fired. After
 * firing, this flag should be cleared.
 *
 * @private
 * @type {boolean}
 */
ThreeJsCamera_.prototype.pendingCameraMoveEvent_ = false;
