// ----------------------------------------------------------------------------
// File: ThreeJsRenderer.js
//
// Copyright (c) 2014 VoodooJs Authors
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
  log_.assert_(engine, 'engine must be valid.',
      '(ThreeJsRenderer_::ThreeJsRenderer_)');

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
  else this.fpsTimer_ = null;
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
 * This is called by the mouse detector.
 *
 * @private
 *
 * @param {boolean} capture Whether to capture mouse events or not.
 */
ThreeJsRenderer_.prototype.capturePointerEvents_ = function(capture) {
  var engineOptions = this.engine_.options_;

  if (capture) {
    if (engineOptions['aboveLayer'])
      this.aboveCanvas_.style['pointerEvents'] = 'auto';

    if (engineOptions['belowLayer'])
      this.belowCanvas_.style['pointerEvents'] = 'auto';

    if (engineOptions['seamLayer'])
      this.seamCanvas_.style['pointerEvents'] = 'auto';
  } else {
    if (engineOptions['aboveLayer'])
      this.aboveCanvas_.style['pointerEvents'] = 'none';

    if (engineOptions['belowLayer'])
      this.belowCanvas_.style['pointerEvents'] = 'none';

    if (engineOptions['seamLayer'])
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
  log_.info_('Creating WebGL renderers');

  // This reduced by 1/2 when the FPS drops below 45 for a few frames.
  this.canvasScale_ = 1.0;

  var engineOptions = this.engine_.options_;
  var enableAboveLayer = engineOptions['aboveLayer'];
  var enableBelowLayer = engineOptions['belowLayer'];

  var webGlOptions = {
    antialias: engineOptions['antialias'],
    alpha: true
  };

  // Create the canvas for the above layer.
  if (enableAboveLayer) {
    this.aboveRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.aboveCanvas_ = this.aboveRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.aboveRenderer_);
    this.aboveCanvas_.style.zIndex = engineOptions['aboveZIndex'];
  }

  // Create the canvas for the below layer.
  if (enableBelowLayer) {
    this.belowRenderer_ = new THREE.WebGLRenderer(webGlOptions);
    this.belowCanvas_ = this.belowRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.belowRenderer_);
    this.belowCanvas_.style.zIndex = engineOptions['belowZIndex'];
  }

  // Check whether antialiasing is actually being used. The seam layer is only
  // supported when antialiasing is on.
  var antialiasSupported = (enableAboveLayer &&
      this.aboveRenderer_.context.getContextAttributes().antialias) ||
      (enableBelowLayer &&
      this.belowRenderer_.context.getContextAttributes().antialias);
  if (!antialiasSupported) {
    engineOptions['antialias'] = false;
    engineOptions['seamLayer'] = false;
  }

  // Require both above and below layers to have a seam layer.
  if (!enableAboveLayer || !enableBelowLayer)
    engineOptions['seamLayer'] = false;

  // Create the canvas for the seam layer.
  if (engineOptions['seamLayer']) {
    // The seam layer always has antialiasing off to blend the layers.
    var seamWebGlOptions = {
      antialias: false,
      alpha: true
    };

    this.seamRenderer_ = new THREE.WebGLRenderer(seamWebGlOptions);
    this.seamCanvas_ = this.seamRenderer_.domElement;
    this.setupFullscreenCanvasRenderer_(this.seamRenderer_);
    this.seamCanvas_.style.zIndex = engineOptions['seamZIndex'];
  }

  this.onResize_(false);
  this.onScroll_(false);
};


