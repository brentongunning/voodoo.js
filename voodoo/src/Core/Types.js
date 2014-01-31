// ----------------------------------------------------------------------------
// File: Types.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Basic internal 2D size type.
 *
 * @private
 * @constructor
 *
 * @param {number} w Width.
 * @param {number} h Height.
 */
function Size2_(w, h) {
  this.width = w;
  this.height = h;
}


/**
 * Width.
 *
 * @type {number}
 */
Size2_.prototype.width = 0;


/**
 * Height.
 *
 * @type {number}
 */
Size2_.prototype.height = 0;



/**
 * Basic internal 2D vector type.
 *
 * @private
 * @constructor
 *
 * @param {number} x_ X value.
 * @param {number} y_ Y value.
 */
function Vector2_(x_, y_) {
  this.x = x_;
  this.y = y_;
}


/**
 * X value.
 *
 * @type {number}
 */
Vector2_.prototype.x = 0;


/**
 * Y value.
 *
 * @type {number}
 */
Vector2_.prototype.y = 0;
