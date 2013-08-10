// ----------------------------------------------------------------------------
// File: Debug.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Stores flags to help the user debug and develop Models. These only work in
 * the debug build. voodoo.debug is automatically instantiated.
 *
 * @constructor
 */
function Debug() {
  // No-op
}


/**
 * Whether to disable stencils completely.
 *
 * Default is false.
 *
 * @type {boolean}
 */
Debug.prototype['disableStencils'] = false;


/**
 * Whether to draw the stencil scene instead of the regular scene.
 *
 * Default is false.
 *
 * @type {boolean}
 */
Debug.prototype['drawStencils'] = false;


/**
 * Global Debug instance. This is created automatically.
 *
 * @type {Debug}
 */
this['debug'] = new Debug();
