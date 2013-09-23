// ----------------------------------------------------------------------------
// File: Scene.js
//
// Copyright (c) 2013 VoodooJs Authors
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
 * @param {boolean} center If true, sets the origin to the element's center.
 *    If false, sets the origin to the element's top left corner.
 * @param {boolean} pixels If true, one unit is one pixel. If false, one
 *    x unit is the element's width, and one y unit is the unit's height. Z
 *    is in pixels regardless.
 */
Scene.prototype['attach'] = function(element, center, pixels) {};


/**
 * Removes the local coordinate system of the scene.
 */
Scene.prototype['detach'] = function() {};


/**
 * Removes a mesh from the scene graph.
 *
 * @param {THREE.Object3D} object Object to remove.
 */
Scene.prototype['remove'] = function(object) {};


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
 * Array of objects managed by this View's scene.
 *
 * @type {Array.<THREE.Object3D>}
 * @private
 */
Scene.prototype.objects_ = null;
