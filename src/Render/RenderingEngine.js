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
 * Enables or disables whether the above canvas captures mouse
 * events or lets them fall through to the page. When the user is hovering
 * over a 3D object, then links on the page, etc. shouldn't be selectable.
 *
 * This is called by the mouse detector.
 *
 * @private
 *
 * @param {boolean} capture Whether to capture mouse events or not.
 */
RenderingEngine_.prototype.capturePointerEvents_ = function(capture) {};


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
 * Sets the current mouse cursor on the canvases.
 *
 * @private
 *
 * @param {string} cursor CSS cursor style.
 */
RenderingEngine_.prototype.setCursor_ = function(cursor) {};


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
