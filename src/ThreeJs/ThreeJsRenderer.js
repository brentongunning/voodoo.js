// ----------------------------------------------------------------------------
// File: ThreeJsRenderer.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The ThreeJs rendering engine.
 *
 * We encapsulate all ThreeJs operations in replacable classes in case
 * a different renderer be used in the future.
 *
 * @constructor
 * @private
 *
 * @param {Engine} engine Voodoo's central engine.
 */
function ThreeJsRenderer_(engine) {
  this.engine_ = engine;
  this.layers_ = [];
  this.projector_ = new THREE.Projector();

  this.validateAndPrepareWebpage_();
  this.createFullscreenRenderers_();
  this.createLayers_();
  this.setupDeltaTimer_();
}


/**
 * Shuts down the rendering engine
 */
ThreeJsRenderer_.prototype.destroy = function() {
  if (this.engine_.options_['aboveLayer'])
    document.body.removeChild(this.aboveCanvas_);
  if (this.engine_.options_['belowLayer'])
    document.body.removeChild(this.belowCanvas_);
};


/**
 * Updates each model and renders a single frame.
 */
ThreeJsRenderer_.prototype.frame = function() {
  this.update_();
  this.render_();
};


/**
 * Starts rendering frames.
 */
ThreeJsRenderer_.prototype.run = function() {
  // Tells THREE.js to continue invoking this method
  var self = this;
  requestAnimationFrame(function() {
    self.run();
  });

  this.frame();
};


/**
 * Enables or disables whether the above canvas captures mouse
 * events or lets them fall through to the page. When the user is hovering
 * over a 3D object, then links on the page, etc. shouldn't be selectable.
 *
 * This is called by the dispatcher.
 *
 * @private
 *
 * @param {boolean} capture Whether to capture mouse events or not.
 */
ThreeJsRenderer_.prototype.capturePointerEvents_ = function(capture) {
  if (this.engine_.options_['aboveLayer']) {
    if (capture)
      this.aboveCanvas_.style['pointerEvents'] = 'auto';
    else this.aboveCanvas_.style['pointerEvents'] = 'none';
  }
};


