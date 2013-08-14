// ----------------------------------------------------------------------------
// File: ThreeJsScene.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The ThreeJs scene graph where objects may be added or removed.
 *
 * @constructor
 * @private
 */
function ThreeJsScene_() {
  log_.information_('Creating ThreeJs Scene');

  this.scene_ = new THREE.Scene();
}


/**
 * Inherit from Scene.
 */
ThreeJsScene_.prototype = new Scene();


/**
 * Set the constructor back.
 */
ThreeJsScene_.prototype.constructor = ThreeJsScene_.constructor;


/**
 * Adds an object to the ThreeJs scene.
 *
 * @this {ThreeJsScene_}
 *
 * @param {THREE.Object3D} object Object to add.
 */
ThreeJsScene_.prototype['add'] = function(object) {
  if (object['addedToVoodooTriggers'])
    object.visible = true;
  else this.scene_.add(object);

  object['addedToVoodooScene'] = true;
};


/**
 * Removes an object to the ThreeJs scene.
 *
 * @this {ThreeJsScene_}
 *
 * @param {THREE.Object3D} object Object to remove.
 */
ThreeJsScene_.prototype['remove'] = function(object) {
  this.scene_.remove(object);

  if (object['addedToVoodooTriggers'])
    object.visible = false;
  else this.scene_.add(object);

  object['addedToVoodooScene'] = false;
};