/**
 * Creates the above and below layers, their scenes and cameras.
 *
 * This is called internally during ThreeJsRenderer_'s constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.createLayers_ = function() {
  log_.info_('Creating layers');

  var engineOptions = this.engine_.options_;
  var renderer = engineOptions['renderer'];
  var fov = engineOptions['fov'];
  var zNear = engineOptions.zNear_;
  var zFar = engineOptions.zFar_;

  // Create the above layer
  if (engineOptions['aboveLayer']) {
    this.aboveCamera_ = new ThreeJsCamera_(this.aboveCanvas_,
        fov, zNear, zFar);

    this.aboveSceneFactory_ = new ThreeJsSceneFactory_();

    this.aboveTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.aboveCacheFactory_ = new CacheFactory_();

    this.aboveLayer_ = new Layer_(LayerPass_['Above'], renderer,
        this.aboveCamera_, this.aboveSceneFactory_, this.aboveTriggersFactory_,
        this.aboveCacheFactory_);

    this.layers_.push(this.aboveLayer_);
  }

  // Create the below and stencil layer
  if (engineOptions['belowLayer']) {
    this.belowCamera_ = new ThreeJsCamera_(this.belowCanvas_,
        fov, zNear, zFar);

    this.belowSceneFactory_ = new ThreeJsSceneFactory_();
    this.belowTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.belowCacheFactory_ = new CacheFactory_();
    this.belowLayer_ = new Layer_(LayerPass_['Below'], renderer,
        this.belowCamera_, this.belowSceneFactory_, this.belowTriggersFactory_,
        this.belowCacheFactory_);
    this.layers_.push(this.belowLayer_);

    if (engineOptions['stencils']) {
      this.stencilCamera_ = new ThreeJsCamera_(this.belowCanvas_,
          fov, zNear, zFar);

      this.belowStencilSceneFactory_ = new ThreeJsSceneFactory_();
      this.belowStencilTriggersFactory_ = new ThreeJsTriggersFactory_();
      this.belowStencilCacheFactory_ = new CacheFactory_();
      this.belowStencilLayer_ = new Layer_(LayerPass_['BelowStencil'], renderer,
          this.stencilCamera_, this.belowStencilSceneFactory_,
          this.belowStencilTriggersFactory_, this.belowStencilCacheFactory_);
      this.layers_.push(this.belowStencilLayer_);
    }
  }

  // Create the seam layer and seam stencil layer
  if (engineOptions['seamLayer']) {
    this.seamCamera_ = new ThreeJsCamera_(this.seamCanvas_,
        fov, zNear, zFar);

    this.seamSceneFactory_ = new ThreeJsSceneFactory_();

    // The triggers for the seam layer aren't actually used. We just
    // create one so as not to break user code.
    this.seamTriggersFactory_ = new ThreeJsTriggersFactory_();
    this.seamCacheFactory_ = new CacheFactory_();

    this.seamLayer_ = new Layer_(LayerPass_['Seam'], renderer,
        this.seamCamera_, this.seamSceneFactory_, this.seamTriggersFactory_,
        this.seamCacheFactory_);

    this.layers_.push(this.seamLayer_);

    if (engineOptions['stencils']) {
      if (!this.stencilCamera_)
        this.stencilCamera_ = new ThreeJsCamera_(this.seamCanvas_,
            fov, zNear, zFar);

      this.seamStencilSceneFactory_ = new ThreeJsSceneFactory_();
      this.seamStencilTriggersFactory_ = new ThreeJsTriggersFactory_();
      this.seamStencilCacheFactory_ = new CacheFactory_();
      this.seamStencilLayer_ = new Layer_(LayerPass_['SeamStencil'], renderer,
          this.stencilCamera_, this.seamStencilSceneFactory_,
          this.seamStencilTriggersFactory_, this.seamStencilCacheFactory_);
      this.layers_.push(this.seamStencilLayer_);
    }
  }

  this.pendingUpdateLayerZBoundaries_ = false;
  this.updateLayerZBoundaries_();
  var that = this;
  window.addEventListener('resize', function() {
    that.pendingUpdateLayerZBoundaries_ = true;
  }, false);
};


/**
 * Shuts down the rendering engine.
 *
 * @private
 */