/**
 * Creates and initializes the above and below fullscreen renderers.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.createFullscreenRenderers_ = function() {
  log_.information_('Creating WebGL renderers');

  var webGlOptions = {
    antialias: this.engine_.options_['antialias']
  };

  if (this.engine_.options_['aboveLayer']) {
    this.aboveRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.aboveCanvas_ = this.aboveRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.aboveRenderer_);
    this.aboveCanvas_.style.zIndex = this.engine_.options_['aboveZIndex'];
  }

  if (this.engine_.options_['belowLayer']) {
    this.belowRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.belowCanvas_ = this.belowRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.belowRenderer_);
    this.belowCanvas_.style.zIndex = this.engine_.options_['belowZIndex'];
  }

  // Add window events for scroll and resize.

  // Moves the canvas whenever the page is scrolled
  var self = this;
  function onScroll(event) {
    self.targetLeft = window.pageXOffset + 'px';
    self.targetTop = window.pageYOffset + 'px';
  };

  // Resizes the canvas whenever the browser is resized
  function onResize(event) {
    self.viewportSize = self.getViewportSize_();
    var canvasWidth = self.viewportSize.width;
    var canvasHeight = self.viewportSize.height;

    self.aboveRenderer_.setSize(canvasWidth, canvasHeight);
    self.belowRenderer_.setSize(canvasWidth, canvasHeight);

    var styleCanvasWidth = canvasWidth + 'px';
    var styleCanvasHeight = canvasHeight + 'px';
    self.aboveCanvas_.style.width = styleCanvasWidth;
    self.belowCanvas_.style.width = styleCanvasWidth;
    self.aboveCanvas_.style.height = styleCanvasHeight;
    self.belowCanvas_.style.height = styleCanvasHeight;

    var devicePixelRatio = window.devicePixelRatio || 1.0;
    var renderingCanvasWidth = canvasWidth * devicePixelRatio;
    var renderingCanvasHeight = canvasHeight * devicePixelRatio;
    self.aboveCanvas_.width = renderingCanvasWidth;
    self.belowCanvas_.width = renderingCanvasWidth;
    self.aboveCanvas_.height = renderingCanvasHeight;
    self.belowCanvas_.height = renderingCanvasHeight;

    // This code forces webkit to redraw. It's needed because of a bug where
    // Chrome does not repaint some elements under the fullscreen canvas on
    // browser resize
    document.body.style.display = 'none';
    var unused = document.body.offsetHeight;
    document.body.style.display = 'block';
  }

  onResize(null);
  onScroll(null);

  // Register the canvasRenderer's onScroll and onResize events with the
  // window so we can adjust our canvas size
  window.addEventListener('scroll', onScroll, false);
  window.addEventListener('resize', onResize, false);
};


/**
 * Creates the above and below layers, their scenes and cameras.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.createLayers_ = function() {
  log_.information_('Creating layers');

  var renderer = this.engine_.options_['renderer'];

  // Create the above canvas and layer
  if (this.engine_.options_['aboveLayer']) {
    this.aboveCamera_ = new ThreeJsCamera_(this.aboveCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.aboveScene_ = new ThreeJsScene_();

    this.aboveTriggers_ = new ThreeJsTriggers_(this.aboveScene_);

    this.aboveLayer_ = new Layer_(LayerPass_['Above'], renderer,
        this.aboveCamera_, this.aboveScene_, this.aboveTriggers_);

    this.layers_.push(this.aboveLayer_);
  }

  // Create the below canvas and stencil layer
  if (this.engine_.options_['belowLayer']) {
    this.belowCamera_ = new ThreeJsCamera_(this.belowCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.belowScene_ = new ThreeJsScene_();
    this.stencilScene_ = new ThreeJsScene_();

    this.belowTriggers_ = new ThreeJsTriggers_(this.belowScene_);
    this.stencilTriggers_ = new ThreeJsTriggers_(this.stencilScene_);

    this.belowLayer_ = new Layer_(LayerPass_['Below'], renderer,
        this.belowCamera_, this.belowScene_, this.belowTriggers_);
    this.stencilLayer_ = new Layer_(LayerPass_['Stencil'], renderer,
        this.belowCamera_, this.stencilScene_, this.stencilTriggers_);

    this.layers_.push(this.belowLayer_);
    this.layers_.push(this.stencilLayer_);
  }

  this.pendingUpdateLayerZBoundaries_ = false;
  this.updateLayerZBoundaries_();
  var self = this;
  window.addEventListener('resize', function() {
    self.pendingUpdateLayerZBoundaries_ = true;
  }, false);
};


/**
 * Gets the next closest intersection on the above layer.
 *
 * This will actually check all objects in the below layer too
 * because ThreeJs has no way to limit rays based on camera
 * clip distance. However, we still perform checks on the below
 * layer for objects that only exist in the below layer.
 *
 * @private
 *
 * @param {Object} currentClosest Currently the closest hit.
 * @param {Array.<Model>} stencilIntersections Models intersecting on stencil.
 *
 * @return {Object} The new closest hit.
 */
ThreeJsRenderer_.prototype.findClosestAboveLayerIntersection_ = function(
    currentClosest, stencilIntersections) {
  var triggers = this.aboveLayer_.triggers.triggers_;

  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var obj = trigger.object_;
    var model = trigger.model_;

    var intersections = this.aboveRaycaster_.intersectObject(obj, true);

    // Check for at least one intersection on the object
    if (intersections.length <= 0)
      continue;

    // Check that the hit distance is closer than what we currently have
    if (intersections[0]['distance'] <= 0 ||
        intersections[0]['distance'] >= currentClosest.distance)
      continue;

    // Make sure that our intersection point is any of the following
    //  1) Above Z=0
    //  2) Below Z=0 AND the stencil layer isn't being used.
    //  3) Below Z=0 AND the stencil layer is used AND our ray intersects it
    if (this.engine_.options_['belowLayer'] &&
        intersections[0]['point']['z'] < 0 &&
        trigger.view_['zMin'] < 0.0 &&
        model['viewType'] != model['stencilViewType'] &&
        stencilIntersections.indexOf(model) === -1)
      continue;

    // New closest intersection. Save it.
    currentClosest.distance = intersections[0]['distance'];
    currentClosest.trigger = trigger;
    currentClosest.point = intersections[0]['point'];
  }

  return currentClosest;
};


