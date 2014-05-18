// ----------------------------------------------------------------------------
// File: Tracker.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tracks the positions of 2D HTML elements, and fires events when they move,
 * which is used to adjust the local coordinate systems of scene automatically.
 *
 * @constructor
 * @private
 */
function Tracker_() {
  log_.info_('Creating Tracker');

  this.trackedElements_ = {};
  this.nextTrackedElementId_ = 0;

  this.nextTrackId_ = 0;
  this.tracks_ = {};
}


/**
 * Adds a track to an HTML element.
 *
 * @private
 *
 * @param {HTMLElement} element Html DOM element to track.
 * @param {function(number, number, number, number, boolean, boolean)} callback
 *    Callback to fire when the element moves.
 * @return {number} Track id used to release the callback.
 */
Tracker_.prototype.track_ = function(element, callback) {
  log_.assert_(element, 'element must be valid.', '(Tracker_::track_)');
  log_.assert_(callback, 'callback must be valid.', '(Tracker_::track_)');
  log_.assert_(typeof callback === 'function',
      'callback must be a function.', '(Tracker_::track_)');

  // Find or create the tracked element
  var trackedElement, trackedElementId;
  if (element.hasOwnProperty('VoodooTrackedElementId')) {
    // The element has already been added.
    trackedElementId = element['VoodooTrackedElementId'];
    trackedElement = this.trackedElements_[trackedElementId];
  } else {
    // We are not currently tracking this element. Add it.
    trackedElementId = element['VoodooTrackedElementId'] =
        this.nextTrackedElementId_++;
    trackedElement = this.trackedElements_[trackedElementId] =
        new TrackedElement_(element);
  }

  log_.assert_(trackedElement, 'TrackedElement not found.',
      '(Tracker_::track_)');

  // Add the callback
  var callbackId = trackedElement.addCallback_(callback);

  // Generate a track id and return it
  var trackId = this.nextTrackId_++;
  this.tracks_[trackId] = {
    trackedElementId: trackedElementId,
    trackedElement: trackedElement,
    callbackId: callbackId
  };

  return trackId;
};


/**
 * Releases a callback.
 *
 * @private
 *
 * @param {number} trackId Id of the track to release.
 */
Tracker_.prototype.release_ = function(trackId) {
  log_.assert_(trackId >= 0, 'trackId must be >= 0.',
      trackId, '(Tracker_::release_)');
  log_.assert_(typeof trackId === 'number', 'trackId must be a number.',
      trackId, '(Tracker_::release_)');

  // Find the information for this track id
  var trackInfo = this.tracks_[trackId];
  var trackedElement = trackInfo.trackedElement;
  var trackedElementId = trackInfo.trackedElementId;
  var callbackId = trackInfo.callbackId;

  delete this.tracks_[trackId];

  // Release the callback from the tracked element
  trackedElement.releaseCallback_(callbackId);

  if (trackedElement.numCallbacks_ === 0) {
    delete this.trackedElements_[trackedElementId];
    delete trackedElement.element_['VoodooTrackedElementId'];
  }
};


/**
 * Call each frame to detect changes in positions and sizes of HTML elements.
 *
 * @private
 */
Tracker_.prototype.update_ = function() {
  for (var trackedElement in this.trackedElements_)
    this.trackedElements_[trackedElement].update_();
};
