// ----------------------------------------------------------------------------
// File: ThreeJsSceneFactory.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates ThreeJs scenes customized for each View.
 *
 * @constructor
 * @private
 */
function ThreeJsSceneFactory_() {
  log_.information_('Creating ThreeJs Scene Factory');

  this.scene_ = new THREE.Scene();
}


/**
 * Inherit from SceneFactory_.
 */
ThreeJsSceneFactory_.prototype = new SceneFactory_();


/**
 * Set the constructor back.
 */
ThreeJsSceneFactory_.prototype.constructor = ThreeJsSceneFactory_.constructor;


/**
 * Creates a Scene specific to a View.
 *
 * @private
 *
 * @param {View} view View that owns this triggers.
 * @return {ThreeJsScene_} Instantiated Scene.
 */
ThreeJsSceneFactory_.prototype.createScene_ = function(view) {
  return new ThreeJsScene_(this.scene_);
};


/**
 * Three js scene object.
 *
 * @private
 * @type {ThreeJsScene_}
 */
ThreeJsSceneFactory_.prototype.scene_ = null;
