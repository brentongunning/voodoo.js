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
  this.registerWindowEvents_();
  this.setupDeltaTimer_();

  if (DEBUG)
    this.fpsTimer_ = new FpsTimer_();
}


/**
 * Shuts down the rendering engine.
 */
ThreeJsRenderer_.prototype.destroy = function() {
  if (this.engine_.options_['aboveLayer'])
    document.body.removeChild(this.aboveCanvas_);
  if (this.engine_.options_['belowLayer'])
    document.body.removeChild(this.belowCanvas_);
  if (this.engine_.options_['seamLayer'])
    document.body.removeChild(this.seamCanvas_);

  if (DEBUG)
    this.fpsTimer_.destroy();
};


/**
 * Updates each model and renders a single frame.
 */
ThreeJsRenderer_.prototype.frame = function() {
  this.update_();
  this.render_();

  if (DEBUG)
    this.fpsTimer_.frame();
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
  if (capture) {
    if (this.engine_.options_['aboveLayer'])
      this.aboveCanvas_.style['pointerEvents'] = 'auto';

    if (this.engine_.options_['belowLayer'])
      this.belowCanvas_.style['pointerEvents'] = 'auto';

    if (this.engine_.options_['seamLayer'])
      this.seamCanvas_.style['pointerEvents'] = 'auto';
  } else {
    if (this.engine_.options_['aboveLayer'])
      this.aboveCanvas_.style['pointerEvents'] = 'none';

    if (this.engine_.options_['belowLayer'])
      this.belowCanvas_.style['pointerEvents'] = 'none';

    if (this.engine_.options_['seamLayer'])
      this.seamCanvas_.style['pointerEvents'] = 'none';
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

  // Create the canvas for the above layer.
  if (this.engine_.options_['aboveLayer']) {
    this.aboveRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.aboveCanvas_ = this.aboveRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.aboveRenderer_);
    this.aboveCanvas_.style.zIndex = this.engine_.options_['aboveZIndex'];
  }

  // Create the canvas for the below layer.
  if (this.engine_.options_['belowLayer']) {
    this.belowRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.belowCanvas_ = this.belowRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.belowRenderer_);
    this.belowCanvas_.style.zIndex = this.engine_.options_['belowZIndex'];
  }

  // Check whether antialiasing is actually being used. The seam layer is only
  // supported when antialiasing is on.
  var antialiasSupported = (this.engine_.options_['aboveLayer'] &&
      this.aboveRenderer_.context.getContextAttributes().antialias) ||
      (this.engine_.options_['belowLayer'] &&
      this.belowRenderer_.context.getContextAttributes().antialias);
  if (!antialiasSupported) {
    this.engine_.options_['antialias'] = false;
    this.engine_.options_['seamLayer'] = false;
  }

  // Require both above and below layers to have a seam layer.
  if (!this.engine_.options_['aboveLayer'] ||
      !this.engine_.options_['belowLayer'])
    this.engine_.options_['seamLayer'] = false;

  // Create the canvas for the seam layer.
  if (this.engine_.options_['seamLayer']) {
    // The seam layer always has antialiasing off to blend the layers.
    var seamWebGlOptions = {
      antialias: false
    };

    this.seamRenderer_ = new THREE.WebGLRenderer(seamWebGlOptions);
    this.seamCanvas_ = this.seamRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.seamRenderer_);
    this.seamCanvas_.style.zIndex = this.engine_.options_['seamZIndex'];
  }

  this.onResize_(null);
  this.onScroll_(null);
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

  // Create the above layer
  if (this.engine_.options_['aboveLayer']) {
    this.aboveCamera_ = new ThreeJsCamera_(this.aboveCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.aboveScene_ = new ThreeJsScene_();

    this.aboveTriggers_ = new ThreeJsTriggers_(this.aboveScene_);
    this.aboveCache_ = new Cache({});

    this.aboveLayer_ = new Layer_(LayerPass_['Above'], renderer,
        this.aboveCamera_, this.aboveScene_, this.aboveTriggers_,
        this.aboveCache_);

    this.layers_.push(this.aboveLayer_);
  }

  // Create the below and stencil layer
  if (this.engine_.options_['belowLayer']) {
    this.belowCamera_ = new ThreeJsCamera_(this.belowCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.belowScene_ = new ThreeJsScene_();
    this.belowTriggers_ = new ThreeJsTriggers_(this.belowScene_);
    this.belowCache_ = new Cache({});
    this.belowLayer_ = new Layer_(LayerPass_['Below'], renderer,
        this.belowCamera_, this.belowScene_, this.belowTriggers_,
        this.belowCache_);
    this.layers_.push(this.belowLayer_);

    if (this.engine_.options_['stencils']) {
      this.belowStencilScene_ = new ThreeJsScene_();
      this.belowStencilTriggers_ = new ThreeJsTriggers_(
          this.belowStencilScene_);
      this.belowStencilCache_ = new Cache({});
      this.belowStencilLayer_ = new Layer_(LayerPass_['BelowStencil'], renderer,
          this.belowCamera_, this.belowStencilScene_,
          this.belowStencilTriggers_, this.belowStencilCache_);
      this.layers_.push(this.belowStencilLayer_);
    }
  }

  // Create the seam layer and seam stencil layer
  if (this.engine_.options_['seamLayer']) {
    this.seamCamera_ = new ThreeJsCamera_(this.seamCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.seamScene_ = new ThreeJsScene_();

    // The triggers for the seam layer aren't actually used. We just
    // create one so as not to break user code.
    this.seamTriggers_ = new ThreeJsTriggers_(this.seamScene_);
    this.seamCache_ = new Cache({});

    this.seamLayer_ = new Layer_(LayerPass_['Seam'], renderer,
        this.seamCamera_, this.seamScene_, this.seamTriggers_,
        this.seamCache_);

    this.layers_.push(this.seamLayer_);

    if (this.engine_.options_['stencils']) {
      this.seamStencilScene_ = new ThreeJsScene_();
      this.seamStencilTriggers_ = new ThreeJsTriggers_(this.seamStencilScene_);
      this.seamStencilCache_ = new Cache({});
      this.seamStencilLayer_ = new Layer_(LayerPass_['SeamStencil'], renderer,
          this.seamCamera_, this.seamStencilScene_, this.seamStencilTriggers_,
          this.seamStencilCache_);
      this.layers_.push(this.seamStencilLayer_);
    }
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
        trigger.view_['below'] &&
        this.engine_.options_['stencils'] &&
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
    if (this.engine_.options_['aboveLayer'] && model['view']['above'])
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

    // Look for a stencil intersection
    if (this.engine_.options_['stencils'] &&
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
 * Gets all models on the stencil layer that intersect with the mouse.
 *
 * @private
 *
 * @return {Array.<Model>} All intersecting models on the stencil layer.
 */
ThreeJsRenderer_.prototype.findStencilLayerIntersections_ = function() {
  var stencilIntersections = [];
  var stencilTriggers = this.belowStencilLayer_.triggers.triggers_;

  for (var i = 0; i < stencilTriggers.length; ++i) {
    var trigger = stencilTriggers[i];
    var obj = trigger.object_;
    var model = trigger.model_;

    // When the view and stencil view are the same types, stencil checking
    // doesn't matter.
    if (model['viewType'] === model['stencilViewType'])
      continue;

    // Check if a stencil layer could even exists at all
    if (!trigger.view_['below'])
      continue;

    // If we already checked this model, continue
    if (stencilTriggers.indexOf(model) !== -1)
      continue;

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
 * Resizes the canvas whenever the browser is resized
 *
 * @private
 *
 * @param {Event} event Event.
 */
ThreeJsRenderer_.prototype.onResize_ = function(event) {
  this.viewportSize = this.getViewportSize_();
  var canvasWidth = this.viewportSize.width;
  var canvasHeight = this.viewportSize.height;
  var styleCanvasWidth = canvasWidth + 'px';
  var styleCanvasHeight = canvasHeight + 'px';
  var devicePixelRatio = window.devicePixelRatio || 1.0;
  var renderingCanvasWidth = canvasWidth * devicePixelRatio;
  var renderingCanvasHeight = canvasHeight * devicePixelRatio;

  if (this.engine_.options_['aboveLayer']) {
    this.aboveRenderer_.setSize(canvasWidth, canvasHeight);
    this.aboveCanvas_.style.width = styleCanvasWidth;
    this.aboveCanvas_.style.height = styleCanvasHeight;
    this.aboveCanvas_.width = renderingCanvasWidth;
    this.aboveCanvas_.height = renderingCanvasHeight;
  }

  if (this.engine_.options_['belowLayer']) {
    this.belowRenderer_.setSize(canvasWidth, canvasHeight);
    this.belowCanvas_.style.width = styleCanvasWidth;
    this.belowCanvas_.style.height = styleCanvasHeight;
    this.belowCanvas_.width = renderingCanvasWidth;
    this.belowCanvas_.height = renderingCanvasHeight;
  }

  if (this.engine_.options_['seamLayer']) {
    this.seamRenderer_.setSize(canvasWidth, canvasHeight);
    this.seamCanvas_.style.width = styleCanvasWidth;
    this.seamCanvas_.style.height = styleCanvasHeight;
    this.seamCanvas_.width = renderingCanvasWidth;
    this.seamCanvas_.height = renderingCanvasHeight;
  }

  // This code forces webkit to redraw. It's needed because of a bug where
  // Chrome does not repaint some elements under the fullscreen canvas on
  // browser resize
  document.body.style.display = 'none';
  var unused = document.body.offsetHeight;
  document.body.style.display = 'block';

  if (this.engine_.options_['realtime'] && event)
    this.frame();
};


/**
 * Moves the canvas whenever the page is scrolled
 *
 * @private
 *
 * @param {Event} event Event.
 */
ThreeJsRenderer_.prototype.onScroll_ = function(event) {
  this.targetLeft = window.pageXOffset + 'px';
  this.targetTop = window.pageYOffset + 'px';

  if (this.engine_.options_['realtime'] && event) {
    this.updateCameras_();
    this.render_();
  }
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
    var stencilIntersections = this.engine_.options_['stencils'] ?
        this.findStencilLayerIntersections_() : [];

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
 * Registers window events for scrolling and resizing to update the canvases.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.registerWindowEvents_ = function() {
  log_.information_('Registering for window events');

  // Register the canvasRenderer's onScroll and onResize events with the
  // window so we can adjust our canvas size
  var self = this;
  window.addEventListener('scroll', function(event) {
    self.onScroll_.call(self, event);
  }, false);
  window.addEventListener('resize', function(event) {
    self.onResize_.call(self, event);
  }, false);
};


/**
 * Renders the normal and stencil layers.
 *
 * @private
 */
ThreeJsRenderer_.prototype.render_ = function() {
  if (DEBUG && window['voodoo']['debug']['drawStencils']) {
    // Render just the stencils

    if (this.engine_.options_['stencils']) {
      if (this.engine_.options_['belowLayer']) {
        this.belowRenderer_.context.disable(
            this.belowRenderer_.context.STENCIL_TEST);
        this.belowRenderer_.autoClear = true;
        this.belowRenderer_.render(this.belowStencilScene_.scene_,
            this.belowCamera_.camera_);
      }
    }
    else this.belowRenderer_.clear();

    this.aboveRenderer_.clear();
    this.seamRenderer_.clear();
  } else {
    // Render normally

    if (this.engine_.options_['belowLayer']) {
      if (!this.engine_.options_['stencils'] ||
          (DEBUG && window['voodoo']['debug']['disableStencils'])) {
        this.belowRenderer_.context.disable(
            this.belowRenderer_.context.STENCIL_TEST);
        this.belowRenderer_.autoClear = true;
      } else {
        // Enable stencils and render them onto the below layer
        var context = this.belowRenderer_.context;

        context.enable(context.STENCIL_TEST);
        context.clearStencil(0);
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.NEVER, 1, 0xffffffff);
        this.belowRenderer_.autoClear = false;
        this.belowRenderer_.clear();
        this.belowRenderer_.render(this.belowStencilScene_.scene_,
            this.belowCamera_.camera_);

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

    // Render a narrow slit along the Z axis without antialiasing
    // on top of the above layer to eliminate the seam from antialiasing
    // between layers. The stencil buffer is used so we don't draw on top
    // of content mistakenly.
    if (this.engine_.options_['seamLayer']) {
      var seam = this.engine_.options_.seamPixels_;
      var zCamera = this.seamCamera_['position']['z'];

      var context = this.seamRenderer_.context;
      context.enable(context.STENCIL_TEST);

      this.seamRenderer_.autoClear = false;
      this.seamRenderer_.clear();

      // We use the stencil buffer to only draw seams where they have to be
      // and where they should be. When the stencil buffer is 1, the don't draw
      // anything and where it is 0, we may be drawing a seam.

      if (!this.engine_.options_['stencils'] ||
          (DEBUG && window['voodoo']['debug']['disableStencils'])) {
        // No stencils

        context.clearStencil(0);
      } else {
        // Stencils

        context.clearStencil(1);

        // The seam may only be inside the stencils and in the small seam space
        // above the page.
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.NEVER, 0, 0xffffffff);

        this.seamCamera_.setZNearAndFar_(this.engine_.options_.zNear_,
            this.engine_.options_.zFar_);
        this.seamRenderer_.render(this.seamStencilScene_.scene_,
            this.seamCamera_.camera_);

        this.seamCamera_.setZNearAndFar_(zCamera - seam, zCamera);
        this.seamRenderer_.render(this.seamScene_.scene_,
            this.seamCamera_.camera_);
      }

      // No seams may overlap content above the seam space.
      context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
      context.stencilFunc(context.NEVER, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(this.engine_.options_.zNear_,
          zCamera - seam);
      this.seamRenderer_.render(this.seamScene_.scene_,
          this.seamCamera_.camera_);

      // Draw what's remaining normally and it will be our seam.
      context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
      context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(zCamera - seam, zCamera + seam);
      this.seamRenderer_.render(this.seamScene_.scene_,
          this.seamCamera_.camera_);
    }
  }

  // Force rendering to complete on all layers so there is no slicing from
  // timing differences. Then move the canvases to the target position right
  // after we render.
  if (this.engine_.options_['aboveLayer']) {
    this.aboveRenderer_.context.finish();
    this.aboveCanvas_.style.left = this.targetLeft;
    this.aboveCanvas_.style.top = this.targetTop;
  }
  if (this.engine_.options_['belowLayer']) {
    this.belowRenderer_.context.finish();
    this.belowCanvas_.style.left = this.targetLeft;
    this.belowCanvas_.style.top = this.targetTop;
  }
  if (this.engine_.options_['seamLayer']) {
    this.seamRenderer_.context.finish();
    this.seamCanvas_.style.left = this.targetLeft;
    this.seamCanvas_.style.top = this.targetTop;
  }
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

  this.updateCameras_();

  // Update each model
  var models = this.engine_.models_;
  for (var modelIndex = 0; modelIndex < models.length; ++modelIndex)
    models[modelIndex].update(deltaTime);

  // Tell the dispatcher to dispatch all frame-based events.
  this.engine_.dispatcher_.update();
};


/**
 * Updates the cameras each frame.
 *
 * @private
 */
ThreeJsRenderer_.prototype.updateCameras_ = function() {
  // Update the cameras
  if (this.engine_.options_['aboveLayer'])
    this.aboveCamera_.update_();
  if (this.engine_.options_['belowLayer'])
    this.belowCamera_.update_();
  if (this.engine_.options_['seamLayer'])
    this.seamCamera_.update_();
  if (this.pendingUpdateLayerZBoundaries_) {
    this.updateLayerZBoundaries_();
    this.pendingUpdateLayerZBoundaries_ = false;
  }

  // Dispatch cameramove events
  if ((this.engine_.options_['aboveLayer'] &&
      this.aboveCamera_.pendingCameraMoveEvent_) ||
      (this.engine_.options_['belowLayer'] &&
      this.belowCamera_.pendingCameraMoveEvent_) ||
      (this.engine_.options_['seamLayer'] &&
      this.seamCamera_.pendingCameraMoveEvent_)) {
    var models = this.engine_.models_;
    var event = new window['voodoo']['Event']('cameramove');
    for (var modelIndex = 0; modelIndex < models.length; ++modelIndex)
      models[modelIndex].dispatchEvent_(event);

    if (this.engine_.options_['aboveLayer'])
      this.aboveCamera_.pendingCameraMoveEvent_ = false;
    if (this.engine_.options_['belowLayer'])
      this.belowCamera_.pendingCameraMoveEvent_ = false;
    if (this.engine_.options_['seamLayer'])
      this.seamCamera_.pendingCameraMoveEvent_ = false;
  }
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
    this.aboveCamera_.setZNearAndFar_(this.engine_.options_.zNear_, zCamera);
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