/**
 * Gets the next closest intersection on the below layer.
 *
 * This actually only checks objects that completely exist in the below layer.
 *
 * @private
 *
 * @param {Object} currentClosest Currently the closest hit.
 * @param {Array.<Model>} stencilIntersections Models intersecting on stencil.
 *
 * @return {Object} The new closest hit.
 */
ThreeJsRenderer_.prototype.findClosestBelowLayerIntersection_ =
    function(currentClosest, stencilIntersections) {
  var triggers = this.belowLayer_.triggers.triggers_;

  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var model = trigger.model_;
    var obj = trigger.object_;

    // If the trigger has any part in the above layer, then ignore it
    // because we already checked it during the above layer checks.
    if (this.engine_.options_['aboveLayer'] &&
        (model['view']['zMax'] > 0.0 ||
        model['view']['zMin'] >= 0.0))
      continue;

    var intersections = this.belowRaycaster_['intersectObject'](obj, true);

    // Check for at least one intersection on the object
    if (intersections.length <= 0)
      continue;

    // Make sure the intersection is in the below layer
    if (intersections[0]['point']['z'] >= 0)
      continue;

    // Check that the hit distance is closer than what we currently have
    if (intersections[0]['distance'] <= 0 ||
        intersections[0]['distance'] >= currentClosest.distance)
      continue;

    // Check for a stencil intersection if it matters
    if (model['viewType'] != model['stencilViewType'] &&
        stencilIntersections.indexOf(model) === -1)
      continue;

    // New closest intersection. Save it.
    currentClosest.distance = intersections[0]['distance'];
    currentClosest.trigger = trigger;
    currentClosest.point = intersections[0]['point'];
  }

  return currentClosest;
};


/**
 * Gets all models on the stencil layer that intersect with the mouse.
 *
 * @private
 *
 * @return {Array.<Model>} All intersecting models on the stencil layer.
 */
ThreeJsRenderer_.prototype.findStencilLayerIntersections_ = function() {
  var stencilIntersections = [];
  var stencilTriggers = this.stencilLayer_.triggers.triggers_;

  for (var i = 0; i < stencilTriggers.length; ++i) {
    var trigger = stencilTriggers[i];
    var obj = trigger.object_;
    var model = trigger.model_;

    if (model['viewType'] === model['stencilViewType']) {
      // When the view and stencil view are the same types, stencil checking
      // doesn't matter.
      continue;
    }

    if (trigger.view_['zMin'] >= 0.0) {
      // Check if a stencil layer could even exists at all
      continue;
    }

    if (stencilTriggers.indexOf(model) !== -1) {
      // If we already checked this model, continue
      continue;
    }

    // Check for a hit
    if (this.belowRaycaster_.intersectObject(obj, true).length > 0)
      stencilIntersections.push(model);
  }

  return stencilIntersections;
};


/**
 * Gets the size of the client area of the browser.
 *
 * @private
 *
 * @return {Object} Object with width and height numbers.
 */
ThreeJsRenderer_.prototype.getViewportSize_ = function() {
  var testDiv = document.createElement('div');

  testDiv.style.cssText =
      'position: fixed; top: 0; left: 0; bottom: 0; right: 0;';
  document.documentElement.insertBefore(testDiv,
      document.documentElement.firstChild);

  var size = {width: testDiv.offsetWidth, height: testDiv.offsetHeight};
  document.documentElement.removeChild(testDiv);

  return size;
};


