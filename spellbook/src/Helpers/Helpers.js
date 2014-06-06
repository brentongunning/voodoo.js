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
function getAbsoluteUrl_(url) {
  log_.assert_(url, 'url must be valid.', url, '(getAbsoluteUrl_)');
  log_.assert_(typeof url === 'string', 'url must be valid.', url,
      '(getAbsoluteUrl_)');

  var a = document.createElement('a');
  a.href = url;

  return a.href;
}


/**
 * Parses a 3-component vector into an object with x, y, z properties.
 *
 * @private
 *
 * @param {Object} vector Object or array to parse.
 *
 * @return {Object}
 */
function parseVector3_(vector) {
  log_.assert_(typeof vector === 'object', 'vector must be an object.',
      vector, '(parseVector3_)');

  if ('x' in vector) {

    // Case: Object

    log_.assert_('y' in vector, 'vector must contain y property.', vector,
        '(parseVector3_)');
    log_.assert_('z' in vector, 'vector must contain z property.', vector,
        '(parseVector3_)');

    log_.assert_(typeof vector.x === 'number',
        'Property x must be a number.', vector,
        '(parseVector3_)');
    log_.assert_(typeof vector.y === 'number',
        'Property y must be a number.', vector,
        '(parseVector3_)');
    log_.assert_(typeof vector.z === 'number',
        'Property z must be a number.', vector,
        '(parseVector3_)');

    return vector;

  } else {

    // Case: Array

    log_.assert_(Array.isArray(vector), 'vector must be an array.', vector,
        '(parseVector3_)');
    log_.assert_(vector.length === 3, 'vector must be of length 3.', vector,
        '(parseVector3_)');

    log_.assert_(typeof vector[0] === 'number',
        'Property 0 must be a number.', vector,
        '(parseVector3_)');
    log_.assert_(typeof vector[1] === 'number',
        'Property 1 must be a number.', vector,
        '(parseVector3_)');
    log_.assert_(typeof vector[2] === 'number',
        'Property 2 must be a number.', vector,
        '(parseVector3_)');

    return { x: vector[0], y: vector[1], z: vector[2] };

  }
}
