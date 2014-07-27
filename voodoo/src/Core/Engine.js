// ------------------------------------------------------------------------------------------------
// File: Engine.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Voodoo's main engine. It manages the renderer, the mouse detector, and all of the models. There
 * can only be one engine per page and the user is responsible for creating it. If the user does
 * not create an engine and assign it to voodoo.engine, then one will be created automatically with
 * default options when the first model is instantiated.
 *
 * @constructor
 *
 * @param {Options|Object=} opt_options Options for voodoo.
 */
function Engine(opt_options) {
  var options = new Options(opt_options);

  log_.assert_(options['renderer'] === Renderer['ThreeJs'], 'Only ThreeJs is supported.',
      '(Engine::Engine)');

  log_.info_('Creating Engine');
  log_.info_('   version: ' + VERSION);
  log_.info_('   userAgent: ' + navigator.userAgent);
  for (var property in options) {
    if (options.hasOwnProperty(property))
      log_.info_('   options.' + property + ': ' + options[property]);
  }

  // Check for WebGL support
  if (DEBUG && !window['WebGLRenderingContext']) {
    log_.error_('WebGL not supported.', '(Engine::Engine)');
  }

  this.options_ = options;
  this.validateOptions_();

  this.modelCacheFactory_ = new CacheFactory_();
  this.tracker_ = new Tracker_();

  // Setup models property
  this.models_ = [];
  var that = this;
  Object.defineProperty(this, 'models', {
    get: function() {
      // Create a copy of all the models. A copy lets the user iterate over and delete models
      // without worrying about invalidating our own list.
      return that.models_.slice(0);
    },
    enumerable: true
  });

  // Create the timer used to measure delta times between frames.
  this.setupDeltaTimer_();

  // Create the renderer
  switch (options['renderer']) {

    case Renderer['ThreeJs']:
      this.renderer_ = new ThreeJsRenderer_(this, this.options_);
      this.raycaster_ = new ThreeJsRaycaster_(this);
      break;

    default:
      this.renderer_ = null;
      this.raycaster_ = null;
      log_.error_('Unsupported renderer', '(Engine::Engine)');
      break;

  }

  // Create the dispatcher for engine events
  this.dispatcher_ = new Dispatcher_();

  // Create the mouse detector
  this.mouseDetector_ = new MouseDetector_(this);

  // At this point we know the engine is valid. Assign it to the global.
  window['voodoo']['engine'] = this;

  // Create the standard lights here. They should be created before any models are created since
  // ThreeJs materials expect to know how many lights are in the scene when they are created to
  // build the shaders properly. We must set voodoo.engine because AmbientLight_ and CameraLight_
  // are both models that will try to create voodoo.engine if it isn't already set.
  if (options['standardLighting']) {
    log_.info_('Creating standard lights');
    new AmbientLight_({'color': 'white'});
    new CameraLight_({'color': 'white'});
  }

  this.updateThread_ = -1;
  this.renderThread_ = -1;
  this.realtimeThread_ = -1;

  var realtimeUpdate = this.options_['updateInterval'] === 0;
  var realtimeRender = this.options_['renderInterval'] === 0;

  if (options['frameLoop']) {
    log_.info_('Beginning frame loop');

    if (realtimeUpdate || realtimeRender)
      this.run_(realtimeUpdate, realtimeRender);

    if (!realtimeUpdate) {
      this.updateThread_ = window.setInterval(function() {
        that.update_();
      }, this.options_['updateInterval']);
    }

    if (!realtimeRender) {
      this.renderThread_ = window.setInterval(function() {
        that.renderer_.render_();
      }, this.options_['renderInterval']);
    }
  }
}


/**
 * Shuts down the engine and stops rendering. After calling this, all models are invalid.
 *
 * @this {Engine}
 */
