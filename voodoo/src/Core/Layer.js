// ------------------------------------------------------------------------------------------------
// File: Layer.js
//
// Copyright (c) 2014 VoodooJs Authors
// ------------------------------------------------------------------------------------------------



/**
 * A layer is essentially a render pass on a scene. Voodoo's engine may create multiple layers,
 * and each view is instantiated on each layer when the model is created.
 *
 * @constructor
 * @private
 *
 * @param {LayerPass_} pass Type of graphics engine pass.
 * @param {Renderer} renderer The 3d graphics engine.
 * @param {Camera} camera This layer's virtual camera.
 * @param {SceneFactory_} sceneFactory Scene factory.
 * @param {TriggersFactory_} triggersFactory Triggers factory.
 * @param {CacheFactory_} cacheFactory Cache factory.
 */
function Layer_(pass, renderer, camera, sceneFactory, triggersFactory,
    cacheFactory) {
  log_.assert_(pass, 'pass must be valid.', pass, '(Layer_::Layer_)');
  log_.assert_(renderer === Renderer['ThreeJs'], 'Only ThreeJs is supported.', renderer,
      '(Layer_::Layer_)');
  log_.assert_(camera, 'camera must be valid.', '(Layer_::Layer_)');
  log_.assert_(sceneFactory, 'sceneFactory must be valid.', '(Layer_::Layer_)');
  log_.assert_(triggersFactory, 'triggersFactory must be valid.', '(Layer_::Layer_)');

  this.pass_ = pass;
  this.renderer_ = renderer;
  this.camera_ = camera;
  this.sceneFactory_ = sceneFactory;
  this.triggersFactory_ = triggersFactory;
  this.cacheFactory_ = cacheFactory;
  this.views_ = [];
}


/**
 * Registers a view with this layer.
 *
 * @private
 *
 * @param {View} view View to add.
 */
Layer_.prototype.addView_ = function(view) {
  log_.assert_(view, 'view must be valid.', '(Layer_::addView_)');

  this.views_.push(view);
};


/**
 * Resets all dirty flags on all objects in a layer.
 *
 * @private
 */
Layer_.prototype.clearDirtyFlags_ = function() {
  for (var viewIndex = 0, numViews = this.views_.length; viewIndex < numViews; ++viewIndex) {
    var scene = this.views_[viewIndex]['scene'];

    scene.isDirty_ = false;
    scene.forceRender_ = false;
  }
};


/**
 * Determines if a layer needs to be rendered again.
 *
 * @private
 *
 * @return {boolean} True if the layer needs to be rendered. False if not.
 */
Layer_.prototype.isRenderNeeded_ = function() {
  var frustum = this.camera_.frustum_;
  for (var viewIndex = 0, numViews = this.views_.length; viewIndex < numViews; ++viewIndex) {
    var view = this.views_[viewIndex];
    var scene = view['scene'];

    if (!view['loaded'])
      continue;

    if (scene.forceRender_)
      return true;

    if (scene.isDirty_) {
      var meshes = scene.meshes_;

      // If a scene has any non-mesh objects, then we have to redraw.
      if (meshes.length !== scene.objects_.length)
        return true;

      for (var meshIndex = 0, numMeshes = meshes.length; meshIndex < numMeshes; ++meshIndex) {
        var mesh = meshes[meshIndex];

        if (mesh['geometry']) {
          mesh.updateMatrixWorld(true);
          if (frustum.intersectsObject(mesh))
            return true;
        }
      }
    }
  }

  return false;
};


/**
 * Unregisters a view from this layer.
 *
 * @private
 *
 * @param {View} view View to remove.
 */
Layer_.prototype.removeView_ = function(view) {
  var index = this.views_.indexOf(view);

  log_.assert_(index !== -1, 'View not found.', '(Layer_::removeView_)');

  this.views_.splice(index, 1);
};


/**
 * The cache factory for this layer.
 *
 * @private
 * @type {CacheFactory_}
 */
Layer_.prototype.cacheFactory_ = null;


/**
 * The camera for this layer.
 *
 * @private
 * @type {Camera}
 */
Layer_.prototype.camera_ = null;


/**
 * The type of rendering pass.
 *
 * @private
 * @type {LayerPass_}
 */
Layer_.prototype.pass_ = null;


/**
 * The type of rendering engine.
 *
 * @private
 * @type {Renderer}
 */
Layer_.prototype.renderer_ = null;


/**
 * The scene factory for this layer.
 *
 * @private
 * @type {SceneFactory_}
 */
Layer_.prototype.sceneFactory_ = null;


/**
 * The triggers factory for this layer.
 *
 * @private
 * @type {TriggersFactory_}
 */
Layer_.prototype.triggersFactory_ = null;


/**
 * The views rendering on this layer.
 *
 * @private
 * @type {Array.<View>}
 */
Layer_.prototype.views_ = null;
