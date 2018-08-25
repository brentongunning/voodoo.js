// The view
var VoodooJsonModelView = voodoo.View.extend({
  load: function() {
    var self = this;
    var binLoader = new THREE.JSONLoader();
    binLoader.load(this.model.jsonFile, function(geometry, materials) {
      var mesh = new THREE.Mesh(geometry, materials[0]);
      self.scene.add(mesh);
      mesh.position.z = self.model.zPosition;
      mesh.scale.x = self.model.scaleX;
      mesh.scale.y = self.model.scaleY;
      mesh.scale.z = self.model.scaleZ;
      mesh.rotation.x = self.model.rotationX;
      mesh.rotation.y = self.model.rotationY;
      mesh.rotation.z = self.model.rotationZ;
      self.mesh = mesh;

      var element = document.getElementById(self.model.elementId);
      mesh.position.x = self.model.offsetWidthMultiplier * element.offsetWidth;
      mesh.position.y = self.model.offsetHeightMultiplier * element.offsetHeight;

      self.dirty();
    });

    var element = document.getElementById(this.model.elementId);
    this.scene.attach(element, true, true);
  },
  below: false
});

// The model
var VoodooJsonModel = voodoo.Model.extend({
  name: 'VoodooJsonModel',
  viewType: VoodooJsonModelView,
  initialize: function(options) {
    this.elementId = options.elementId;
    this.jsonFile = options.jsonFile;
    this.offsetWidthMultiplier = options.offsetWidthMultiplier || 0;
    this.offsetHeightMultiplier = options.offsetHeightMultiplier || 0;
    this.scaleX = options.scaleX || options.scale || 1.0;
    this.scaleY = options.scaleY || options.scale || 1.0;
    this.scaleZ = options.scaleZ || options.scale || 1.0;
    this.rotationX = options.rotationX || 0.0;
    this.rotationY = options.rotationY || 0.0;
    this.rotationZ = options.rotationZ || 0.0;
    this.zPosition = options.zPosition || 0.0;
  }
});