/**
 * Raycasts based on the current mouse and returns the intersected trigger.
 *
 * The return object has the following members:
 *    trigger - The EventTrigger_ that the ray intersected, or null for none.
 *    hitX - X position where the hit occurred.
 *    hitY - Y position where the hit occurred.
 *    hitZ - Z position where the hit occurred.
 *
 * @private
 *
 * @return {Object}
 */
ThreeJsRenderer_.prototype.raycast_ = function() {
  var closestIntersection = {
    distance: Number.MAX_VALUE,
    trigger: null,
    point: null
  };

  if (this.engine_.options_['belowLayer'] &&
      this.engine_.options_['aboveLayer']) {
    // With both canvases, raycast on both layers
    var stencilIntersections = this.findStencilLayerIntersections_();

    closestIntersection = this.findClosestAboveLayerIntersection_(
        closestIntersection, stencilIntersections);
    closestIntersection = this.findClosestBelowLayerIntersection_(
        closestIntersection, stencilIntersections);
  }
  else if (this.engine_.options_['aboveLayer']) {
    // With only the above canvas, raycast only the above layer
    closestIntersection = this.findClosestAboveLayerIntersection_(
        closestIntersection, []);
  }
  else if (this.engine_.options_['belowLayer']) {
    // With only the below canvas, raycast stencils and the below layer
    var stencilIntersections = this.findStencilLayerIntersections_();
    closestIntersection = this.findClosestBelowLayerIntersection_(
        closestIntersection, stencilIntersections);
  }

  var point = closestIntersection.point;
  return {
    trigger: closestIntersection.trigger,
    hitX: point ? point['x'] : Number.MAX_VALUE,
    hitY: point ? point['y'] : Number.MAX_VALUE,
    hitZ: point ? point['z'] : Number.MAX_VALUE
  };
};


/**
 * Renders the normal and stencil layers.
 *
 * @private
 */
ThreeJsRenderer_.prototype.render_ = function() {
  if (DEBUG && window['voodoo']['debug']['drawStencils']) {
    // Render stencils

    if (this.engine_.options_['belowLayer']) {
      this.belowRenderer_.context.disable(
          this.belowRenderer_.context.STENCIL_TEST);
      this.belowRenderer_.autoClear = true;
      this.belowRenderer_.render(this.stencilScene_.scene_,
          this.belowCamera_.camera_);
    }
  } else {
    // Render normally

    if (this.engine_.options_['belowLayer']) {
      if (DEBUG && window['voodoo']['debug']['disableStencils']) {
        this.belowRenderer_.context.disable(
            this.belowRenderer_.context.STENCIL_TEST);
        this.belowRenderer_.autoClear = true;
      } else {
        // Enable stencils and render them onto the below layer
        this.belowRenderer_.context.enable(
            this.belowRenderer_.context.STENCIL_TEST);
        this.belowRenderer_.context.clearStencil(0);
        this.belowRenderer_.context.stencilOp(
            this.belowRenderer_.context.REPLACE,
            this.belowRenderer_.context.REPLACE,
            this.belowRenderer_.context.REPLACE);
        this.belowRenderer_.context.stencilFunc(
            this.belowRenderer_.context.NEVER, 1, 0xffffffff);
        this.belowRenderer_.autoClear = false;
        this.belowRenderer_.clear();
        this.belowRenderer_.render(this.stencilScene_.scene_,
            this.belowCamera_.camera_);

        var context = this.belowRenderer_.context;
        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
        context.stencilFunc(context.EQUAL, 1, 0xffffffff);
      }

      this.belowRenderer_.render(this.belowScene_.scene_,
          this.belowCamera_.camera_);
    }

    if (this.engine_.options_['aboveLayer']) {
      this.aboveRenderer_.render(this.aboveScene_.scene_,
          this.aboveCamera_.camera_);
    }
  }

  // Force rendering to complete on all layers so there is no slicing from
  // timing differences
  if (this.engine_.options_['aboveLayer'])
    this.aboveRenderer_.context.finish();
  if (this.engine_.options_['belowLayer'])
    this.belowRenderer_.context.finish();

  // Move the canvases to the target position right before we render
  this.aboveCanvas_.style.left = this.belowCanvas_.style.left = this.targetLeft;
  this.aboveCanvas_.style.top = this.belowCanvas_.style.top = this.targetTop;
};


