// ----------------------------------------------------------------------------
// File: voodoo-*.externs.js
//
// Desc: Voodoo externs for Google's Closure Compiler.
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------

var voodoo = {};

// ----------------------------------------------------------------------------
// Cache
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Cache = function() {};

/**
 * @param {string} key
 * @param {string=} opt_name
 * @param {string=} opt_organization
 */
voodoo.Cache.prototype.delete = function(key, opt_name, opt_organization) {};

/**
 * @param {string} key
 * @param {string=} opt_name
 * @param {string=} opt_organization
 * @return {Object}
 */
voodoo.Cache.prototype.get = function(key, opt_name, opt_organization) {};


/**
 * @param {string} key
 * @param {string=} opt_name
 * @param {string=} opt_organization
 * @return {boolean}
 */
voodoo.Cache.prototype.has = function(key, opt_name, opt_organization) {};

/**
 * @param {string} key
 * @param {Object} value
 * @param {string=} opt_name
 * @param {string=} opt_organization
 */
voodoo.Cache.prototype.set = function(key, value, opt_name, opt_organization) {};

// ----------------------------------------------------------------------------
// Extendable
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @param {Object=} opt_options
 */
voodoo.Extendable = function(opt_options) {};

/** @type {Object} */
voodoo.Extendable.prototype.base = {};

voodoo.Extendable.prototype.construct = function() {};

/**
 * @param {Object=} opt_object
 * @return {?}
 */
voodoo.Extendable.extend = function(opt_object) {};

// ----------------------------------------------------------------------------
// Event
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @param {string} type
 * @param {voodoo.Model=} opt_model
 * @param {string|number=} opt_triggerId
 */
voodoo.Event = function(type, opt_model, opt_triggerId) {};

/** @type {number} */
voodoo.Event.prototype.button;

/** @type {Object} */
voodoo.Event.prototype.hit = {};

/** @type {number} */
voodoo.Event.prototype.hit.x;

/** @type {number} */
voodoo.Event.prototype.hit.y;

/** @type {number} */
voodoo.Event.prototype.hit.z;

/** @type {voodoo.Model} */
voodoo.Event.prototype.model;

/** @type {Object} */
voodoo.Event.prototype.object;

/** @type {Object} */
voodoo.Event.prototype.page = {};

/** @type {number} */
voodoo.Event.prototype.page.x;

/** @type {number} */
voodoo.Event.prototype.page.y;

/** @type {Object} */
voodoo.Event.prototype.size = {};

/** @type {number} */
voodoo.Event.prototype.size.x;

/** @type {number} */
voodoo.Event.prototype.size.y;

/** @type {string|number} */
voodoo.Event.prototype.triggerId;

/** @type {string} */
voodoo.Event.prototype.type;

// ----------------------------------------------------------------------------
// Model
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @extends {voodoo.Extendable}
 */
voodoo.Model = function() {};

/**
 * @param {Object=} opt_object
 * @return {?}
 */
voodoo.Model.extend = function(opt_object) {};

voodoo.Model.prototype.destroy = function() {};
voodoo.Model.prototype.setUpViews = function() {};
voodoo.Model.prototype.tearDownViews = function() {};
voodoo.Model.prototype.cleanUp = function() {};

/** @param {Object} options */
voodoo.Model.prototype.initialize = function(options) {};

/** @param {number} deltaTime */
voodoo.Model.prototype.update = function(deltaTime) {};

