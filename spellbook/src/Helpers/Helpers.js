// ----------------------------------------------------------------------------
// File: Helpers.js
//
// Copyright (c) 2014 Voodoojs Authors
// ----------------------------------------------------------------------------


/**
 * A dummy view that may be used when nothing should be shown.
 *
 * @private
 *
 * @param {string} url Absolute or relative url.
 *
 * @return {string} Absolute path url.
 */
function getAbsoluteUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.href;
}