Engine.prototype['destroy'] = function() {
  log_.info_('Destroying Engine');

  this.dispatcher_.dispatchEvent_(null, new window['voodoo']['Event']('destroy'));

  if (this.updateThread_ !== -1)
    window.clearInterval(this.updateThread_);
  if (this.renderThread_ !== -1)
    window.clearInterval(this.renderThread_);
  if (this.realtimeThread_ !== -1)
    window.cancelAnimationFrame(this.realtimeThread_);

  while (this.models_.length > 0) {
    /** @type {Model} */
    var model = this.models_[0];
    model['destroy']();
  }

  this.models_ = null;

  this.renderer_.destroy_();
  this.mouseDetector_.destroy_();
  this.dispatcher_.destroy_();

  if (typeof window['voodoo']['engine'] !== 'undefined')
    delete window['voodoo']['engine'];

  this.renderer_ = null;
  this.mouseDetector_ = null;
  this.dispatcher_ = null;
  this.models_ = null;
  this.updateThread_ = -1;
  this.renderThread_ = -1;
  this.realtimeThread_ = -1;
  this.options_ = null;
  this.modelCacheFactory_ = null;
  this.tracker_ = null;

  nextModelId_ = 0;
};


/**
 * Runs a single frame of update and render.
 *
 * The user does not need to call this if frameLoop
 * option is set to true, the default option.
 *
 * @this {Engine}
 */
Engine.prototype['frame'] = function() {
  this.update_();
  this.renderer_.render_();
};


/**
 * Removes an event handler.
 *
 * @this {Engine}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Engine.prototype['off'] = function(type, listener) {
  this.dispatcher_.off_(type, listener);
};


/**
 * Adds an event handler. Valid events are destroy, addmodel, and removemodel.
 *
 * @this {Engine}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Engine.prototype['on'] = function(type, listener) {
  this.dispatcher_.on_(type, listener);
};


/**
 * An array of models managed by the engine.
 *
 * @type {Array.<Model>}
 */
Engine.prototype['models'] = null;


/**
 * Adds a model to be updated by the engine.
 *
 * This is called during Model initialization.
 *
 * @private
 *
 * @param {Model} model Model to add.
 */
Engine.prototype.addModel_ = function(model) {
  log_.assert_(model, 'model must be valid.', '(Engine::addModel_)');

  this.models_.push(model);
  this.dispatcher_.dispatchEvent_(null, new window['voodoo']['Event']('addmodel', model));
};


/**
 * Returns whether the window currently has focus.
 *
 * @private
 *
 * @return {boolean} Whether we have focus.
 */
Engine.prototype.hasFocus_ = function() {
  return this.lastTicks_ !== 0;
};


/**
 * Marks the renderer as dirty forcing a re-render.
 *
 * @private
 */
Engine.prototype.markRendererDirty_ = function() {
  this.renderer_.markDirty_();
};


/**
 * Adds a model to be updated by the engine.
 *
 * This is called during Model initialization.
 *
 * @private
 *
 * @param {Model} model Model to remove.
 */
Engine.prototype.removeModel_ = function(model) {
  log_.assert_(model, 'model must be valid.', '(Engine::removeModel_)');

  this.models_.splice(this.models_.indexOf(model), 1);
  this.dispatcher_.dispatchEvent_(null, new window['voodoo']['Event']('removemodel', model));

  // Removing objects always forces a re-render.
  this.renderer_.isDirty_ = true;
};


/**
 * Starts rendering and updating in a frame loop.
 *
 * @private
 *
 * @param {boolean} update Whether to update in the frame loop.
 * @param {boolean} render Whether to render in the frame loop.
 */
Engine.prototype.run_ = function(update, render) {
  var that = this;
  this.realtimeThread_ = requestAnimationFrame(function() {
    that.run_(update, render);
  });

  // Only update and render if we have focus.
  if (this.hasFocus_()) {
    if (update)
      this.update_();
    if (render)
      this.renderer_.render_();
  }
};


/**
 * Sets up the callbacks to start and stop the timer.
 *
 * @private
 */
