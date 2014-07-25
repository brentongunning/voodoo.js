// ------------------------------------------------------------------------------------------------
// File: View.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Base class for a Model's visuals. Every Model has a View.
 *
 * Developers should extend this base class to their add 3D meshes to the scene. Voodoo will
 * automatically create instances of your Views when youinstantiate your Model. Since there may be
 * several Views created, each View should not store much state.
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
  log_.assert_(model, 'model must be valid.', '(View::construct)');
  log_.assert_(layer, 'layer must be valid.', '(View::construct)');

  var vars = this['privateViewProperties'] = {};
  var that = this;

  // Setup public properties

  Object.defineProperty(this, 'cache', {
    get: function() { return vars.cache_; },
    enumerable: true
  });

  Object.defineProperty(this, 'camera', {
    get: function() { return vars.layer_.camera_; },
    enumerable: true
  });

  Object.defineProperty(this, 'loaded', {
    get: function() { return vars.isLoaded_; },
    set: function(val) {
      vars.isLoaded_ = val;
      if (!vars.hasLoaded_ && val) {
        vars.hasLoaded_ = true;
        vars.model_['onViewLoad'](that);
      }
    },
    enumerable: true
  });

  Object.defineProperty(this, 'model', {
    get: function() { return vars.model_; },
    enumerable: true
  });

  Object.defineProperty(this, 'renderer', {
    get: function() { return vars.layer_.renderer_; },
    enumerable: true
  });

  Object.defineProperty(this, 'scene', {
    get: function() { return vars.scene_; },
    enumerable: true
  });

  Object.defineProperty(this, 'triggers', {
    get: function() { return vars.triggers_; },
    enumerable: true
  });

  // Setup private vars
  vars.model_ = model;
  vars.layer_ = layer;
  vars.scene_ = layer.sceneFactory_.createScene_(this);
  vars.triggers_ = layer.triggersFactory_.createTriggers_(this);
  vars.cache_ = layer.cacheFactory_.createCache_(model);

  // The view always starts off dirty.
  this['dirty']();

  layer.addView_(this);

  // Call the user's load function.
  vars.isLoaded_ = true;
  vars.hasLoaded_ = false;
  this['load']();
  if (vars.isLoaded_) {
    vars.hasLoaded_ = true;
    model['onViewLoad'](this);
  }
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

  var vars = this['privateViewProperties'];

  vars.triggers_.destroy_();
  vars.scene_.destroy_();
  vars.layer_.removeView_(this);

  vars.model_ = null;
  vars.triggers_ = null;
  vars.scene_ = null;
  vars.layer_ = null;
  vars.cache_ = null;
};


/**
 * Marks the view's contents as dirty so that they will be rendered again.
 *
 * @this {View}
 */
View.prototype['dirty'] = function() {
  var vars = this['privateViewProperties'];
  vars.scene_.isDirty_ = true;
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
 * Whether this view's contents should be created on the above layer. Setting this to false when
 * all the View's contents are below the page will result in better performance.
 *
 * Default is true.
 *
 * @type {boolean}
 */
View.prototype['above'] = true;


/**
 * Whether this view's contents should be created on the below layer. Setting this to false when
 * all the View's contents are above the page will result in better performance.
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
 * The flag indicating whether this View has finished loading. This is automatically set to true
 * after load() unless the user sets it to false during load(). If the user sets it to false, they
 * are responsible for setting it to true later (ex. after textures finish loading). When all
 * views have loaded, the onload event fires from the model.
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
 * Derives a new type from a base View.
 *
 * @this {View}
 *
 * @param {Object=} opt_object Optional object to extend with.
 *
 * @return {?} Extended type.
 */
View['extend'] = function(opt_object) {
  /** @type {?} */
  var baseType = this;

  var newType = Extendable['extend'].call(this, opt_object);
  var newTypePrototype = newType.prototype;
  var thisPrototype = baseType.prototype;

  if (baseType !== View) {
    // The above and below booleans are optimizations to limit which views are created when one
    // knows that there is nothing to display. They are not intended to be used to actually change
    // what is displayed on screen, so if above/below were always overridden to true there should
    // be no difference. When extending views from each other, we have to be conservative and
    // create views for a layer when any of the views in the inheritance chain might have content
    // in that layer.
    newTypePrototype['above'] = newTypePrototype['above'] || thisPrototype['above'];
    newTypePrototype['below'] = newTypePrototype['below'] || thisPrototype['below'];
  }

  newType['extend'] = View['extend'];

  return newType;
};

// Exports
this['View'] = View;
