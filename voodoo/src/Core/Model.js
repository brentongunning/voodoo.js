// ----------------------------------------------------------------------------
// File: Model.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Stores the id number to use for the next model created.
 *
 * @private
 *
 * @type {number}
 */
var nextModelId_ = 0;


/**
 * Default model organization when none is specified.
 *
 * @type {string}
 * @const
 * @private
 */
var defaultOrganization_ = '*';



/**
 * Base class for all models.
 *
 * A model is a single 3D object managed by the Voodoo engine. A model
 * stores the state of the object and a reference to its View. The
 * View is the renderable part of the 3D object. The user only interacts
 * with the model.
 *
 * All user models must extend Model via extend().
 *
 * @constructor
 * @extends {Extendable}
 */
var Model = Extendable['extend']();


/**
 * Cleans up resources before the model is destroyed.
 *
 * Derived classes may override this. This should never be called by the user.
 *
 * @this {Model}
 */
Model.prototype['cleanUp'] = function() {
  var func = this['base']['cleanUp'];
  if (typeof func === 'function')
    func();
};


/**
 * Constructs a new model.
 *
 * This is internal and must not be overridden or called by the user.
 *
 * @this {Model}
 * @ignore
 *
 * @param {Object} options User options.
 */
Model.prototype['construct'] = function(options) {
  log_.assert_(this['name'], 'Model type name cannot be undefined or null');
  log_.assert_(this['viewType'], 'Model view type cannot be undefined or null');
  if (!this['viewType'].prototype['above'] &&
      !this['viewType'].prototype['below'])
    log_.error_('View must exist on at least one layer');
  this['stencilViewType'] = this['stencilViewType'] || this['viewType'];

  this.setId_();
  log_.modelInformation_(this, 'Constructing');

  // If no engine has been created, create one with default options.
  if (typeof window['voodoo']['engine'] === 'undefined' ||
      window['voodoo']['engine'] === null) {
    window['voodoo']['engine'] = new Engine(new Options());
  }

  this.dispatcher_ = new Dispatcher_();

  this.setupCache_();
  if (typeof options === 'undefined' || !options)
    options = {};
  this['initialize'](options);

  this.createViews_();

  this.setupViewProperties_();
  this['setUpViews']();

  // Add this model to the engine to be updated
  window['voodoo']['engine'].addModel_(this);
};


/**
 * Destroys the model and all its views. This should not be overridden.
 *
 * @this {Model}
 */
Model.prototype['destroy'] = function() {
  log_.modelInformation_(this, 'Destroying');

  this.dispatchEvent_(new window['voodoo']['Event']('destroy', this));

  this['tearDownViews']();

  // Remove this model from the engine to stop being updated
  window['voodoo']['engine'].removeModel_(this);

  if (this.view_ && this.view_['destroy'])
    this.view_['destroy']();
  if (this.stencilView_ && this.stencilView_['destroy'])
    this.stencilView_['destroy']();

  this['cleanUp']();

  this.dispatcher_.destroy_();

  this.dispatcher_ = null;
  this.view_ = null;
  this.stencilView_ = null;
};


/**
 * Dispatches a custom event to all listeners registered on this model.
 *
 * @this {Model}
 *
 * @param {Event} event Event to fire.
 *
 * @return {Model} This.
 */
Model.prototype['dispatch'] = function(event) {
  event['model'] = this;
  this.dispatchEvent_(event);
  return this;
};


/**
 * Initialzes the model. This is the first method to be called when the
 * model is instantiated. Derived classes may override this. This should never
 * be called by the user. The options parameter is what the user passed to
 * the constructor when this Model was instantiated.
 *
 * @this {Model}
 *
 * @param {Object} options User options.
 */
Model.prototype['initialize'] = function(options) {
  var func = this['base']['initialize'];
  if (typeof func === 'function')
    func();
};


/**
 * Removes an event handler.
 *
 * @this {Model}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 *
 * @return {Model} This.
 */
