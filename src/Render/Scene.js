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
 * Removes a mesh from the scene graph.
 *
 * @param {THREE.Object3D} object Object to remove.
 */
Scene.prototype['remove'] = function(object) {};
