// ----------------------------------------------------------------------------
// File: Scene.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The scene graph where meshes may be added or removed.
 *
 * @constructor
 */
function Scene() {}


/**
 * Adds a mesh to the scene graph.
 *
 * @param {THREE.Object3D} object Object to add.
 */
Scene.prototype['add'] = function(object) {};


/**
 * Sets the local coordinate system of the scene by aligning to an HTML element.
 *
 * @param {HTMLElement} element HTML element to attach to. If null, the
 *    local coordinate system is reset back to the top left corner of the page
 *    and scaled in pixels.
 * @param {boolean=} opt_center If true, sets the origin to the element's
 *    center. If false, sets the origin to the element's top left corner.
 *    Default is true.
 * @param {boolean=} opt_pixels If true, one unit is one pixel. If false, one
 *    x unit is the element's width, and one y unit is the unit's height. Z
 *    is in pixels regardless. Default is true.
 * @param {boolean=} opt_zscale If true, the z dimension is also scaled
 *    using the average of the width and height. If false, no scaling
 *    along the z axis is performed. Default is true.
 */
Scene.prototype['attach'] = function(element, opt_center, opt_pixels,
    opt_zscale) {};


/**
 * Removes the local coordinate system of the scene.
 */
Scene.prototype['detach'] = function() {};


/**
 * Converts a coordinate from local-space to page-space
 * when the scene is attached to an HTML element.
 *
 * @param {Object|Array.<number>} coordinate Local space xyz coordinate.
 *
 * @return {Object|Array.<number>} Page-space coordinate.
 */
Scene.prototype['localToPage'] = function(coordinate) {
  return {};
};


/**
 * Removes an event handler.
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Scene.prototype['off'] = function(type, listener) {};


/**
 * Adds an event handler. Valid events are add, remove,
 * attach, detach, move, and resize.
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
Scene.prototype['on'] = function(type, listener) {};


/**
 * Converts a coordinate from page-space to local-space
 * when the scene is attached to an HTML element.
 *
 * @param {Object|Array.<number>} coordinate Page-space xyz coordinate.
 *
 * @return {Object|Array.<number>} Local coordinate.
 */
Scene.prototype['pageToLocal'] = function(coordinate) {
  return {};
};


/**
 * Removes a mesh from the scene graph.
 *
 * @param {THREE.Object3D} object Object to remove.
 */
Scene.prototype['remove'] = function(object) {};


/**
 * An array of objects contained in this View's scene.
 *
 * @type {Array.<THREE.Object3D>}
 */
Scene.prototype['objects'] = null;


/**
 * Destroys objects associated with the scene.
 *
 * @private
 */
Scene.prototype.destroy_ = function() {};


/**
 * Whether any contents of this View's scene are dirty.
 *
 * @private
 * @type {boolean}
 */
Scene.prototype.isDirty_ = true;


/**
 * Whether the scene must be re-rendered.
 *
 * @private
 * @type {boolean}
 */
Scene.prototype.forceRender_ = true;


/**
 * Array of objects managed by this View's scene.
 *
 * @type {Array.<THREE.Object3D>}
 * @private
 */
Scene.prototype.objects_ = null;


/**
 * Array of meshes managed by this View's scene.
 *
 * @type {Array.<THREE.Object3D>}
 * @private
 */
Scene.prototype.meshes_ = null;