Model.prototype['off'] = function(type, listener) {
  this.dispatcher_.off_(type, listener);

  return this;
};


/**
 * Adds an event handler. Valid events are cameramove, destroy, mousedown,
 * mouseup, mouseover, mouseout, mousemove, click, and dblclick.
 *
 * @this {Model}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 *
 * @return {Model} This.
 */
Model.prototype['on'] = function(type, listener) {
  this.dispatcher_.on_(type, listener);

  // Load is a special event since it can be dispatched before the user had time
  // to register for the event, so we call it anyway as soon as an event
  // listener is registered.
  if (type == 'load' && this.numViewsLoaded_ === this.numViewsToLoad_)
    listener.call(this, new window['voodoo']['Event']('load', this));

  return this;
};


/**
 * Initialize the view and stencilView. This is called after initialize() when
 * a model is instantiated. Derived classes may override this. This should never
 * be called by the user.
 *
 * @this {Model}
 */
Model.prototype['setUpViews'] = function() {
  var func = this['base']['setUpViews'];
  if (typeof func === 'function')
    func();
};


/**
 * Shuts down the views. This is called before cleanUp() when a model is
 * destroyed. Derived classes may override this. This should never be called by
 * the user.
 *
 * @this {Model}
 */
Model.prototype['tearDownViews'] = function() {
  var func = this['base']['tearDownViews'];
  if (typeof func === 'function')
    func();
};


/**
 * Each frame this is called to update and animate the model.
 *
 * Derived classes may override this. This should never be called by the user.
 *
 * @param {number} deltaTime The time difference between this frame and last in
 * seconds. This is often used for consistent animation.
 *
 * @this {Model}
 */
Model.prototype['update'] = function(deltaTime) {
  var func = this['base']['update'];
  if (typeof func === 'function')
    func(deltaTime);
};


/**
 * The storage cache for model objects.
 *
 * @type {Cache}
 */
Model.prototype['cache'] = null;


/**
 * The composite stencil view for this model.
 *
 * @type {Object}
 */
Model.prototype['stencilView'] = null;


/**
 * The composite regular view for this model.
 *
 * @type {Object}
 */
Model.prototype['view'] = null;


/**
 * Fires an event.
 *
 * @this {Model}
 * @private
 *
 * @param {Event} event Event description.
 */
Model.prototype.dispatchEvent_ = function(event) {
  this.dispatcher_.dispatchEvent_(this, event);
};


/**
 * Creates each view.
 *
 * @this {Model}
 * @private
 */
Model.prototype.createViews_ = function() {
  this.views_ = [];
  this.stencilViews_ = [];
  this.numViewsLoaded_ = 0;
  this.numViewsToLoad_ = 0;

  /** @type {Engine} */
  var engine = window['voodoo']['engine'];
  var layers = engine.renderer_.layers_;

  // Create the views, one for each layer and one additional for the
  // stencil layer.
  var nonuniqueStencilView = this['stencilViewType'] == this['viewType'];
  for (var layerIndex = 0; layerIndex < layers.length; ++layerIndex) {
    var layer = layers[layerIndex];

    switch (layer.pass_) {
      case LayerPass_['Above']:
        if (this['viewType'].prototype['above'])
          this.views_.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['Below']:
        if (this['viewType'].prototype['below'])
          this.views_.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['Seam']:
        // If the model has content in the above layer, it MUST be added
        // to the seam layer to work with the stencil tests against other
        // models in the seam layer.
        if (this['viewType'].prototype['above'])
          this.views_.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['BelowStencil']:
        if (this['viewType'].prototype['below']) {
          if (nonuniqueStencilView)
            this.views_.push(new this['viewType'](this, layer));
          else
            this.stencilViews_.push(new this['stencilViewType'](this, layer));
        }
        break;
      case LayerPass_['SeamStencil']:
        if (this['viewType'].prototype['below']) {
          if (nonuniqueStencilView)
            this.views_.push(new this['viewType'](this, layer));
          else
            this.stencilViews_.push(new this['stencilViewType'](this, layer));
        }
        break;
    }
  }

  // Create composite view and stencil views if there are more than one.
  this.view_ = this.views_.length > 1 ?
      new Composite_(this.views_) :
      this.views_[0];
  this.stencilView_ = this.stencilViews_.length > 1 ?
      new Composite_(this.stencilViews_) :
      this.stencilViews_[0];

  this.numViewsToLoad_ = this.views_.length + this.stencilViews_.length;
};


