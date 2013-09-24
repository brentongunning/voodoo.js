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
 *
 * @param {THREE.Scene} scene Three.js scene.
 */
function ThreeJsScene_(scene) {
  this.scene_ = scene;

  this.tracker_ = window['voodoo']['engine'].tracker_;
  this.trackId_ = null;

  // All objects in the local scene are added to a parent object which
  // is added to the root scene. This enables us to set local coordinate
  // systems for each View via locate().
  this.parent_ = new THREE.Object3D();
  this.scene_.add(this.parent_);

  this.objects_ = [];
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
  else this.parent_.add(object);

  object['addedToVoodooScene'] = true;

  this.objects_.push(object);
};


/**
 * Sets the local coordinate system of the scene by aligning to an HTML element.
 *
 * @this {ThreeJsScene_}
 *
 * @param {HTMLElement} element HTML element to attach to. If null, the
 *    local coordinate system is reset back to the top left corner of the page
 *    and scaled in pixels.
 * @param {boolean} center If true, sets the origin to the element's center.
 *    If false, sets the origin to the element's top left corner.
 * @param {boolean} pixels If true, one unit is one pixel. If false, one
 *    x unit is the element's width, and one y unit is the unit's height. Z
 *    is in pixels regardless.
 */
ThreeJsScene_.prototype['attach'] = function(element, center, pixels) {
  if (typeof center === 'undefined')
    center = true;
  if (typeof pixels === 'undefined')
    pixels = true;

  // Release the old tracker
  if (this.trackId_ !== null)
    this['detach']();

  // Attach to the new element and setup the callbacks.
  var self = this;
  if (element && typeof element !== 'undefined') {
    if (center) {
      if (pixels) {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h) {
          self.parent_.position.x = x + w / 2.0;
          self.parent_.position.y = y + h / 2.0;
          self.parent_.scale.x = self.parent_.scale.y = 1.0;
          self.parent_.updateMatrixWorld(true);
          self.isDirty_ = true;
        });
      } else {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h) {
          self.parent_.position.x = x + w / 2.0;
          self.parent_.position.y = y + h / 2.0;
          self.parent_.scale.x = w;
          self.parent_.scale.y = h;
          self.parent_.updateMatrixWorld(true);
          self.isDirty_ = true;
        });
      }
    } else {
      if (pixels) {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h) {
          self.parent_.position.x = x;
          self.parent_.position.y = y;
          self.parent_.scale.x = self.parent_.scale.y = 1.0;
          self.parent_.updateMatrixWorld(true);
          self.isDirty_ = true;
        });
      } else {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h) {
          self.parent_.position.x = x;
          self.parent_.position.y = y;
          self.parent_.scale.x = w;
          self.parent_.scale.y = h;
          self.parent_.updateMatrixWorld(true);
          self.isDirty_ = true;
        });
      }
    }
  }
};


/**
 * Removes the local coordinate system of the scene.
 *
 * @this {ThreeJsScene_}
 */
ThreeJsScene_.prototype['detach'] = function() {
  this.tracker_.release_(this.trackId_);
  this.trackId_ = null;

  this.parent_.position.x = this.parent_.position.y = 0;
  this.parent_.scale.x = this.parent_.scale.y = 1;
};


/**
 * Removes an object to the ThreeJs scene.
 *
 * @this {ThreeJsScene_}
 *
 * @param {THREE.Object3D} object Object to remove.
 */
ThreeJsScene_.prototype['remove'] = function(object) {
  if (object['addedToVoodooTriggers'])
    object.visible = false;
  else this.parent_.remove(object);

  object['addedToVoodooScene'] = false;

  var index = this.objects_.indexOf(object);
  if (index != -1)
    this.objects_.splice(index, 1);
};


/**
 * Destroys objects associated with the scene.
 *
 * @private
 */
ThreeJsScene_.prototype.destroy_ = function() {
  this.scene_.remove(this.parent_);
  if (this.trackId_ !== null)
    this['detach']();

  this.scene_ = null;
  this.parent_ = null;
};