/** @param {voodoo.Event} event */
voodoo.Model.prototype.dispatch = function(event) {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Model.prototype.on = function(type, listener) {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Model.prototype.off = function(type, listener) {};

/** @type {Object} */
voodoo.Model.prototype.view;

/** @type {Object} */
voodoo.Model.prototype.stencilView;

/** @type {voodoo.Cache} */
voodoo.Model.prototype.cache;

/** @type {boolean} */
voodoo.Model.prototype.loaded;

/** @type {string} */
voodoo.Model.prototype.name;

/** @type {string} */
voodoo.Model.prototype.organization;

/** @type {voodoo.View} */
voodoo.Model.prototype.viewType;

/** @type {voodoo.View} */
voodoo.Model.prototype.stencilViewType;

// ----------------------------------------------------------------------------
// View
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @extends {voodoo.Extendable}
 */
voodoo.View = function() {};

/**
 * @param {Object=} opt_object
 * @return {?}
 */
voodoo.View.extend = function(opt_object) {};

voodoo.View.prototype.dirty = function() {};
voodoo.View.prototype.load = function() {};
voodoo.View.prototype.unload = function() {};

/** @type {boolean} */
voodoo.View.prototype.above;

/** @type {boolean} */
voodoo.View.prototype.below;

/** @type {voodoo.Cache} */
voodoo.View.prototype.cache;

/** @type {voodoo.Camera} */
voodoo.View.prototype.camera;

/** @type {boolean} */
voodoo.View.prototype.loaded;

/** @type {voodoo.Model} */
voodoo.View.prototype.model;

/** @type {voodoo.Renderer} */
voodoo.View.prototype.renderer;

/** @type {voodoo.Scene} */
voodoo.View.prototype.scene;

/** @type {voodoo.Triggers} */
voodoo.View.prototype.triggers;

// ----------------------------------------------------------------------------
// Camera
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Camera = function() {};

/** @type {Object} */
voodoo.Camera.prototype.position;

/** @type {number} */
voodoo.Camera.prototype.position.x;

/** @type {number} */
voodoo.Camera.prototype.position.y;

/** @type {number} */
voodoo.Camera.prototype.position.z;

/** @type {number} */
voodoo.Camera.prototype.zNear;

/** @type {number} */
voodoo.Camera.prototype.zFar;

// ----------------------------------------------------------------------------
// Scene
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Scene = function() {};

/** @param {THREE.Object3D} object */
voodoo.Scene.prototype.add = function(object) {};

/**
 * @param {HTMLElement} element
 * @param {boolean=} opt_center
 * @param {boolean=} opt_pixels
 * @param {boolean=} opt_zscale
 */
voodoo.Scene.prototype.attach = function(element, opt_center, opt_pixels,
    opt_zscale) {};

voodoo.Scene.prototype.detach = function() {};

/**
 * @param {Object|Array.<number>} coordinate
 * @return {Object|Array.<number>}
 */
voodoo.Scene.prototype.localToPage = function(coordinate) {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Scene.prototype.on = function(type, listener) {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Scene.prototype.off = function(type, listener) {};

/**
 * @param {Object|Array.<number>} coordinate
 * @return {Object|Array.<number>}
 */
voodoo.Scene.prototype.pageToLocal = function(coordinate) {};

/** @param {THREE.Object3D} object */
voodoo.Scene.prototype.remove = function(object) {};

/** @type {Array.<THREE.Object3D>} */
voodoo.Scene.objects;

// ----------------------------------------------------------------------------
// Triggers
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Triggers = function() {};

/**
 * @param {THREE.Object3D} object
 * @param {string|number=} opt_triggerId
 */
voodoo.Triggers.prototype.add = function(object, opt_triggerId) {};

/** @param {string} cursor */
voodoo.Triggers.prototype.cursor = function(cursor) {};

/** @param {THREE.Object3D} object */
voodoo.Triggers.prototype.remove = function(object) {};

// ----------------------------------------------------------------------------
// Debug
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Debug = function() {};

/** @type {boolean} */
voodoo.Debug.prototype.disableStencils;

/** @type {boolean} */
voodoo.Debug.prototype.drawStencils;

/** @type {boolean} */
voodoo.Debug.prototype.showFps;

/** @type {voodoo.Debug} */
voodoo.debug;

// ----------------------------------------------------------------------------
// Engine
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @param {voodoo.Options} options
 */
voodoo.Engine = function(options) {};

voodoo.Engine.prototype.destroy = function() {};
voodoo.Engine.prototype.frame = function() {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Engine.prototype.on = function(type, listener) {};

/**
 * @param {string} type
 * @param {function(voodoo.Event)} listener
 */
voodoo.Engine.prototype.off = function(type, listener) {};

/** @type {Array.<voodoo.Model>} */
voodoo.Engine.prototype.models;

/** @type {voodoo.Engine} */
voodoo.engine;

// ----------------------------------------------------------------------------
// Options
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Options = function() {};

/** @type {boolean} */
voodoo.Options.prototype.aboveLayer;

/** @type {number} */
voodoo.Options.prototype.aboveZIndex;

/** @type {boolean} */
voodoo.Options.prototype.antialias;

/** @type {boolean} */
voodoo.Options.prototype.belowLayer;

/** @type {number} */
voodoo.Options.prototype.belowZIndex;

/** @type {number} */
voodoo.Options.prototype.fov;

/** @type {boolean} */
voodoo.Options.prototype.frameLoop;

/** @type {boolean} */
voodoo.Options.prototype.performanceScaling;

/** @type {boolean} */
voodoo.Options.prototype.realtime;

/** @type {voodoo.Renderer} */
voodoo.Options.prototype.renderer;

/** @type {number} */
voodoo.Options.prototype.renderInterval;

/** @type {boolean} */
voodoo.Options.prototype.seamLayer;

/** @type {number} */
voodoo.Options.prototype.seamZIndex;

/** @type {boolean} */
voodoo.Options.prototype.standardLighting;

/** @type {boolean} */
voodoo.Options.prototype.stencils;

/** @type {number} */
voodoo.Options.prototype.updateInterval;

// ----------------------------------------------------------------------------
// Renderer
// ----------------------------------------------------------------------------

/** @enum {number} */
voodoo.Renderer = {ThreeJs:0};

// ----------------------------------------------------------------------------
// Utility
// ----------------------------------------------------------------------------

/** @constructor */
voodoo.Utility = function() {};

/**
 * @nosideeffects
 * @param {string} cssColor
 * @return {THREE.Color}
 */
voodoo.Utility.prototype.convertCssColorToThreeJsColor = function(cssColor) {};

/**
 * @nosideeffects
 * @param {Element} element
 * @return {Object}
 */
voodoo.Utility.prototype.findAbsolutePosition = function(element) {};

/** @type {voodoo.Utility} */
voodoo.utility;