ThreeJsRenderer_.prototype.destroy_ = function() {
  var engineOptions = this.engine_.options_;
  var documentBody = document.body;

  if (engineOptions['aboveLayer'])
    documentBody.removeChild(this.aboveCanvas_);

  if (engineOptions['belowLayer'])
    documentBody.removeChild(this.belowCanvas_);

  if (engineOptions['seamLayer'])
    documentBody.removeChild(this.seamCanvas_);

  if (DEBUG || engineOptions['performanceScaling'])
    this.fpsTimer_.destroy_();
};


/**
 * Determines if a layer needs to be rendered again.
 *
 * @private
 *
 * @param {Layer_} layer Layer to check.
 * @return {boolean} True if a layer needs to be rendered. False if not.
 */
ThreeJsRenderer_.prototype.isRenderNeeded_ = function(layer) {
  if (this.isDirty_)
    return true;

  if (!layer)
    return false;

  return layer.isRenderNeeded_();
};


/**
 * Marks the renderer as dirty forcing a re-render.
 *
 * @private
 */
ThreeJsRenderer_.prototype.markDirty_ = function() {
  this.isDirty_ = true;
};


/**
 * Called when the window loses focus.
 *
 * @private
 */
ThreeJsRenderer_.prototype.onBlur_ = function() {
  // No-op.
};


/**
 * Called when the window regains focus.
 *
 * @private
 */
ThreeJsRenderer_.prototype.onFocus_ = function() {
  // Reset the performance scaling detection timer.
  this.lastValidFpsTime_ = new Date();
};


/**
 * Resizes the canvas whenever the browser is resized
 *
 * @private
 *
 * @param {boolean} rerender Whether to re-render if realtime is enabled.
 */
ThreeJsRenderer_.prototype.onResize_ = function(rerender) {
  this.updateViewportSize_();

  var viewportSize = this.viewportSize_;
  var canvasWidth = viewportSize.width;
  var canvasHeight = viewportSize.height;

  var styleCanvasWidth = canvasWidth + 'px';
  var styleCanvasHeight = canvasHeight + 'px';

  var devicePixelRatio = window.devicePixelRatio || 1.0;
  var renderingCanvasWidth = canvasWidth * devicePixelRatio *
      this.canvasScale_;
  var renderingCanvasHeight = canvasHeight * devicePixelRatio *
      this.canvasScale_;


  function setRenderSize(renderer, canvas) {
    renderer.setViewport(0, 0, renderingCanvasWidth, renderingCanvasHeight);

    var canvasStyle = canvas.style;
    canvasStyle.width = styleCanvasWidth;
    canvasStyle.height = styleCanvasHeight;

    canvas.width = renderingCanvasWidth;
    canvas.height = renderingCanvasHeight;
  }


  var engineOptions = this.engine_.options_;

  if (engineOptions['aboveLayer'])
    setRenderSize(this.aboveRenderer_, this.aboveCanvas_);

  if (engineOptions['belowLayer'])
    setRenderSize(this.belowRenderer_, this.belowCanvas_);

  if (engineOptions['seamLayer'])
    setRenderSize(this.seamRenderer_, this.seamCanvas_);


  // This code forces webkit to redraw. It's needed because of a bug where
  // Chrome does not repaint some elements under the fullscreen canvas on
  // browser resize

  var documentBody = document.body;
  var documentBodyStyle = documentBody.style;

  documentBodyStyle.display = 'none';
  var unused = documentBody.offsetHeight;
  documentBodyStyle.display = 'block';


  this.isDirty_ = true;

  if (engineOptions['realtime'] && rerender)
    this.render_();
};


/**
 * Moves the canvas whenever the page is scrolled
 *
 * @private
 *
 * @param {boolean} rerender Whether to re-render if realtime is enabled.
 */
ThreeJsRenderer_.prototype.onScroll_ = function(rerender) {
  this.targetLeft = window.pageXOffset + 'px';
  this.targetTop = window.pageYOffset + 'px';

  this.isDirty_ = true;

  if (this.engine_.options_['realtime'] && rerender)
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
  log_.info_('Registering for window events');

  // Register the canvasRenderer's onScroll and onResize events with the
  // window so we can adjust our canvas size
  var that = this;
  window.addEventListener('scroll', function(event) {
    that.onScroll_.call(that, true);
  }, false);
  window.addEventListener('resize', function(event) {
    that.onResize_.call(that, true);
  }, false);
};