/**
 * Sets up the callbacks to start and stop the timer.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.setupDeltaTimer_ = function() {
  log_.information_('Starting timers');

  var self = this;
  this.lastTicks_ = 0;
  this.lastDeltaTime_ = 0;

  // Register with the window focus event so we know when the user switches
  // back to our tab. We will reset timing data.
  window.addEventListener('focus', function() {
    self.lastTicks_ = 0;
    setTimeout(function() {
      self.lastTicks_ = Date.now();
    }, self.engine_.options_.timerStartOnFocusDelayMs_);
  }, false);

  // Register with the window blur event so that when the user switchs to
  // another tab, we stop the timing so that the animations look like they
  // paused.
  window.addEventListener('blur', function() {
    self.lastTicks_ = 0;
  }, false);

  // Start animations 1 second after the page loads to minimize javascript
  // garbage collection
  setTimeout(function() {
    self.lastTicks_ = Date.now();
  }, self.engine_.options_.timerStartOnLoadDelayMs_);
};


/**
 * Initializes a WebGL canvas to always be fullscreen.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 *
 * @param {Object} canvasRenderer The WebGL canvas renderer from THREE.js.
 */
ThreeJsRenderer_.prototype.setupFullscreenCanvasRenderer_ =
    function(canvasRenderer) {
  var canvas = canvasRenderer.domElement;
  var canvasStyle = canvas.style;

  // Reverse the face culling order on the renderer. Normally, RHS like
  // Three.Js would cull CCW tris, but see Camera.js for an explanation.
  // See Camera.js for an explanation.
  canvasRenderer.setFaceCulling(THREE.CullFaceFront,
      THREE.FrontFaceDirectionCCW);

  canvasStyle.position = 'absolute';

  // This lets mouse events fall through to underlying objects so we can
  // select text and still use the page even when a canvas is on top.
  canvasStyle['pointerEvents'] = 'none';

  // Add the canvas to the page
  document.body.appendChild(canvas);
};


/**
 * Creates the raycaster objects used to intersect objects. This
 * needs to be called when the mouse moves.
 *
 * @private
 *
 * @param {number} clientX Client mouse x position.
 * @param {number} clientY Client mouse y position.
 */
ThreeJsRenderer_.prototype.setMousePosition_ = function(clientX, clientY) {
  var mx = 0, my = 0;
  if (typeof this.viewportSize !== 'undefined') {
    mx = (clientX / this.viewportSize.width) * 2 - 1;
    my = -(clientY / this.viewportSize.height) * 2 + 1;
  }

  if (this.engine_.options_['aboveLayer']) {
    this.aboveMouseVector_ = new THREE.Vector3(mx, my, 1);
    this.projector_.unprojectVector(this.aboveMouseVector_,
        this.aboveCamera_.camera_);
    this.aboveMouseVector_ =
        this.aboveMouseVector_.sub(
        this.aboveCamera_.camera_.position).normalize();
    this.aboveRaycaster_ = new THREE.Raycaster(
        this.aboveCamera_.camera_.position, this.aboveMouseVector_);
  }

  if (this.engine_.options_['belowLayer']) {
    this.belowMouseVector_ = new THREE.Vector3(mx, my, 1);
    this.projector_.unprojectVector(this.belowMouseVector_,
        this.belowCamera_.camera_);
    this.belowMouseVector_ =
        this.belowMouseVector_.sub(
        this.belowCamera_.camera_.position).normalize();
    this.belowRaycaster_ = new THREE.Raycaster(
        this.belowCamera_.camera_.position, this.belowMouseVector_);
  }
};


