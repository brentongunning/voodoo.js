// ----------------------------------------------------------------------------
// File: Renderer.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------


/**
 * Enumeration for the different types of 3D engines Voodoo supports.
 *
 * @enum {number}
 */
var Renderer = {
  'ThreeJs': 0
};



/**
 * Base class for all rendering engines.
 *
 * @constructor
 * @private
 */
function RenderingEngine_() {}


/**
 * The layer for content above the main page content.
 *
 * @type {Layer_}
 * @private
 */
RenderingEngine_.prototype.aboveLayer_ = null;


/**
 * The layer for content below the main page content.
 *
 * @type {Layer_}
 * @private
 */
RenderingEngine_.prototype.belowLayer_ = null;


/**
 * The layer for stenciling out parts of the below layer.
 *
 * @type {Layer_}
 * @private
 */
RenderingEngine_.prototype.belowStencilLayer_ = null;


/**
 * The layer covers the seam between the above and below layers.
 *
 * @type {Layer_}
 * @private
 */
RenderingEngine_.prototype.seamLayer_ = null;


/**
 * The layer for stenciling out parts of the seam layer.
 *
 * @type {Layer_}
 * @private
 */
RenderingEngine_.prototype.seamStencilLayer_ = null;


/**
 * The size of the browser's visible page area.
 *
 * @type {Size2_}
 * @private
 */
RenderingEngine_.prototype.viewportSize_ = null;

// Exports
this['Renderer'] = Renderer;
