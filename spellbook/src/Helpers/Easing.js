// ------------------------------------------------------------------------------------------------
// File: Easing.js
//
// Copyright (c) 2014 Voodoojs Authors
// ------------------------------------------------------------------------------------------------


/**
 * Creates an ease out function.
 *
 * @private
 *
 * @param {function(number):number} f Ease in function.
 *
 * @return {function(number):number} Ease out function.
 */
function makeEaseOut_(f) {
  log_.assert_(f, 'f must be valid.', '(makeEaseOut_)');
  log_.assert_(typeof f === 'function', 'f must be a function.', '(makeEaseOut_)');

  return function(t) { return 1 - f(1 - t); };
}


/**
 * Creates an ease in and out function.
 *
 * This will ease in for the first half and ease out for the rest.
 *
 * @private
 *
 * @param {function(number):number} f Ease in function.
 *
 * @return {function(number):number} Ease in and out function.
 */
function makeEaseInOut_(f) {
  log_.assert_(f, 'f must be valid.', '(makeEaseInOut_)');
  log_.assert_(typeof f === 'function', 'f must be a function.', '(makeEaseInOut_)');

  var easeOut = makeEaseOut_(f);

  return function(t) {
    if (t < 0.5)
      return f(t * 2) / 2;
    else
      return 0.5 + easeOut((t - 0.5) * 2) / 2;
  };
}



/**
 * Built-in easing functions. Easing functions control the speed of animations. They take a time
 * from 0-1 and return an animation interpolation from 0-1.
 *
 * Based on Robert Penner's equations.
 *
 * @constructor
 */
function Easing() {}


/**
 * Linear easing.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.linear = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::linear)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::linear)');

  return t;
};


/**
 * Ease in quadratric.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInQuad = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInQuad)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInQuad)');

  return t * t;
};


/**
 * Ease out quadratric.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutQuad = makeEaseOut_(Easing.prototype.easeInQuad);


/**
 * Ease in and out quadratric.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutQuad = makeEaseInOut_(Easing.prototype.easeInQuad);


/**
 * Ease in cubic.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInCubic = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInCubic)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInCubic)');

  return t * t * t;
};


/**
 * Ease out cubic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutCubic = makeEaseOut_(Easing.prototype.easeInCubic);


/**
 * Ease in and out cubic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutCubic = makeEaseInOut_(Easing.prototype.easeInCubic);


/**
 * Ease in quartic.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInQuart = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInQuart)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInQuart)');

  var t2 = t * t;
  return t2 * t2;
};


/**
 * Ease out quartic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutQuart = makeEaseOut_(Easing.prototype.easeInQuart);


/**
 * Ease in and out quartic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutQuart = makeEaseInOut_(Easing.prototype.easeInQuart);


/**
 * Ease in quintic.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInQuint = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInQuint)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInQuint)');

  var t2 = t * t;
  return t2 * t2 * t;
};


/**
 * Ease out quintic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutQuint = makeEaseOut_(Easing.prototype.easeInQuint);


/**
 * Ease in and out quintic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutQuint = makeEaseInOut_(Easing.prototype.easeInQuint);


/**
 * Ease in sine.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInSine = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInSine)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInSine)');

  return 1 - Math.cos(t * Math.PI / 2);
};


/**
 * Ease out sine.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutSine = makeEaseOut_(Easing.prototype.easeInSine);


/**
 * Ease in and out sine.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutSine = makeEaseInOut_(Easing.prototype.easeInSine);


/**
 * Ease in exponential.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInExpo = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInExpo)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInExpo)');

  return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
};


/**
 * Ease out exponential.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutExpo = makeEaseOut_(Easing.prototype.easeInExpo);


/**
 * Ease in and out exponential.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutExpo = makeEaseInOut_(Easing.prototype.easeInExpo);


/**
 * Ease in circular.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInCirc = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInCirc)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInCirc)');

  return -Math.sqrt(1 - t * t) + 1;
};


/**
 * Ease out circular.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutCirc = makeEaseOut_(Easing.prototype.easeInCirc);


/**
 * Ease in and out circular.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutCirc = makeEaseInOut_(Easing.prototype.easeInCirc);


/**
 * Ease in elastic.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInElastic = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInElastic)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInElastic)');

  if (t === 0) return 0;
  if (t === 1) return 1;

  var p = 0.3;
  var s = p / 4;
  return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
};


/**
 * Ease out elastic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutElastic = makeEaseOut_(Easing.prototype.easeInElastic);


/**
 * Ease in and out elastic.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutElastic = makeEaseInOut_(Easing.prototype.easeInElastic);


/**
 * Ease in back.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInBack = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeInBack)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeInBack)');

  var s = 1.70158;
  return t * t * ((s + 1) * t - s);
};


/**
 * Ease out back.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutBack = makeEaseOut_(Easing.prototype.easeInBack);


/**
 * Ease in and out back.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutBack = makeEaseInOut_(Easing.prototype.easeInBack);


/**
 * Ease out bounce.
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeOutBounce = function(t) {
  log_.assert_(typeof t === 'number', t, 't must be a number.', '(Easing::easeOutBounce)');
  log_.assert_(t >= 0 && t <= 1, t, 't must be between 0 and 1.', '(Easing::easeOutBounce)');

  if (t < 1 / 2.75)
    return 7.5625 * t * t;
  else if (t < 2 / 2.75)
    return 7.5625 * (t -= 1.5 / 2.75) * t + .75;
  else if (t < 2.5 / 2.75)
    return 7.5625 * (t -= 2.25 / 2.75) * t + .9375;
  else
    return 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
};


/**
 * Ease in bounce.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInBounce = makeEaseOut_(Easing.prototype.easeOutBounce);


/**
 * Ease in and out bounce.
 *
 * @function
 *
 * @param {number} t Time.
 *
 * @return {number} Interpolation.
 */
Easing.prototype.easeInOutBounce = makeEaseInOut_(Easing.prototype.easeInBounce);


/**
 * Global easing functions. This is created automatically.
 */
this.easing = new Easing();
