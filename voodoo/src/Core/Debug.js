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
  if (!DEBUG) {
    // Case 1: Not in debug mode. Setting debug settings should throw an error.

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
  } else {
    // Case 2: In debug mode

    this.disableStencils_ = false;
    this.drawStencils_ = false;
    this.showFps_ = false;

    Object.defineProperty(this, 'disableStencils', {
      get: function() { return this.disableStencils_; },
      set: function(val) {
        this.disableStencils_ = val;
        window['voodoo']['engine'].markRendererDirty_();
      },
      enumerable: true
    });

    Object.defineProperty(this, 'drawStencils', {
      get: function() { return this.drawStencils_; },
      set: function(val) {
        this.drawStencils_ = val;
        window['voodoo']['engine'].markRendererDirty_();
      },
      enumerable: true
    });

    Object.defineProperty(this, 'showFps', {
      get: function() { return this.showFps_; },
      set: function(val) { this.showFps_ = val; },
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
