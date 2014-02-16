// ----------------------------------------------------------------------------
// File: ThreeJsScene.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * The ThreeJs scene graph where objects may be added or removed.
 *
 * @constructor
 * @private
 *
 * @param {THREE.Scene} scene Three.js scene.
 * @param {View} view Parent view.
 */
function ThreeJsScene_(scene, view) {
  this.scene_ = scene;
  this.view_ = view;

  this.tracker_ = window['voodoo']['engine'].tracker_;
  this.trackId_ = null;

  // All objects in the local scene are added to a parent object which
  // is added to the root scene. This enables us to set local coordinate
  // systems for each View via locate().
  this.parent_ = new THREE.Object3D();
  this.scene_.add(this.parent_);

  this.objects_ = [];
  this.meshes_ = [];
  this.dispatcher_ = new Dispatcher_();

  Object.defineProperty(this, 'objects', {
    get: function() {
      // Create a copy of all the objects. A copy lets the user iterate over
      // them without worrying about invalidating our own list or them changing.
      var objects = [];
      var children = this.parent_.children;
      for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        if (child['addedToVoodooScene'])
          objects.push(children[i]);
      }
      return objects;
    },
    set: function() { log_.error_('objects is read-only'); },
    writeable: false
  });
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
  if (this.isMesh_(object)) {
    this.meshes_.push(object);
  }

  var event = new window['voodoo']['Event']('add');
  event.object = object;
  this.dispatcher_.dispatchEvent_(this.view_, event);
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
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h,
            move, resize) {
              self.parent_.position.x = x + w / 2.0;
              self.parent_.position.y = y + h / 2.0;
              self.parent_.scale.x = self.parent_.scale.y = 1.0;

              self.parent_.updateMatrixWorld(true);
              self.isDirty_ = true;

              if (move) {
                var event = new window['voodoo']['Event']('move');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }

              if (resize) {
                var event = new window['voodoo']['Event']('resize');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }
            });
      } else {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h,
            move, resize) {
              self.parent_.position.x = x + w / 2.0;
              self.parent_.position.y = y + h / 2.0;
              self.parent_.scale.x = w;
              self.parent_.scale.y = h;

              self.parent_.updateMatrixWorld(true);
              self.isDirty_ = true;

              if (move) {
                var event = new window['voodoo']['Event']('move');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }

              if (resize) {
                var event = new window['voodoo']['Event']('resize');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }
            });
      }
    } else {
      if (pixels) {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h,
            move, resize) {
              self.parent_.position.x = x;
              self.parent_.position.y = y;
              self.parent_.scale.x = self.parent_.scale.y = 1.0;

              self.parent_.updateMatrixWorld(true);
              self.isDirty_ = true;

              if (move) {
                var event = new window['voodoo']['Event']('move');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }

              if (resize) {
                var event = new window['voodoo']['Event']('resize');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }
            });
      } else {
        this.trackId_ = this.tracker_.track_(element, function(x, y, w, h,
            move, resize) {
              self.parent_.position.x = x;
              self.parent_.position.y = y;
              self.parent_.scale.x = w;
              self.parent_.scale.y = h;

              self.parent_.updateMatrixWorld(true);
              self.isDirty_ = true;

              if (move) {
                var event = new window['voodoo']['Event']('move');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }

              if (resize) {
                var event = new window['voodoo']['Event']('resize');
                event.object = element;
                event['client']['x'] = x;
                event['client']['y'] = y;
                event['size']['x'] = w;
                event['size']['y'] = h;
                self.dispatcher_.dispatchEvent_(null, event);
              }
            });
      }
    }

    var event = new window['voodoo']['Event']('attach');
    event.object = element;
    this.dispatcher_.dispatchEvent_(this.view_, event);
  }
};


/**
 * Removes the local coordinate system of the scene.
 *
 * @this {ThreeJsScene_}
 */
ThreeJsScene_.prototype['detach'] = function() {
  var event = new window['voodoo']['Event']('detach');
  this.dispatcher_.dispatchEvent_(null, event);

  this.tracker_.release_(this.trackId_);
  this.trackId_ = null;

  this.parent_.position.x = this.parent_.position.y = 0;
  this.parent_.scale.x = this.parent_.scale.y = 1;
  this.parent_.updateMatrixWorld(true);
};


/**
 * Removes an event handler.
 *
 * @this {Engine}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
ThreeJsScene_.prototype['off'] = function(type, listener) {
  this.dispatcher_.off_(type, listener);
};


/**
 * Adds an event handler.
 *
 * @this {Engine}
 *
 * @param {string} type Event type.
 * @param {function(Event)} listener Event listener.
 */
ThreeJsScene_.prototype['on'] = function(type, listener) {
  this.dispatcher_.on_(type, listener);
};


/**
 * Removes an object to the ThreeJs scene.
 *
 * @this {ThreeJsScene_}
 *
 * @param {THREE.Object3D} object Object to remove.
 */
ThreeJsScene_.prototype['remove'] = function(object) {
  var event = new window['voodoo']['Event']('remove');
  event.object = object;
  this.dispatcher_.dispatchEvent_(this.view_, event);

  if (object['addedToVoodooTriggers'])
    object.visible = false;
  else this.parent_.remove(object);

  object['addedToVoodooScene'] = false;

  var index = this.objects_.indexOf(object);
  if (index != -1)
    this.objects_.splice(index, 1);

  if (this.isMesh_(object)) {
    index = this.meshes_.indexOf(object);
    if (index != -1)
      this.meshes_.splice(index, 1);
  }
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

  this.dispatcher_.destroy_();
  this.dispatcher_ = null;
  this.scene_ = null;
  this.view_ = null;
  this.parent_ = null;
};


/**
 * Helper function to determine if an object added to the scene
 * is a mesh or something else (light, camera, etc.)
 *
 * @private
 *
 * @param {THREE.Object3D} object
 * @return {boolean} True if the object is a mesh. False if not.
 */
ThreeJsScene_.prototype.isMesh_ = function(object) {
  return object instanceof THREE.Mesh ||
      object instanceof THREE.MorphAnimMesh ||
      object instanceof THREE.SkinnedMesh ||
      object instanceof THREE.Line;
};