/**
 * Called from the view when it has loaded.
 *
 * @private
 *
 * @param {View} view View that loaded.
 */
Model.prototype.onViewLoad_ = function(view) {
  this.numViewsLoaded_++;
  if (this.numViewsLoaded_ === this.numViewsToLoad_)
    this.dispatchEvent_(new window['voodoo']['Event']('load', this));
};


/**
 * Sets the identifier used for thei model in logging.
 *
 * @private
 */
Model.prototype.setId_ = function() {
  this.id_ = '<' + (++nextModelId_) + ',';

  // Only write the organization if it's not the default.
  if (this['organization'] !== defaultOrganization_)
    this.id_ += this['organization'] + '.';

  this.id_ += this['name'] + '>';
};


/**
 * Sets up the cache and the public property for it.
 *
 * @private
 */
Model.prototype.setupCache_ = function() {
  this.cache_ = window['voodoo']['engine'].modelCacheFactory_.createCache_(
      this);

  Object.defineProperty(this, 'cache', {
    get: function() { return this.cache_; },
    set: function() { log_.error_('cache is read-only'); },
    writeable: false
  });
};


/**
 * Creates the public properties for the views of the Model.
 *
 * @private
 */
Model.prototype.setupViewProperties_ = function() {
  Object.defineProperty(this, 'view', {
    get: function() { return this.view_; },
    set: function() { log_.error_('view is read-only'); },
    writeable: false
  });

  Object.defineProperty(this, 'stencilView', {
    get: function() { return this.stencilView_; },
    set: function() { log_.error_('stencilView is read-only'); },
    writeable: false
  });
};


/**
 * Friendly type name for this model.
 *
 * This must be set before creating any instances.
 *
 * @type {string}
 */
Model.prototype['name'] = null;


/**
 * Organization name for this model.
 *
 * This is optional and is used to differentiate between models with the same
 * name in the cache.
 *
 * @type {string}
 */
Model.prototype['organization'] = defaultOrganization_;


/**
 * The view type for this model.
 *
 * This must be set before creating any instances.
 *
 * @type {View}
 */
Model.prototype['viewType'] = null;


/**
 * The stencil view type for this model.
 *
 * If this is left undefined, voodoo uses the view.
 *
 * @type {View}
 */
Model.prototype['stencilViewType'] = null;


/**
 * Derives a new type from a base Model. The Model's views
 * are also automatically extended if they are defined.
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
Model['extend'] = function(opt_object) {
  var newType = Extendable['extend'].call(this, opt_object);

  var viewType = this.prototype['viewType'];
  var newViewType = newType.prototype['viewType'];
  if (typeof viewType !== 'undefined' && viewType !== null &&
      typeof newViewType !== 'undefined' && newViewType !== null &&
      viewType != newViewType) {
    newType.prototype['viewType'] = viewType['extend'](newViewType);
  }

  var stencil = this.prototype['stencilViewType'];
  var newStencil = newType.prototype['stencilViewType'];
  if (typeof stencil !== 'undefined' && stencil != null &&
      typeof newStencil !== 'undefined' && newStencil != null &&
      stencil != newStencil) {
    newType.prototype['stencilViewType'] = stencil['extend'](newStencil);
  }

  return newType;
};

// Exports
this['Model'] = Model;
