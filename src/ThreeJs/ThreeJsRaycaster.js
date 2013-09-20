// ----------------------------------------------------------------------------
// File: ThreeJsRaycaster.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Raycasts into the ThreeJs scenes for hit testing.
 *
 * @constructor
 * @private
 *
 * @param {Engine} engine Voodoo main engine.
 */
function ThreeJsRaycaster_(engine) {
  log_.assert_(typeof engine !== 'undefined', 'Engine must be defined.');
  log_.assert_(typeof engine.renderer_ !== 'undefined',
      'Renderer must be defined.');

  this.engine_ = engine;
  this.renderer_ = engine.renderer_;

  this.projector_ = new THREE.Projector();
}


/**
 * Inherit from Raycaster_.
 */
ThreeJsRaycaster_.prototype = new Raycaster_();


/**
 * Set the constructor back.
 */
ThreeJsRaycaster_.prototype.constructor = ThreeJsRaycaster_.constructor;


/**
 * Gets the next closest intersection on the above layer.
 *
 * This will actually check all objects in the below layer too
 * because ThreeJs has no way to limit rays based on camera
 * clip distance. However, we still perform checks on the below
 * layer for objects that only exist in the below layer.
 *
 * @private
 *
 * @param {Object} currentClosest Currently the closest hit.
 * @param {Array.<Model>} stencilIntersections Models intersecting on stencil.
 *
 * @return {Object} The new closest hit.
 */
ThreeJsRaycaster_.prototype.findClosestAboveLayerIntersection_ = function(
    currentClosest, stencilIntersections) {
  var triggers = this.renderer_.aboveLayer_.triggersFactory_.triggers_;

  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var obj = trigger.object_;
    var model = trigger.model_;

    var intersections = this.aboveRaycaster_.intersectObject(obj, true);

    // Check for at least one intersection on the object
    if (intersections.length <= 0)
      continue;

    // Check that the hit distance is closer than what we currently have
    if (intersections[0]['distance'] <= 0 ||
        intersections[0]['distance'] >= currentClosest.distance)
      continue;

    // Make sure that our intersection point is any of the following
    //  1) Above Z=0
    //  2) Below Z=0 AND the stencil layer isn't being used.
    //  3) Below Z=0 AND the stencil layer is used AND our ray intersects it
    if (this.engine_.options_['belowLayer'] &&
        intersections[0]['point']['z'] < 0 &&
        trigger.view_['below'] &&
        this.engine_.options_['stencils'] &&
        model['viewType'] != model['stencilViewType'] &&
        stencilIntersections.indexOf(model) === -1)
      continue;

    // New closest intersection. Save it.
    currentClosest.distance = intersections[0]['distance'];
    currentClosest.trigger = trigger;
    currentClosest.point = intersections[0]['point'];
  }

  return currentClosest;
};


/**
 * Gets the next closest intersection on the below layer.
 *
 * This actually only checks objects that completely exist in the below layer.
 *
 * @private
 *
 * @param {Object} currentClosest Currently the closest hit.
 * @param {Array.<Model>} stencilIntersections Models intersecting on stencil.
 *
 * @return {Object} The new closest hit.
 */
ThreeJsRaycaster_.prototype.findClosestBelowLayerIntersection_ =
    function(currentClosest, stencilIntersections) {
  var triggers = this.renderer_.belowLayer_.triggersFactory_.triggers_;

  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var model = trigger.model_;
    var obj = trigger.object_;

    // If the trigger has any part in the above layer, then ignore it
    // because we already checked it during the above layer checks.
    if (this.engine_.options_['aboveLayer'] && model['view']['above'])
      continue;

    var intersections = this.belowRaycaster_['intersectObject'](obj, true);

    // Check for at least one intersection on the object
    if (intersections.length <= 0)
      continue;

    // Make sure the intersection is in the below layer
    if (intersections[0]['point']['z'] >= 0)
      continue;

    // Check that the hit distance is closer than what we currently have
    if (intersections[0]['distance'] <= 0 ||
        intersections[0]['distance'] >= currentClosest.distance)
      continue;

    // Look for a stencil intersection
    if (this.engine_.options_['stencils'] &&
        model['viewType'] != model['stencilViewType'] &&
        stencilIntersections.indexOf(model) === -1)
      continue;

    // New closest intersection. Save it.
    currentClosest.distance = intersections[0]['distance'];
    currentClosest.trigger = trigger;
    currentClosest.point = intersections[0]['point'];
  }

  return currentClosest;
};


/**
 * Gets all models on the stencil layer that intersect with the mouse.
 *
 * @private
 *
 * @return {Array.<Model>} All intersecting models on the stencil layer.
 */
