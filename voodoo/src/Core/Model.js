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
 * @param {Object=} opt_options User options.
 */
Model.prototype['construct'] = function(opt_options) {
  log_.assert_(this['name'], 'Model type name must be valid.',
      '(Model::Model)');
  log_.assert_(this['viewType'], 'Model view type must be valid.',
      '(Model::Model)');

  if (!this['viewType'].prototype['above'] &&
      !this['viewType'].prototype['below']) {
    log_.error_('View must exist on at least one layer.', '(Model::Model)');
  }

  this['stencilViewType'] = this['stencilViewType'] || this['viewType'];

  var vars = this['privateModelProperties'] = {};

  // Sets the identifier used for the model in logging.
  var id = '<' + (++nextModelId_) + ',';
  if (this['organization'] !== defaultOrganization_)
    id += this['organization'] + '.';
  id += this['name'] + '>';
  vars['id'] = id;

  log_.model_(this, 'Constructing');

  // If no engine has been created, create one with default options.
  var voodoo = window['voodoo'];
  if (!voodoo['engine'])
    voodoo['engine'] = new Engine(new Options());

  /** @type {Engine} */
  var engine = voodoo['engine'];

  vars.dispatcher_ = new Dispatcher_();

  var cache = vars.cache_ = engine.modelCacheFactory_.createCache_(this);
  Object.defineProperty(this, 'cache', {
    get: function() { return cache; },
    enumerable: true
  });

  var options = opt_options || {};
  this['initialize'](options);

  var views = vars.views_ = [];
  var stencilViews = vars.stencilViews_ = [];
  vars.numViewsLoaded_ = 0;
  vars.numViewsToLoad_ = 0;

  Object.defineProperty(this, 'loaded', {
    get: function() { return vars.numViewsLoaded_ === vars.numViewsToLoad_; },
    enumerable: true
  });

  // Create views, one for each layer and one additional for the stencil layer.
  var nonuniqueStencilView = this['stencilViewType'] === this['viewType'];
  var viewPrototype = this['viewType'].prototype;
  var viewSupportsAbove = viewPrototype['above'];
  var viewSupportsBelow = viewPrototype['below'];

  var layers = engine.renderer_.layers_;
  for (var layerIndex = 0, numLayers = layers.length; layerIndex < numLayers;
      ++layerIndex) {
    var layer = layers[layerIndex];

    switch (layer.pass_) {
      case LayerPass_['Above']:
        if (viewSupportsAbove)
          views.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['Below']:
        if (viewSupportsBelow)
          views.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['Seam']:
        // If the model has content in the above layer, it MUST be added
        // to the seam layer to work with the stencil tests against other
        // models in the seam layer.
        if (viewSupportsAbove)
          views.push(new this['viewType'](this, layer));
        break;
      case LayerPass_['BelowStencil']:
        if (viewSupportsBelow) {
          if (nonuniqueStencilView)
            views.push(new this['viewType'](this, layer));
          else
            stencilViews.push(new this['stencilViewType'](this, layer));
        }
        break;
      case LayerPass_['SeamStencil']:
        if (viewSupportsBelow) {
          if (nonuniqueStencilView)
            views.push(new this['viewType'](this, layer));
          else
            stencilViews.push(new this['stencilViewType'](this, layer));
        }
        break;
    }
  }

  var numViews = views.length;
  var numStencilViews = stencilViews.length;

  // Create composite view and stencil views if there are more than one.
  var view = vars.view_ = numViews > 1 ? new Composite_(views) : views[0];
  var stencilView = vars.stencilView_ = numStencilViews > 1 ?
      new Composite_(stencilViews) : stencilViews[0];

  vars.numViewsToLoad_ = numViews + numStencilViews;

  Object.defineProperty(this, 'view', {
    get: function() { return view; },
    enumerable: true
  });

  Object.defineProperty(this, 'stencilView', {
    get: function() { return stencilView; },
    enumerable: true
  });

  this['setUpViews']();

  // Add this model to the engine to be updated
  engine.addModel_(this);
};