/**
 * Renders the normal and stencil layers.
 *
 * @private
 */
ThreeJsRenderer_.prototype.render_ = function() {
  var rendered = false;

  var engineOptions = this.engine_.options_;
  var enableAboveLayer = engineOptions['aboveLayer'];
  var enableBelowLayer = engineOptions['belowLayer'];
  var enableSeamLayer = engineOptions['seamLayer'];
  var enableStencils = engineOptions['stencils'];
  var enablePerformanceScaling = engineOptions['performanceScaling'];

  var voodooDebug = window['voodoo']['debug'];
  var debugDrawStencils = voodooDebug['drawStencils'];
  var debugDisableStencils = voodooDebug['disableStencils'];

  this.updateCameras_();

  // Detect performance drops and drop the canvas resolution if it's bad.
  if (DEBUG || enablePerformanceScaling) {
    this.fpsTimer_.frame_();

    if (enablePerformanceScaling && !this.performanceScaling_) {

      var fps = this.fpsTimer_.fps_;
      if (fps > engineOptions.performanceScalingFpsThreshold_ ||
          this.engine_.lastTicks_ === 0) {

        this.lastValidFpsTime_ = new Date();

      } else {

        var now = new Date();
        var seconds = (now - this.lastValidFpsTime_) / 1000;
        if (seconds > engineOptions.performanceScalingTimeLimit_) {
          log_.info_('Enabling performance scaling');

          this.canvasScale_ = 0.5;
          this.performanceScaling_ = true;
          this.onResize_(false);
        }

      }
    }
  }

  if (DEBUG && debugDrawStencils) {

    // Render just the stencils

    if (enableStencils) {
      if (enableBelowLayer && this.isRenderNeeded_(this.belowStencilLayer_)) {
        var belowRendererContext = this.belowRenderer_.context;

        belowRendererContext.disable(belowRendererContext.STENCIL_TEST);
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

    if (enableBelowLayer && (this.isRenderNeeded_(this.belowLayer_) ||
        this.isRenderNeeded_(this.belowStencilLayer_))) {

      if (!enableStencils || (DEBUG && debugDisableStencils)) {
        var belowRendererContext = this.belowRenderer_.context;

        belowRendererContext.disable(belowRendererContext.STENCIL_TEST);
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
            this.stencilCamera_.camera_);

        context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
        context.stencilFunc(context.EQUAL, 1, 0xffffffff);
      }

      this.belowRenderer_.render(this.belowSceneFactory_.scene_,
          this.belowCamera_.camera_);

      rendered = true;
    }

    if (enableAboveLayer && this.isRenderNeeded_(this.aboveLayer_)) {

      this.aboveRenderer_.render(this.aboveSceneFactory_.scene_,
          this.aboveCamera_.camera_);

      rendered = true;
    }

    // Render a narrow slit along the Z axis without antialiasing
    // on top of the above layer to eliminate the seam from antialiasing
    // between layers. The stencil buffer is used so we don't draw on top
    // of content mistakenly.

    if (enableSeamLayer && (this.isRenderNeeded_(this.seamLayer_) ||
        this.isRenderNeeded_(this.seamStencilLayer_))) {

      var seam = engineOptions.seamPixels_;
      var zCamera = this.seamCamera_['position']['z'];
      var zNear = zCamera - seam;
      var zFar = zCamera + seam;

      var context = this.seamRenderer_.context;
      context.enable(context.STENCIL_TEST);

      this.seamRenderer_.autoClear = false;
      this.seamRenderer_.clear();

      // We use the stencil buffer to only draw seams where they have to be
      // and where they should be. When the stencil buffer is 1, the don't draw
      // anything and where it is 0, we may be drawing a seam.

      if (!enableStencils || (DEBUG && debugDisableStencils)) {
        // No stencils

        context.clearStencil(0);
      } else {
        // Stencils

        context.clearStencil(1);

        // The seam may only be inside the stencils and in the small seam space
        // above the page.
        context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
        context.stencilFunc(context.NEVER, 0, 0xffffffff);

        this.seamRenderer_.render(this.seamStencilSceneFactory_.scene_,
            this.stencilCamera_.camera_);

        this.seamCamera_.setZNearAndFar_(zNear, zCamera);
        this.seamRenderer_.render(this.seamSceneFactory_.scene_,
            this.seamCamera_.camera_);
      }

      var seamSceneFactoryScene = this.seamSceneFactory_.scene_;
      var seamCameraCamera = this.seamCamera_.camera_;

      // No seams may overlap content above the seam space.
      context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
      context.stencilFunc(context.NEVER, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(engineOptions.zNear_, zNear);
      this.seamRenderer_.render(seamSceneFactoryScene, seamCameraCamera);

      // Draw what's remaining normally and it will be our seam.
      context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
      context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

      this.seamCamera_.setZNearAndFar_(zNear, zFar);
      this.seamRenderer_.render(seamSceneFactoryScene, seamCameraCamera);

      rendered = true;
    }
  }

  // Force rendering to complete on all layers so there is no slicing from
  // timing differences. Then move the canvases to the target position right
  // after we render.

  if (engineOptions['aboveLayer']) {
    this.aboveRenderer_.context.finish();

    var aboveCanvasStyle = this.aboveCanvas_.style;
    aboveCanvasStyle.left = this.targetLeft;
    aboveCanvasStyle.top = this.targetTop;
  }

  if (engineOptions['belowLayer']) {
    this.belowRenderer_.context.finish();

    var belowCanvasStyle = this.belowCanvas_.style;
    belowCanvasStyle.left = this.targetLeft;
    belowCanvasStyle.top = this.targetTop;
  }

  if (engineOptions['seamLayer']) {
    this.seamRenderer_.context.finish();

    var seamCanvasStyle = this.seamCanvas_.style;
    seamCanvasStyle.left = this.targetLeft;
    seamCanvasStyle.top = this.targetTop;
  }

  this.isDirty_ = false;

  if (this.aboveLayer_) this.aboveLayer_.clearDirtyFlags_();
  if (this.belowLayer_) this.belowLayer_.clearDirtyFlags_();
  if (this.belowStencilLayer_) this.belowStencilLayer_.clearDirtyFlags_();
  if (this.seamLayer_) this.seamLayer_.clearDirtyFlags_();
  if (this.seamStencilLayer_) this.seamStencilLayer_.clearDirtyFlags_();

  if (rendered && this.fpsTimer_)
    this.fpsTimer_.render_();
};


/**
 * Sets the current mouse cursor on the canvases.
 *
 * @private
 *
 * @param {string} cursor CSS cursor style.
 */
ThreeJsRenderer_.prototype.setCursor_ = function(cursor) {
  log_.assert_(cursor, 'cursor must be valid.',
      '(ThreeJsRenderer_::setCursor_)');

  var engineOptions = this.engine_.options_;

  if (engineOptions['aboveLayer'])
    this.aboveCanvas_.style['cursor'] = cursor;

  if (engineOptions['belowLayer'])
    this.belowCanvas_.style['cursor'] = cursor;

  if (engineOptions['seamLayer'])
    this.seamCanvas_.style['cursor'] = cursor;
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
  log_.assert_(canvasRenderer, 'canvasRenderer must be valid.',
      '(ThreeJsRenderer_::setupFullscreenCanvasRenderer_)');

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

  if (this.aboveCamera_) this.aboveCamera_.update_();
  if (this.belowCamera_) this.belowCamera_.update_();
  if (this.seamCamera_) this.seamCamera_.update_();
  if (this.stencilCamera_) this.stencilCamera_.update_();

  if (this.pendingUpdateLayerZBoundaries_) {
    this.updateLayerZBoundaries_();
    this.pendingUpdateLayerZBoundaries_ = false;
  }

  // Dispatch cameramove events

  if ((this.aboveCamera_ && this.aboveCamera_.pendingCameraMoveEvent_) ||
      (this.belowCamera_ && this.belowCamera_.pendingCameraMoveEvent_) ||
      (this.seamCamera_ && this.seamCamera_.pendingCameraMoveEvent_) ||
      (this.stencilCamera_ && this.stencilCamera_.pendingCameraMoveEvent_)) {

    var models = this.engine_.models_;
    var event = new window['voodoo']['Event']('cameramove');

    for (var modelIndex = 0, numModels = models.length; modelIndex < numModels;
        ++modelIndex)
      models[modelIndex]['dispatch'](event);

    if (this.aboveCamera_) this.aboveCamera_.pendingCameraMoveEvent_ = false;
    if (this.belowCamera_) this.belowCamera_.pendingCameraMoveEvent_ = false;
    if (this.seamCamera_) this.seamCamera_.pendingCameraMoveEvent_ = false;
    if (this.stencilCamera_)
      this.stencilCamera_.pendingCameraMoveEvent_ = false;
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
  var engineOptions = this.engine_.options_;
  var enableAboveLayer = engineOptions['aboveLayer'];
  var enableBelowLayer = engineOptions['belowLayer'];

  // We subtract -0.5 from where we should cut off the Z so there is no seam
  // between renders.

  if (enableBelowLayer) {
    if (enableAboveLayer) {
      var zCamera = this.belowCamera_['position']['z'];
      this.belowCamera_.setZNearAndFar_(zCamera - 0.5, engineOptions.zFar_);
    } else {
      this.belowCamera_.setZNearAndFar_(engineOptions.zNear_,
          engineOptions.zFar_);
    }
  }

  if (enableAboveLayer) {
    if (enableBelowLayer) {
      var zCamera = this.aboveCamera_['position']['z'];
      this.aboveCamera_.setZNearAndFar_(engineOptions.zNear_, zCamera);
    } else {
      this.aboveCamera_.setZNearAndFar_(engineOptions.zNear_,
          engineOptions.zFar_);
    }
  }
};


/**
 * Gets the size of the client area of the browser.
 *
 * @private
 */
ThreeJsRenderer_.prototype.updateViewportSize_ = function() {
  var testDiv = document.createElement('div');
  var documentElement = document.documentElement;

  testDiv.style.cssText =
      'position: fixed; top: 0; left: 0; bottom: 0; right: 0;';
  documentElement.insertBefore(testDiv, documentElement.firstChild);

  this.viewportSize_ = new Size2_(testDiv.offsetWidth, testDiv.offsetHeight);
  documentElement.removeChild(testDiv);
};


/**
 * Performs initial checks to make sure the graphics engine will work.
 *
 * This is called internally during the renderer's constructor.
 *
 * @private
 */
ThreeJsRenderer_.prototype.validateAndPrepareWebpage_ = function() {
  log_.info_('Validating and preparing webpage for use');

  // Set the body dimensions to 100% so the canvas sizes can be set to 100%
  // and there will be no scroll bars.

  log_.assert_(document.body, 'document.body is undefined',
      '(ThreeJsRenderer_::validateAndPrepareWebpage_)');

  var documentBodyStyle = document.body.style;
  documentBodyStyle.width = '100%';
  documentBodyStyle.height = '100%';

  // This tells the browser not to add scroll bars for full screen canvases.
  // Consequently, it also removes the nice looking margins from the body.
  // The only alternative to this is to set:
  //    document.body.style.overflow = 'hidden';
  // which prevents scrolling altogether. No good solution here :(

  documentBodyStyle.margin = 0 + 'px';
};


/**
 * The layers of rendering space.
 *
 * @private
 */
ThreeJsRenderer_.prototype.layers_ = null;
