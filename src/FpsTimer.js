// ----------------------------------------------------------------------------
// File: FpsTimer.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Measures frames per second and displays it in the top left corner
 * of the screen.
 *
 * @constructor
 * @private
 */
function FpsTimer_() {
  if (DEBUG) {
    this.showingFps_ = false;
    this.fpsCounter_ = 0;

    this.fpsDiv_ = document.createElement('div');
    this.fpsDiv_.style.position = 'fixed';
    this.fpsDiv_.style.zIndex = 999999999;
    this.fpsDiv_.style.left = '0px';
    this.fpsDiv_.style.top = '0px';
    this.fpsDiv_.style.backgroundColor = 'black';
    this.fpsDiv_.style.color = 'lime';
    this.fpsDiv_.style.fontStyle = 'bold';
    this.fpsDiv_.style.fontSize = '200%';
    this.fpsDiv_.style.fontFamily = 'sans-serif';
    this.fpsDiv_.display = 'none';

    // Create a timer that runs every second
    var self = this;
    this.fpsTimerId_ = setInterval(function() {
      self.fps = self.fpsCounter_;
      self.fpsCounter_ = 0;
    }, 1000);
  }
}


/**
 * Call this for each frame that runs to update the fps counters.
 */
FpsTimer_.prototype.frame = function() {
  this.fpsCounter_++;

  // Show or hide the frames per second.
  if (DEBUG && window['voodoo']['debug']['showFps']) {
    if (!this.showingFps_) {
      this.fpsDiv_.display = 'block';
      document.body.appendChild(this.fpsDiv_);
      this.showingFps_ = true;
    }

    this.fpsDiv_.innerHTML = 'FPS: ' + this.fps;
  }
  else {
    if (this.showingFps_) {
      this.fpsDiv_.display = 'none';
      document.body.removeChild(this.fpsDiv_);
      this.showingFps_ = false;
    }
  }
};


/**
 * Stops the fps timer.
 */
FpsTimer_.prototype.destroy = function() {
  if (this.showingFps_) {
    this.fpsDiv_.display = 'none';
    document.body.removeChild(this.fpsDiv_);
    this.showingFps_ = false;
  }

  // Stop the timer
  window.clearInterval(this.fpsTimerId_);
};


/**
 * The last calculated frames per second.
 *
 * @type {number}
 */
FpsTimer_.prototype.fps = 0;
