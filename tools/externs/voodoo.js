// ----------------------------------------------------------------------------
// File: voodoo-*.externs.js
//
// Desc: Voodoo externs for Google's Closure Compiler.
//
// Copyright (c) 2013 VoodooJs Authors
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

/** @constructor */
voodoo.Extendable = function() {};

voodoo.Extendable.prototype.construct = function() {};

/** @return {?} */
voodoo.Extendable.prototype.extend = function() {};

// ----------------------------------------------------------------------------
// Event
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @param {string} type
 * @param {voodoo.Model} model
 * @param {string|number=} opt_triggerId
 */
voodoo.Event = function(type, model, opt_triggerId) {};

/** @type {number} */
voodoo.Event.prototype.button;

/** @type {Object} */
voodoo.Event.prototype.client = {};

/** @type {number} */
voodoo.Event.prototype.client.x;

/** @type {number} */
voodoo.Event.prototype.client.y;

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

/** @type {string} */
voodoo.Event.prototype.type;

/** @type {string|number} */
voodoo.Event.prototype.triggerId;

// ----------------------------------------------------------------------------
// Model
// ----------------------------------------------------------------------------

/**
 * @constructor
 * @extends {voodoo.Extendable}
 */
voodoo.Model = function() {};

voodoo.Model.prototype.destroy = function() {};
voodoo.Model.prototype.setUpViews = function() {};
voodoo.Model.prototype.tearDownViews = function() {};
voodoo.Model.prototype.cleanUp = function() {};

/** @param {Object} options */
voodoo.Model.prototype.initialize = function(options) {};

/** @param {number} deltaTime */
voodoo.Model.prototype.update = function(deltaTime) {};

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

/** @type {number} */
voodoo.Camera.prototype.fovY;

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
 * @param {boolean} center
 * @param {boolean} pixels
 */
voodoo.Scene.prototype.attach = function(element, center, pixels) {};

voodoo.Scene.prototype.detach = function() {};

/** @param {THREE.Object3D} object */
voodoo.Scene.prototype.remove = function(object) {};

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
voodoo.Options.prototype.fovY;

/** @type {boolean} */
voodoo.Options.prototype.frameLoop;

/** @type {boolean} */
voodoo.Options.prototype.performanceScaling;

/** @type {boolean} */
voodoo.Options.prototype.realtime;

/** @type {voodoo.Renderer} */
voodoo.Options.prototype.renderer;

/** @type {boolean} */
voodoo.Options.prototype.seamLayer;

/** @type {number} */
voodoo.Options.prototype.seamZIndex;

/** @type {boolean} */
voodoo.Options.prototype.standardLighting;

/** @type {boolean} */
voodoo.Options.prototype.stencils;

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