/**
 * Destroys the model and all its views. This should not be overridden.
 *
 * @this {Model}
 */
Model.prototype['destroy'] = function() {
  log_.model_(this, 'Destroying');

  var vars = this['privateModelProperties'];

  var voodoo = window['voodoo'];
  var evt = new voodoo['Event']('destroy', this);
  vars.dispatcher_.dispatchEvent_(this, evt);

  this['tearDownViews']();

  // Remove this model from the engine to stop being updated
  voodoo['engine'].removeModel_(this);

  var view = vars.view_;
  var stencilView = vars.stencilView_;

  if (view && view['destroy']) view['destroy']();
  if (stencilView && stencilView['destroy']) stencilView['destroy']();

  this['cleanUp']();

  vars.dispatcher_.destroy_();

  vars.dispatcher_ = null;
  vars.view_ = null;
  vars.stencilView_ = null;
};


/**
 * Dispatches a custom event to all listeners registered on this model.
 *
 * @this {Model}
 *
 * @param {Event} evt Event to fire.
 *
 * @return {Model} This.
 */
Model.prototype['dispatch'] = function(evt) {
  var vars = this['privateModelProperties'];
  vars.dispatcher_.dispatchEvent_(this, evt);
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
    func(options);
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
  var vars = this['privateModelProperties'];
  vars.dispatcher_.off_(type, listener);

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
  var vars = this['privateModelProperties'];
  vars.dispatcher_.on_(type, listener);

  // Load is a special event since it can be dispatched before the user had time
  // to register for the event, so we call it anyway as soon as an event
  // listener is registered.
  if (type === 'load' && vars.numViewsLoaded_ === vars.numViewsToLoad_)
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
 * Readonly property indicating whether all views have finished loading.
 *
 * @type {boolean}
 */
Model.prototype['loaded'] = false;


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
 * Called from the view when it has loaded.
 *
 * @ignore
 *
 * @this {Model}
 *
 * @param {View} view View that loaded.
 */
Model.prototype['onViewLoad'] = function(view) {
  log_.assert_(view, 'view must be valid.', '(Model::onViewLoad)');

  var vars = this['privateModelProperties'];

  vars.numViewsLoaded_++;
  if (vars.numViewsLoaded_ === vars.numViewsToLoad_) {
    var evt = new window['voodoo']['Event']('load', this);
    vars.dispatcher_.dispatchEvent_(this, evt);
  }
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
 * If this is not set, voodoo uses the view.
 *
 * @type {View}
 */
Model.prototype['stencilViewType'] = null;


/**
 * Derives a new type from a base Model. The Model's views
 * are also automatically extended if they are defined.
 *
 * @this {?}
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
Model['extend'] = function(opt_object) {
  var newType = Extendable['extend'].call(this, opt_object);
  var newTypePrototype = newType.prototype;
  var thisPrototype = this.prototype;

  var name = thisPrototype['name'];
  var newName = newTypePrototype['name'];
  if (name && newName && newName !== name)
    newTypePrototype['name'] = name + '.' + newName;

  var viewType = thisPrototype['viewType'];
  var newViewType = newTypePrototype['viewType'];
  if (viewType && newViewType && viewType !== newViewType)
    newTypePrototype['viewType'] = viewType['extend'](newViewType);

  // If the stencil view is undefined, use the original view.
  var stencil = thisPrototype['stencilViewType'] || viewType;
  opt_object = (typeof opt_object === 'function' ?
      opt_object.prototype : opt_object) || {};
  var newStencil = opt_object['stencilViewType'] || newViewType;
  if (stencil && newStencil && stencil !== newStencil)
    newTypePrototype['stencilViewType'] = stencil['extend'](newStencil);

  newType['extend'] = Model['extend'];

  return newType;
};

// Exports
this['Model'] = Model;
