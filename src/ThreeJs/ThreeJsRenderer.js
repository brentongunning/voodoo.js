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

  this.validateAndPrepareWebpage_();
  this.createFullscreenRenderers_();
  this.createLayers_();
  this.registerWindowEvents_();

  if (DEBUG || this.engine_.options_['performanceScaling']) {
    this.fpsTimer_ = new FpsTimer_();
    this.lastValidFpsTime_ = new Date();
    this.performanceScaling_ = false;
  }
}


/**
 * Inherit from RenderingEngine_.
 */
ThreeJsRenderer_.prototype = new RenderingEngine_();


/**
 * Set the constructor back.
 */
ThreeJsRenderer_.prototype.constructor = ThreeJsRenderer_.constructor;


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
 * Resets all dirty flags on all objects in a layer.
 *
 * @private
 *
 * @param {Layer_} layer Layer to clear.
 */
ThreeJsRenderer_.prototype.clearDirtyFlags_ = function(layer) {
  if (!layer || typeof layer === 'undefined')
    return;

  for (var viewIndex in layer.views_)
    layer.views_[viewIndex]['scene'].isDirty_ = false;
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

  // This reduced by 1/2 when the FPS drops below 45 for a few frames.
  this.canvasScale_ = 1.0;

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

    this.aboveSceneFactory_ = new ThreeJsSceneFactory_();

    this.aboveTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.aboveCacheFactory_ = new CacheFactory_();

    this.aboveLayer_ = new Layer_(LayerPass_['Above'], renderer,
        this.aboveCamera_, this.aboveSceneFactory_, this.aboveTriggersFactory_,
        this.aboveCacheFactory_);

    this.layers_.push(this.aboveLayer_);
  }

  // Create the below and stencil layer
  if (this.engine_.options_['belowLayer']) {
    this.belowCamera_ = new ThreeJsCamera_(this.belowCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.belowSceneFactory_ = new ThreeJsSceneFactory_();
    this.belowTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.belowCacheFactory_ = new CacheFactory_();
    this.belowLayer_ = new Layer_(LayerPass_['Below'], renderer,
        this.belowCamera_, this.belowSceneFactory_, this.belowTriggersFactory_,
        this.belowCacheFactory_);
    this.layers_.push(this.belowLayer_);

    if (this.engine_.options_['stencils']) {
      this.belowStencilSceneFactory_ = new ThreeJsSceneFactory_();
      this.belowStencilTriggersFactory_ = new ThreeJsTriggersFactory_();
      this.belowStencilCacheFactory_ = new CacheFactory_();
      this.belowStencilLayer_ = new Layer_(LayerPass_['BelowStencil'], renderer,
          this.belowCamera_, this.belowStencilSceneFactory_,
          this.belowStencilTriggersFactory_, this.belowStencilCacheFactory_);
      this.layers_.push(this.belowStencilLayer_);
    }
  }

  // Create the seam layer and seam stencil layer
  if (this.engine_.options_['seamLayer']) {
    this.seamCamera_ = new ThreeJsCamera_(this.seamCanvas_,
        this.engine_.options_['fovY'],
        this.engine_.options_.zNear_,
        this.engine_.options_.zFar_);

    this.seamSceneFactory_ = new ThreeJsSceneFactory_();

    // The triggers for the seam layer aren't actually used. We just
    // create one so as not to break user code.
    this.seamTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.seamCacheFactory_ = new CacheFactory_();

    this.seamLayer_ = new Layer_(LayerPass_['Seam'], renderer,
        this.seamCamera_, this.seamSceneFactory_, this.seamTriggersFactory_,
        this.seamCacheFactory_);

    this.layers_.push(this.seamLayer_);

    if (this.engine_.options_['stencils']) {
      this.seamStencilSceneFactory_ = new ThreeJsSceneFactory_();
      this.seamStencilTriggersFactory_ = new ThreeJsTriggersFactory_();
      this.seamStencilCacheFactory_ = new CacheFactory_();
      this.seamStencilLayer_ = new Layer_(LayerPass_['SeamStencil'], renderer,
          this.seamCamera_, this.seamStencilSceneFactory_,
          this.seamStencilTriggersFactory_, this.seamStencilCacheFactory_);
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
 * Shuts down the rendering engine.
 *
 * @private
 */
ThreeJsRenderer_.prototype.destroy_ = function() {
  if (this.engine_.options_['aboveLayer'])
    document.body.removeChild(this.aboveCanvas_);
  if (this.engine_.options_['belowLayer'])
    document.body.removeChild(this.belowCanvas_);
  if (this.engine_.options_['seamLayer'])
    document.body.removeChild(this.seamCanvas_);

  if (DEBUG || this.engine_.options_['performanceScaling'])
    this.fpsTimer_.destroy_();
};


/**
 * Determines if a layer needs to be rendered again.
 *
 * @private
 *
 * @param {Layer_} layer Layer to check.
 * @param {ThreeJsCamera_} camera Camera to use.
 * @return {boolean} True if a layer needs to be rendered. False if not.
 */
ThreeJsRenderer_.prototype.isRenderNeeded_ = function(layer, camera) {
  if (this.isDirty_) {
    return true;
  } else {
    if (!layer || typeof layer === 'undefined')
      return false;

    var frustum = camera.frustum_;
    for (var viewIndex in layer.views_) {
      var view = layer.views_[viewIndex];
      var scene = view['scene'];
      if (scene.isDirty_) {
        var objects = scene.objects_;
        for (var objectIndex in objects) {
          var object = objects[objectIndex];
          if (object['geometry'] && typeof object['geometry'] !== 'undefined') {
            object.updateMatrixWorld(true);
            if (frustum.intersectsObject(object))
              return true;
          }
        }
      }
    }
  }

  return false;
};


/**
 * Resizes the canvas whenever the browser is resized
 *
 * @private
 *
 * @param {Event} event Event.
 */
ThreeJsRenderer_.prototype.onResize_ = function(event) {
  this.updateViewportSize_();
  var canvasWidth = this.viewportSize_.width;
  var canvasHeight = this.viewportSize_.height;
  var styleCanvasWidth = canvasWidth + 'px';
  var styleCanvasHeight = canvasHeight + 'px';
  var devicePixelRatio = window.devicePixelRatio || 1.0;
  var renderingCanvasWidth = canvasWidth * devicePixelRatio *
      this.canvasScale_;
  var renderingCanvasHeight = canvasHeight * devicePixelRatio *
      this.canvasScale_;

  if (this.engine_.options_['aboveLayer']) {
    this.aboveRenderer_.setSize(renderingCanvasWidth, renderingCanvasHeight);
    this.aboveCanvas_.style.width = styleCanvasWidth;
    this.aboveCanvas_.style.height = styleCanvasHeight;
    this.aboveCanvas_.width = renderingCanvasWidth;
    this.aboveCanvas_.height = renderingCanvasHeight;
  }

  if (this.engine_.options_['belowLayer']) {
    this.belowRenderer_.setSize(renderingCanvasWidth, renderingCanvasHeight);
    this.belowCanvas_.style.width = styleCanvasWidth;
    this.belowCanvas_.style.height = styleCanvasHeight;
    this.belowCanvas_.width = renderingCanvasWidth;
    this.belowCanvas_.height = renderingCanvasHeight;
  }

  if (this.engine_.options_['seamLayer']) {
    this.seamRenderer_.setSize(renderingCanvasWidth, renderingCanvasHeight);
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

  this.isDirty_ = true;

  if (this.engine_.options_['realtime'] && event)
    this.engine_['frame']();
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

  this.isDirty_ = true;

  if (this.engine_.options_['realtime'] && event)
    this.render_();
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
  var rendered = false;

  this.updateCameras_();

  // Detect performance drops and drop the canvas resolution if it's bad.
  if (DEBUG || this.engine_.options_['performanceScaling']) {
    this.fpsTimer_.frame_();

    if (this.engine_.options_['performanceScaling'] &&
        !this.performanceScaling_) {
      if (this.fpsTimer_.fps_ >
          this.engine_.options_.performanceScalingFpsThreshold_ ||
          this.lastTicks_ == 0) {
        this.lastValidFpsTime_ = new Date();
      } else {
        var now = new Date();
        var seconds = (now - this.lastValidFpsTime_) / 1000;
        if (seconds > this.engine_.options_.performanceScalingTimeLimit_) {
          log_.information_('Enabling performance scaling');

          this.canvasScale_ = 0.5;
          this.performanceScaling_ = true;
          this.onResize_(null);
        }
      }
    }
  }

  if (DEBUG && window['voodoo']['debug']['drawStencils']) {
    // Render just the stencils

    if (this.engine_.options_['stencils']) {
      if (this.engine_.options_['belowLayer'] &&
          this.isRenderNeeded_(this.belowStencilLayer_, this.belowCamera_)) {
        this.belowRenderer_.context.disable(
            this.belowRenderer_.context.STENCIL_TEST);
        this.belowRenderer_.autoClear = true;
        this.belowRenderer_.render(this.belowStencilSceneFactory_.scene_,
            this.belowCamera_.camera_);

        rendered = true;
      }
    }
    else this.belowRenderer_.clear();

    this.aboveRenderer_.clear();
    this.seamRenderer_.clear();
  } else {
    // Render normally

    if (this.engine_.options_['belowLayer'] &&
        (this.isRenderNeeded_(this.belowLayer_, this.belowCamera_) ||
        this.isRenderNeeded_(this.belowStencilLayer_, this.belowCamera_))) {
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
        this.belowRenderer_.render(this.belowStencilSceneFactory_.scene_,
            this.belowCamera_.camera_);

        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
        context.stencilFunc(context.EQUAL, 1, 0xffffffff);
      }

      this.belowRenderer_.render(this.belowSceneFactory_.scene_,
          this.belowCamera_.camera_);

      rendered = true;
    }

    if (this.engine_.options_['aboveLayer'] &&
        this.isRenderNeeded_(this.aboveLayer_, this.aboveCamera_)) {
      this.aboveRenderer_.render(this.aboveSceneFactory_.scene_,
          this.aboveCamera_.camera_);

      rendered = true;
    }

    // Render a narrow slit along the Z axis without antialiasing
    // on top of the above layer to eliminate the seam from antialiasing
    // between layers. The stencil buffer is used so we don't draw on top
    // of content mistakenly.
    if (this.engine_.options_['seamLayer'] &&
        (this.isRenderNeeded_(this.seamLayer_, this.seamCamera_) ||
        this.isRenderNeeded_(this.seamStencilLayer_, this.seamCamera_))) {
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
        this.seamRenderer_.render(this.seamStencilSceneFactory_.scene_,
            this.seamCamera_.camera_);

        this.seamCamera_.setZNearAndFar_(zCamera - seam, zCamera);
        this.seamRenderer_.render(this.seamSceneFactory_.scene_,
            this.seamCamera_.camera_);
      }

      // No seams may overlap content above the seam space.
      context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
      context.stencilFunc(context.NEVER, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(this.engine_.options_.zNear_,
          zCamera - seam);
      this.seamRenderer_.render(this.seamSceneFactory_.scene_,
          this.seamCamera_.camera_);

      // Draw what's remaining normally and it will be our seam.
      context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
      context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(zCamera - seam, zCamera + seam);
      this.seamRenderer_.render(this.seamSceneFactory_.scene_,
          this.seamCamera_.camera_);

      rendered = true;
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

  this.isDirty_ = false;
  this.clearDirtyFlags_(this.aboveLayer_);
  this.clearDirtyFlags_(this.belowLayer_);
  this.clearDirtyFlags_(this.belowStencilLayer_);
  this.clearDirtyFlags_(this.seamLayer_);
  this.clearDirtyFlags_(this.seamStencilLayer_);

  if (rendered)
    this.fpsTimer_.render_();
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
 * Gets the size of the client area of the browser.
 *
 * @private
 */
ThreeJsRenderer_.prototype.updateViewportSize_ = function() {
  var testDiv = document.createElement('div');

  testDiv.style.cssText =
      'position: fixed; top: 0; left: 0; bottom: 0; right: 0;';
  document.documentElement.insertBefore(testDiv,
      document.documentElement.firstChild);

  this.viewportSize_ = new Size2_(testDiv.offsetWidth, testDiv.offsetHeight);
  document.documentElement.removeChild(testDiv);
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
