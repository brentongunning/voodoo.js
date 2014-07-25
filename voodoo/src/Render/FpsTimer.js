// ------------------------------------------------------------------------------------------------
// File: FpsTimer.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * Measures frames per second and displays it in the top left corner of the screen.
 *
 * @constructor
 * @private
 */
function FpsTimer_() {
  this.showingFps_ = false;
  this.fpsCounter_ = 0;
  this.rpsCounter_ = 0;

  this.fpsDiv_ = document.createElement('div');
  var fpsDivStyle = this.fpsDiv_.style;
  fpsDivStyle.position = 'fixed';
  fpsDivStyle.zIndex = 999999999;
  fpsDivStyle.left = '0px';
  fpsDivStyle.top = '0px';
  fpsDivStyle.backgroundColor = 'black';
  fpsDivStyle.color = 'lime';
  fpsDivStyle.fontStyle = 'bold';
  fpsDivStyle.fontSize = '200%';
  fpsDivStyle.fontFamily = 'sans-serif';
  this.fpsDiv_.display = 'none';

  // Create a timer that runs every second
  var that = this;
  this.fpsTimerId_ = setInterval(function() {
    that.fps_ = that.fpsCounter_;
    that.rps_ = that.rpsCounter_;
    that.fpsCounter_ = 0;
    that.rpsCounter_ = 0;
  }, 1000);
}


/**
 * Stops the fps timer.
 *
 * @private
 */
FpsTimer_.prototype.destroy_ = function() {
  if (this.showingFps_) {
    this.fpsDiv_.display = 'none';
    document.body.removeChild(this.fpsDiv_);
    this.showingFps_ = false;
  }

  // Stop the timer
  window.clearInterval(this.fpsTimerId_);
};


/**
 * Call this for each frame that runs to update the fps counters.
 *
 * @private
 */
FpsTimer_.prototype.frame_ = function() {
  this.fpsCounter_++;

  // Show or hide the frames per second.
  if (window['voodoo']['debug']['showFps']) {
    if (!this.showingFps_) {
      this.fpsDiv_.display = 'block';
      document.body.appendChild(this.fpsDiv_);
      this.showingFps_ = true;
    }

    this.fpsDiv_.innerHTML = 'Frames/second: ' + this.fps_ + ', Renders/second: ' + this.rps_;
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
 * Call this for each render that runs to update the rps counters.
 *
 * @private
 */
FpsTimer_.prototype.render_ = function() {
  this.rpsCounter_++;
};


/**
 * The last calculated frames per second.
 *
 * @type {number}
 * @private
 */
FpsTimer_.prototype.fps_ = 0;
