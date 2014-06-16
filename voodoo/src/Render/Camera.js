// ----------------------------------------------------------------------------
// File: Camera.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The virtual camera that aligns 3D coordinates with 2D pixels.
 *
 * @constructor
 */
function Camera() {}


// XYZ object for the camera's position.
Camera.prototype['position'] = {};


/**
 * The camera position's x coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['x'] = 0;


/**
 * The camera position's y coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['y'] = 0;


/**
 * The camera position's z coordinate.
 *
 * @type {number}
 */
Camera.prototype['position']['z'] = 0;


/**
 * The camera's near Z distance.
 *
 * @type {number}
 */
Camera.prototype['zNear'] = 0;


/**
 * The camera's far Z distance.
 *
 * @type {number}
 */
Camera.prototype['zFar'] = 0;
