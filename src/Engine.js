// ----------------------------------------------------------------------------
// File: Engine.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Voodoo's main engine. It manages the renderer, the event dispatcher, and
 * all of the models. There can only be one engine per page and the
 * user is responsible for creating it. If the user does not create an
 * engine and assign it to voodoo.engine, then one will be created automatically
 * with default options when the first model is instantiated.
 *
 * @constructor
 *
 * @param {Options} options Options for voodoo.
 */
function Engine(options) {
  log_.assert_(options != null, 'Options must not be null');
  log_.assert_(options['renderer'] == Renderer['ThreeJs'],
      'Only ThreeJs is supported');

  log_.information_('Creating Engine');
  log_.information_('   version: ' + VERSION);
  log_.information_('   userAgent: ' + navigator.userAgent);
  for (var property in options)
    log_.information_('   options.' + property + ': ' + options[property]);

  // Check for WebGL support
  if (DEBUG && !window['WebGLRenderingContext']) {
    log_.error_('WebGL not supported');
  }

  this.options_ = options;
  this.modelCache_ = new Cache({});

  // Make sure the options are valid
  if (!this.options_['aboveLayer'] &&
      !this.options_['belowLayer']) {
    log_.error_('At least one layer must be enabled');
  }

  // Setup models property
  this.models_ = [];
  Object.defineProperty(this, 'models', {
    get: function() {
      // Create a copy of all the models. A copy lets the user iterate over
      // and delete models without worrying about invalidating our own list.
      var models = [];
      for (var i = 0; i < this.models_.length; ++i)
        models.push(this.models_[i]);
      return models;
    },
    set: function() { log_.error_('models is read-only'); },
    writeable: false
  });

  // Create the renderer
  switch (options['renderer']) {
    case Renderer['ThreeJs']:
      this.renderer_ = new ThreeJsRenderer_(this);
      break;
    default:
      this.renderer_ = null;
      log_.error_('Unsupported renderer');
      break;
  }

  // Create the event dispatcher
  this.dispatcher_ = new Dispatcher_(this);

  // At this point we know the engine is valid. Assign it to the global.
  window['voodoo']['engine'] = this;

  // Create the standard lights here. They should be created before any
  // models are created since ThreeJs materials expect to know how many lights
  // are in the scene when they are created to build the shaders properly.
  // We must set voodoo.engine because AmbientLight_ and CameraLight_ are both
  // models that will try to create voodoo.engine if it isn't already set.
  if (options['standardLighting']) {
    log_.information_('Creating standard lights');
    new AmbientLight_({'color': 'white'});
    new CameraLight_({'color': 'white'});
  }

  if (options['frameLoop']) {
    log_.information_('Beginning frame loop');
    this.renderer_.run();
  }
}


/**
 * Shuts down the engine and stops rendering. After calling this,
 * all models are invalid.
 *
 * @this {Engine}
 */
Engine.prototype['destroy'] = function() {
  log_.information_('Destroying Engine');

  for (var modelIndex = 0; modelIndex < this.models_.length; ++modelIndex) {
    /** @type {Model} */
    var model = this.models_[modelIndex];
    model['destroy']();
  }

  this.models_ = null;

  this.renderer_.destroy();

  if (typeof window['voodoo']['engine'] !== 'undefined')
    delete window['voodoo']['engine'];
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
  this.renderer_.frame();
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
  this.models_.push(model);
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
  this.models_.splice(this.models_.indexOf(model), 1);
};


/**
 * Cache for all model objects.
 *
 * @private
 * @type {Cache}
 */
Engine.prototype.modelCache_ = null;


/**
 * The main event dispatcher.
 *
 * @private
 * @type {Dispatcher_}
 */
Engine.prototype.dispatcher_ = null;


/**
 * The options for this engine.
 *
 * @private
 * @type {Options}
 */
Engine.prototype.options_ = null;


/**
 * The main renderer.
 *
 * @private
 * @type {ThreeJsRenderer_}
 */
Engine.prototype.renderer_ = null;


/**
 * Global Engine instance. The user should create an Engine and assign
 * it here. Otherwise, an Engine will be created automatically with default
 * options when the first Model is instantiated.
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
