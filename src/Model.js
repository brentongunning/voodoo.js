// ----------------------------------------------------------------------------
// File: Model.js
//
// Copyright (c) 2013 VoodooJs Authors
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
 */
Model.prototype['cleanUp'] = function() {
  // No-op
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

  this.eventListeners_ = {};

  this.setupCache_();
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

  this['tearDownViews']();

  // Remove this model from the engine to stop being updated
  window['voodoo']['engine'].removeModel_(this);

  if (this.view_ && this.view_['destroy'])
    this.view_['destroy']();
  if (this.stencilView_ && this.stencilView_['destroy'])
    this.stencilView_['destroy']();

  this['cleanUp']();
};


/**
 * Derives a new Model from a base type.
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
Model.prototype['extend'] = function(opt_object) {
  // This is not necessary. We only do this so it appears in documentation.
  return Extendable.prototype['extend'](opt_object);
};


/**
 * Initialzes the model. This is the first method to be called when the
 * model is instantiated. Derived classes may override this. This should never
 * be called by the user. The options parameter is what the user passed to
 * the constructor when this Model was instantiated.
 *
 * @param {Object} options User options.
 */
Model.prototype['initialize'] = function(options) {
  // No-op
};


/**
 * Adds an event handler.
 *
 * @this {Model}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 *
 * @return {Model} This.
 */
Model.prototype['on'] = function(type, listener) {
  if (!this.eventListeners_[type])
    this.eventListeners_[type] = [];

  if (this.eventListeners_[type].indexOf(listener) == -1)
    this.eventListeners_[type].push(listener);

  return this;
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
  var listeners = this.eventListeners_[type];
  if (listeners && listeners.IndexOf(listener))
    listeners.splice(listeners.IndexOf(listener), 1);

  return this;
};


/**
 * Initialize the view and stencilView. This is called after initialize() when
 * a model is instantiated. Derived classes may override this. This should never
 * be called by the user.
 */
Model.prototype['setUpViews'] = function() {
  // No-op
};


/**
 * Shuts down the views. This is called before cleanUp() when a model is
 * destroyed. Derived classes may override this. This should never be called by
 * the user.
 */
Model.prototype['tearDownViews'] = function() {
  // No-op
};


/**
 * Each frame this is called to update and animate the model.
 *
 * Derived classes may override this. This should never be called by the user.
 *
 * @param {number} deltaTime The time difference between this frame and last in
 * seconds. This is often used for consistent animation.
 */
Model.prototype['update'] = function(deltaTime) {
  // No-op
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
  var listeners = this.eventListeners_[event['type']];
  if (listeners)
    for (var i = 0; i < listeners.length; ++i)
      listeners[i].call(this, event);
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

  /** @type {Engine} */
  var engine = window['voodoo']['engine'];
  var layers = engine.renderer_.layers_;

  // Create the views, one for each layer and one additional for the
  // stencil layer.
  var nonuniqueStencilView = this['stencilViewType'] == this['viewType'];
  for (var layerIndex = 0; layerIndex < layers.length; ++layerIndex) {
    var layer = layers[layerIndex];

    switch (layer.pass) {
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
      case LayerPass_['Stencil']:
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
  this.cache_ = window['voodoo']['engine'].modelCache_.applyModel_(this);

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

// Exports
this['Model'] = Model;