ThreeJsRaycaster_.prototype.findStencilLayerIntersections_ = function() {
  var stencilIntersections = [];
  var stencilTriggers =
      this.renderer_.belowStencilLayer_.triggersFactory_.triggers_;

  for (var i = 0; i < stencilTriggers.length; ++i) {
    var trigger = stencilTriggers[i];
    var obj = trigger.object_;
    var model = trigger.model_;

    // When the view and stencil view are the same types, stencil checking
    // doesn't matter.
    if (model['viewType'] === model['stencilViewType'])
      continue;

    // Check if a stencil layer could even exists at all
    if (!trigger.view_['below'])
      continue;

    // If we already checked this model, continue
    if (stencilTriggers.indexOf(model) !== -1)
      continue;

    // Check for a hit
    if (this.belowRaycaster_.intersectObject(obj, true).length > 0)
      stencilIntersections.push(model);
  }

  return stencilIntersections;
};


/**
 * Raycasts based on the current mouse and returns the intersected trigger.
 *
 * The return object has the following members:
 *    trigger - The EventTrigger_ that the ray intersected, or null for none.
 *    hitX - X position where the hit occurred.
 *    hitY - Y position where the hit occurred.
 *    hitZ - Z position where the hit occurred.
 *
 * @private
 *
 * @return {Object}
 */
ThreeJsRaycaster_.prototype.raycast_ = function() {
  var closestIntersection = {
    distance: Number.MAX_VALUE,
    trigger: null,
    point: null
  };

  if (this.engine_.options_['belowLayer'] &&
      this.engine_.options_['aboveLayer']) {
    // With both canvases, raycast on both layers
    var stencilIntersections = this.engine_.options_['stencils'] ?
        this.findStencilLayerIntersections_() : [];

    closestIntersection = this.findClosestAboveLayerIntersection_(
        closestIntersection, stencilIntersections);
    closestIntersection = this.findClosestBelowLayerIntersection_(
        closestIntersection, stencilIntersections);
  }
  else if (this.engine_.options_['aboveLayer']) {
    // With only the above canvas, raycast only the above layer
    closestIntersection = this.findClosestAboveLayerIntersection_(
        closestIntersection, []);
  }
  else if (this.engine_.options_['belowLayer']) {
    // With only the below canvas, raycast stencils and the below layer
    var stencilIntersections = this.findStencilLayerIntersections_();
    closestIntersection = this.findClosestBelowLayerIntersection_(
        closestIntersection, stencilIntersections);
  }

  var point = closestIntersection.point;
  return {
    trigger: closestIntersection.trigger,
    hitX: point ? point['x'] : Number.MAX_VALUE,
    hitY: point ? point['y'] : Number.MAX_VALUE,
    hitZ: point ? point['z'] : Number.MAX_VALUE
  };
};


/**
 * Creates the raycaster objects used to intersect objects. This
 * needs to be called when the mouse moves.
 *
 * @private
 *
 * @param {Vector2_} mouse Client mouse position.
 */
ThreeJsRaycaster_.prototype.setMouse_ = function(mouse) {
  var mx = (mouse.x / this.renderer_.viewportSize_.width) * 2 - 1;
  var my = -(mouse.y / this.renderer_.viewportSize_.height) * 2 + 1;

  // Create the above raycaster.
  if (this.engine_.options_['aboveLayer']) {
    var aboveThreeJsCamera = this.renderer_.aboveLayer_.camera_.camera_;

    this.aboveMouseVector_ = new THREE.Vector3(mx, my, 1);

    this.projector_.unprojectVector(
        this.aboveMouseVector_,
        aboveThreeJsCamera);

    this.aboveMouseVector_ = this.aboveMouseVector_.sub(
        aboveThreeJsCamera.position).normalize();

    this.aboveRaycaster_ = new THREE.Raycaster(
        aboveThreeJsCamera.position,
        this.aboveMouseVector_);
  }

  // Create the below raycaster.
  if (this.engine_.options_['belowLayer']) {
    var belowThreeJsCamera = this.renderer_.belowLayer_.camera_.camera_;

    this.belowMouseVector_ = new THREE.Vector3(mx, my, 1);

    this.projector_.unprojectVector(
        this.belowMouseVector_,
        belowThreeJsCamera);

    this.belowMouseVector_ = this.belowMouseVector_.sub(
        belowThreeJsCamera.position).normalize();

    this.belowRaycaster_ = new THREE.Raycaster(
        belowThreeJsCamera.position,
        this.belowMouseVector_);
  }
};