Engine.prototype.setupDeltaTimer_ = function() {
  log_.info_('Starting timers.');

  var that = this;
  this.lastTicks_ = 0;
  this.lastDeltaTime_ = 0;
  this.focusDelayTimerId_ = 0;

  // Register with the window focus event so we know when the user switches back to our tab. We
  // will reset timing data.
  window.addEventListener('focus', function() {
    log_.info_('Window focus acquired. Starting.');

    that.lastTicks_ = 0;
    that.focusDelayTimerId_ = setTimeout(function() {
      that.lastTicks_ = Date.now();
      that.focusDelayTimerId_ = 0;

      that.renderer_.onFocus_();
    }, that.options_.timerStartOnFocusDelayMs_);
  }, false);

  // Register with the window blur event so that when the user switchs to another tab, we stop the
  // timing so that the animations look like they paused.
  window.addEventListener('blur', function() {
    log_.info_('Window lost focus. Pausing.');

    that.lastTicks_ = 0;
    if (that.focusDelayTimerId_ !== 0) {
      clearTimeout(that.focusDelayTimerId_);
      that.focusDelayTimerId_ = 0;
    }

    that.renderer_.onBlur_();
  }, false);

  // Start animations 1 second after the page loads to minimize hickups
  setTimeout(function() {
    if (!document.hasFocus || document.hasFocus())
      that.lastTicks_ = Date.now();
  }, that.options_.timerStartOnLoadDelayMs_);
};


/**
 * Runs one frame of update.
 *
 * @private
 */
Engine.prototype.update_ = function() {
  // Calculate the time delta between this frame the last in seconds
  var deltaTime = 0;
  var currTicks = Date.now();
  if (this.hasFocus_()) {
    deltaTime = (currTicks - this.lastTicks_) / 1000.0;
    this.lastTicks_ = currTicks;
  }

  // If the delta time is more than twice the last delta time, use the last delta time
  if (deltaTime > this.lastDeltaTime_ * 2) {
    var temp = this.lastDeltaTime_;
    this.lastDeltaTime_ = deltaTime;
    deltaTime = temp;
  } else this.lastDeltaTime_ = deltaTime;

  // Update the HTML element tracker
  this.tracker_.update_();

  // Update each model
  var models = this.models_;
  for (var modelIndex = 0, numModels = models.length; modelIndex < numModels; ++modelIndex)
    models[modelIndex].update(deltaTime);

  // Tell the mouse detector to dispatch all frame-based events.
  this.mouseDetector_.update_();
};


/**
 * Checks that the options are valid.
 *
 * @private
 */
Engine.prototype.validateOptions_ = function() {
  // Check that there is at least one layer
  if (!this.options_['aboveLayer'] && !this.options_['belowLayer']) {
    log_.error_('At least one layer must be enabled.', '(Engine::validateOptions_)');
  }
};


/**
 * The main mouse event detector.
 *
 * @private
 * @type {MouseDetector_}
 */
Engine.prototype.mouseDetector_ = null;


/**
 * Cache factory for all model objects.
 *
 * @private
 * @type {CacheFactory_}
 */
Engine.prototype.modelCacheFactory_ = null;


/**
 * The options for this engine.
 *
 * @private
 * @type {Options}
 */
Engine.prototype.options_ = null;


/**
 * The main raycaster.
 *
 * @private
 * @type {Raycaster_}
 */
Engine.prototype.raycaster_ = null;


/**
 * The main renderer.
 *
 * @private
 * @type {RenderingEngine_}
 */
Engine.prototype.renderer_ = null;


/**
 * The HTML element tracker.
 *
 * @private
 * @type {Tracker_}
 */
Engine.prototype.tracker_ = null;


/**
 * Global Engine instance. The user should create an Engine and assign it here. Otherwise, an
 * Engine will be created automatically with default options when the first Model is instantiated.
 *
 * @type {Engine}
 */
this['engine'] = null;

// Exports
this['Engine'] = Engine;


/**
 * Version number for this build.
 *
 * @type {string}
 */
this['version'] = null;
