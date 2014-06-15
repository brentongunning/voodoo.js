// ----------------------------------------------------------------------------
// File: Debug.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Stores flags to help the user debug and develop Models. These only work in
 * the debug build. voodoo.debug is automatically instantiated.
 *
 * @constructor
 */
function Debug() {
  // If not in debug mode, then debug settings should throw an error.
  if (!DEBUG) {
    Object.defineProperty(this, 'disableStencils', {
      get: function() { return false; },
      set: function(val) { log_.error_(
          'Debug settings may only be set in debug builds.',
          '(Debug::disableStencils)'); },
      enumerable: true
    });

    Object.defineProperty(this, 'drawStencils', {
      get: function() { return false; },
      set: function(val) { log_.error_(
          'Debug settings may only be set in debug builds.',
          '(Debug::drawStencils)'); },
      enumerable: true
    });

    Object.defineProperty(this, 'showFps', {
      get: function() { return false; },
      set: function(val) { log_.error_(
          'Debug settings may only be set in debug builds.',
          '(Debug::showFps)'); },
      enumerable: true
    });
  }
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
 * Whether to show the frames per second in the top left corner of the screen.
 *
 * Default is false.
 *
 * @type {boolean}
 */
Debug.prototype['showFps'] = false;


/**
 * Global Debug instance. This is created automatically.
 *
 * @type {Debug}
 */
this['debug'] = new Debug();
