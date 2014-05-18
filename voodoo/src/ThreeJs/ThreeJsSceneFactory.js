// ----------------------------------------------------------------------------
// File: ThreeJsSceneFactory.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Creates ThreeJs scenes customized for each View.
 *
 * @constructor
 * @private
 */
function ThreeJsSceneFactory_() {
  log_.info_('Creating ThreeJs Scene Factory');

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
  log_.assert_(view, 'view must be valid.',
      '(ThreeJsSceneFactory_::createScene_)');

  return new ThreeJsScene_(this.scene_, view);
};


/**
 * Three js scene object.
 *
 * @private
 * @type {ThreeJsScene_}
 */
ThreeJsSceneFactory_.prototype.scene_ = null;
