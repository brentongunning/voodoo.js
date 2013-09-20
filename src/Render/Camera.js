// ----------------------------------------------------------------------------
// File: Camera.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The virtual camera that aligns 3D coordinates with 2D pixels.
 *
 * @constructor
 */
function Camera() {}


/**
 * The camera's field of view along the y axis.
 *
 * @type {number}
 */
Camera.prototype['fovY'] = null;

// XYZ object for the camera's position.
Camera.prototype['position'] = {};


/**
 * The camera position's x coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['x'] = {};


/**
 * The camera position's y coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['y'] = {};


/**
 * The camera position's z coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['z'] = {};


/**
 * The camera's near Z distance.
 *
 * @type {number}
 */
Camera.prototype['zNear'] = null;


/**
 * The camera's far Z distance.
 *
 * @type {number}
 */
Camera.prototype['zFar'] = null;
