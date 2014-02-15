// ----------------------------------------------------------------------------
// File: View.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Base type for a Model's renderables. Every Model has a View.
 *
 * Developers should extend this type and use it to add 3D meshes to the
 * scene. There are two types of Views: regular Views and stencil Views.
 * Regular Views contain the geometry the user actually sees and is required.
 * Instances of Views are created automatically when a Model is created.
 *
 * In order to integrate 2D and 3D seamlessly, several instances of each
 * View may be created behind the scenes. This means each View should not
 * store much state. Instead, state should instead by stored primarily in the
 * Model. Each View instance has a reference to its corresponding Model.
 *
 * Stencil Views are similar to regular Views in that they create 3D meshes and
 * add them to a scene. However, their purpose is not to display objects on
 * screen. Instead, they define the regions visible in the below layer. If no
 * stencil View is provided to the Model, the regular View is used instead so
 * that all content in the below layer is visible.
 *
 * @constructor
 *
 * @extends {Extendable}
 */
var View = Extendable['extend']();


/**
 * Constructs the View.
 *
 * Derived classes should not override this.
 *
 * @this {View}
 * @ignore
 *
 * @param {Model} model This View's corresponding model.
 * @param {Layer_} layer This View's corresponding layer.
 */
View.prototype['construct'] = function(model, layer) {
  log_.assert_(model, 'View model passed to initialize cannot be null');
  log_.assert_(layer, 'View layer passed to initialize cannot be null');

  // Create public properties
  this.setupPublicProperties_();

  // Setup private vars
  this.model_ = model;
  this.layer_ = layer;
  this.scene_ = this.layer_.sceneFactory_.createScene_(this);
  this.triggers_ = this.layer_.triggersFactory_.createTriggers_(this);
  this.cache_ = this.layer_.cacheFactory_.createCache_(this.model_);

  // The view always starts off dirty.
  this['dirty']();

  this.layer_.addView_(this);

  // Call the user's load function.
  this.isLoaded_ = true;
  this['load']();
  if (this.isLoaded_)
    this.model_.onViewLoad_(this);
};


/**
 * Destroys the View's renderables. Called automatically by the model.
 *
 * @ignore
 *
 * @this {View}
 */
View.prototype['destroy'] = function() {
  this['unload']();

  this.triggers_.destroy_();
  this.scene_.destroy_();
  this.layer_.removeView_(this);

  this.model_ = null;
  this.triggers_ = null;
  this.scene_ = null;
  this.layer_ = null;
  this.cache_ = null;
};


/**
 * Marks the view's contents as dirty so that they will be rendered again.
 *
 * @this {View}
 */
View.prototype['dirty'] = function() {
  this.scene_.isDirty_ = true;
};


/**
 * Creates the View's 3D meshes and adds them to the scene.
 *
 * Derived classes may override this. This should never be called by the user.
 *
 * @this {Model}
 */
View.prototype['load'] = function() {
  var func = this['base']['load'];
  if (typeof func === 'function')
    func();
};


/**
 * Removes the View's 3D meshes from the scene.
 *
 * Derived classes may override this. This should never be called by the user.
 *
 * @this {Model}
 */
View.prototype['unload'] = function() {
  var func = this['base']['unload'];
  if (typeof func === 'function')
    func();
};


/**
 * Whether this view's contents should be created on the above layer. Setting
 * this to false when all the View's contents are below the page will result
 * in better performance.
 *
 * Default is true.
 *
 * @type {boolean}
 */
View.prototype['above'] = true;


/**
 * Whether this view's contents should be created on the below layer. Setting
 * this to false when all the View's contents are above the page will result
 * in better performance.
 *
 * Default is true.
 *
 * @type {boolean}
 */
View.prototype['below'] = true;


/**
 * The storage cache for view objects.
 *
 * @type {Cache}
 */
View.prototype['cache'] = null;


/**
 * The camera for this View.
 *
 * @type {Camera}
 */
View.prototype['camera'] = null;


/**
 * The flag indicating whether this View has finished loading. This
 * is automatically set to true after load() unless the user sets it
 * to false during load(). If the user sets it to false, they are responsible
 * for setting it to true later (ex. after textures finish loading). When
 * all views have loaded, the onload event fires from the model.
 *
 * @type {boolean}
 */
View.prototype['loaded'] = null;


/**
 * The model for this View.
 *
 * @type {Model}
 */
View.prototype['model'] = null;


/**
 * The type of rendering engine.
 *
 * @type {Renderer}
 */
View.prototype['renderer'] = null;


/**
 * The scene for this View.
 *
 * @type {Scene}
 */
View.prototype['scene'] = null;


/**
 * The mouse event triggers for this View.
 *
 * @type {Triggers}
 */
View.prototype['triggers'] = null;


/**
 * Creates the View's public properties.
 *
 * @private
 */
View.prototype.setupPublicProperties_ = function() {
  Object.defineProperty(this, 'cache', {
    get: function() { return this.cache_; },
    set: function() { log_.error_('cache is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'camera', {
    get: function() { return this.layer_.camera_; },
    set: function() { log_.error_('camera is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'loaded', {
    get: function() { return this.isLoaded_; },
    set: function(val) {
      this.isLoaded_ = val;
      if (this.isLoaded_)
        this.model_.onViewLoad_(this);
    },
    writeable: true
  });

  Object.defineProperty(this, 'model', {
    get: function() { return this.model_; },
    set: function() { log_.error_('model is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'renderer', {
    get: function() { return this.layer_.renderer_; },
    set: function() { log_.error_('renderer is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'scene', {
    get: function() { return this.scene_; },
    set: function() { log_.error_('scene is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'triggers', {
    get: function() { return this.triggers_; },
    set: function() { log_.error_('triggers is read-only'); },
    writeable: false
  });
};


/**
 * Derives a new type from a base View.
 *
 * @this {View}
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
View['extend'] = function(opt_object) {
  return Extendable['extend'].call(this, opt_object);
};

// Exports
this['View'] = View;
