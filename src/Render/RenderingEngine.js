// ----------------------------------------------------------------------------
// File: RenderingEngine.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Base class for all rendering engines.
 *
 * @constructor
 * @private
 */
function RenderingEngine_() {}


/**
 * Shuts down the rendering engine.
 *
 * @private
 */
RenderingEngine_.prototype.destroy_ = function() {};


/**
 * Renders one frame
 *
 * @private
 */
RenderingEngine_.prototype.render_ = function() {};


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