/**
 * Updates each model.
 *
 * @private
 */
ThreeJsRenderer_.prototype.update_ = function() {
  // Calculate the time delta between this frame the last in seconds
  var deltaTime = 0;
  var currTicks = Date.now();
  if (this.lastTicks_ != 0) {
    deltaTime = (currTicks - this.lastTicks_) / 1000.0;
    this.lastTicks_ = currTicks;
  }

  // If the delta time is more than twice the last delta time,
  // use the last delta time
  if (deltaTime > this.lastDeltaTime_ * 2) {
    var temp = this.lastDeltaTime_;
    this.lastDeltaTime_ = deltaTime;
    deltaTime = temp;
  } else this.lastDeltaTime_ = deltaTime;


  // Update the cameras
  if (this.engine_.options_['aboveLayer'])
    this.aboveCamera_.update_();
  if (this.engine_.options_['belowLayer'])
    this.belowCamera_.update_();
  if (this.pendingUpdateLayerZBoundaries_) {
    this.updateLayerZBoundaries_();
    this.pendingUpdateLayerZBoundaries_ = false;
  }

  // Dispatch cameramove events
  if ((this.engine_.options_['aboveLayer'] &&
      this.aboveCamera_.pendingCameraMoveEvent_) ||
      (this.engine_.options_['belowLayer'] &&
      this.belowCamera_.pendingCameraMoveEvent_)) {
    var models = this.engine_.models_;
    var event = new window['voodoo']['Event']('cameramove');
    for (var modelIndex = 0; modelIndex < models.length; ++modelIndex)
      models[modelIndex].dispatchEvent_(event);

    if (this.engine_.options_['aboveLayer'])
      this.aboveCamera_.pendingCameraMoveEvent_ = false;
    if (this.engine_.options_['belowLayer'])
      this.belowCamera_.pendingCameraMoveEvent_ = false;
  }

  // Update each model
  var models = this.engine_.models_;
  for (var modelIndex = 0; modelIndex < models.length; ++modelIndex)
    models[modelIndex].update(deltaTime);

  // Tell the dispatcher to dispatch all frame-based events.
  this.engine_.dispatcher_.update();
};


/**
 * Sets the correct Z near and far values for each layer.
 *
 * This is called on browser resize.
 *
 * @private
 */
ThreeJsRenderer_.prototype.updateLayerZBoundaries_ = function() {
  // We subtract -0.5 from where we should cut off the Z so there is no seam
  // between renders
  if (this.engine_.options_['belowLayer']) {
    var zCamera = this.belowCamera_['position']['z'];
    this.belowCamera_.setZNearAndFar_(zCamera - 0.5,
        this.engine_.options_.zFar_);
  }

  if (this.engine_.options_['aboveLayer']) {
    var zCamera = this.aboveCamera_['position']['z'];
    this.aboveCamera_.setZNearAndFar_(this.engine_.options_.zNear_,
        zCamera);
  }
};


/**
 * Performs initial checks to make sure the graphics engine will work.
 *
 * This is called internally during the renderer's constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.validateAndPrepareWebpage_ = function() {
  log_.information_('Validating and preparing webpage for use');

  // Set the body dimensions to 100% so the canvas sizes can be set to 100%
  // and there will be no scroll bars.
  log_.assert_(document.body, 'document.body is undefined');
  document.body.style.width = '100%';
  document.body.style.height = '100%';

  // This tells the browser not to add scroll bars for full screen canvases.
  // Consequently, it also removes the nice looking margins from the body.
  // The only alternative to this is to set:
  //    document.body.style.overflow = 'hidden';
  // which prevents scrolling altogether. No good solution here :(
  document.body.style.margin = 0 + 'px';
};


/**
 * The layers of rendering space.
 *
 * @private
 */
ThreeJsRenderer_.prototype.layers_ = null;
