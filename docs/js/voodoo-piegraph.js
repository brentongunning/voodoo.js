// Pie graph view
var VoodooPieGraphView = voodoo.View.extend({
  load: function() {
    this.meshes = [];
    this.triggerMeshes = [];

    // Pie graph data
    var data = this.model.data;
    this.data = data;

    // Create each section
    var percentAccumulator = 0.0;
    var segmentsPerPercent = 1;
    var radius = 140.0;
    var height = 50.0;
    for (var i = 0; i < data.length; ++i) {
      var section = data[i];
      var geometry = new THREE.Geometry();
      var numSegments = Math.max(Math.floor(section.percent * segmentsPerPercent * 100.0), 2.0);

      // Create vertices
      geometry.vertices.push(new THREE.Vector3(0.0, 0.0, 0.0));
      geometry.vertices.push(new THREE.Vector3(0.0, 0.0, 1.0));
      for (var j = 0; j < numSegments; ++j) {
        var radians = j / (numSegments - 1) * Math.PI * 2.0 * section.percent;
        var x = Math.cos(radians);
        var y = Math.sin(radians);
        geometry.vertices.push(new THREE.Vector3(x, y, 0.0));
        geometry.vertices.push(new THREE.Vector3(x, y, 1.0));
      }

      // Create faces
      for (var j = 0; j < numSegments - 1; ++j) {
        // Top
        geometry.faces.push(new THREE.Face3(1, (j + 1) * 2 + 1, (j + 2) * 2 + 1));
        // Outside
        geometry.faces.push(new THREE.Face3((j + 1) * 2, (j + 2) * 2, (j + 1) * 2 + 1));
        geometry.faces.push(new THREE.Face3((j + 1) * 2 + 1, (j + 2) * 2, (j + 2) * 2 + 1));
      }
      // Inside
      geometry.faces.push(new THREE.Face3(0, 2, 1));
      geometry.faces.push(new THREE.Face3(2, 3, 1));
      geometry.faces.push(new THREE.Face3(0, numSegments * 2 + 1, numSegments * 2));
      geometry.faces.push(new THREE.Face3(0, 1, numSegments * 2 + 1));

      // Create material and mesh
      geometry.computeFaceNormals();
      var material = new THREE.MeshLambertMaterial({color: section.color, ambient: 0x404040});
      var mesh = new THREE.Mesh(geometry, material);
      mesh.scale.x = radius;
      mesh.scale.y = radius;
      mesh.scale.z = height;
      mesh.position.z = 1;
      mesh.rotation.z = percentAccumulator * Math.PI * 2.0 + Math.PI;
      this.meshes.push(mesh);
      this.scene.add(mesh);

      var normalRadians = (percentAccumulator + section.percent / 2.0) * Math.PI * 2.0 + Math.PI;;
      this.data[i].normal = new THREE.Vector3(Math.cos(normalRadians), Math.sin(normalRadians), 0.0);
      this.data[i].current = 0.0;
      this.data[i].target = 0.0;

      var triggerMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      triggerMesh.scale.x = radius;
      triggerMesh.scale.y = radius;
      triggerMesh.scale.z = height;
      triggerMesh.position.z = 1;
      triggerMesh.rotation.z = percentAccumulator * Math.PI * 2.0 + Math.PI;
      this.triggers.add(triggerMesh, i);
      this.triggerMeshes.push(triggerMesh);

      percentAccumulator += section.percent;
    }
    this.triggers.cursor('pointer');
  },
  unload: function() {
    for (var i = 0; i < this.meshes.length; ++i)
      this.scene.remove(this.meshes[i]);
  },
  update: function(deltaTime) {
    var outSpeed = 8.0;
    var inSpeed = 2.0;
    var element = document.getElementById(this.model.elementId);
    var pos = voodoo.utility.findAbsolutePosition(element);
    for (var i = 0; i < this.meshes.length; ++i) {
      if (this.data[i].current != this.data[i].target)
        this.dirty();

      this.meshes[i].position.x = pos.x + element.offsetWidth / 2;
      this.meshes[i].position.y = pos.y + element.offsetHeight / 2;

      this.triggerMeshes[i].position.x = this.meshes[i].position.x;
      this.triggerMeshes[i].position.y = this.meshes[i].position.y;

      if (this.data[i].current < this.data[i].target) {
        this.data[i].current += deltaTime * outSpeed;
        if (this.data[i].current > this.data[i].target)
          this.data[i].current = this.data[i].target;
      }
      else if (this.data[i].current > this.data[i].target) {
        this.data[i].current -= deltaTime * inSpeed;
        if (this.data[i].current < this.data[i].target)
          this.data[i].current = this.data[i].target;
      }

      this.meshes[i].position.x += this.data[i].normal.x * this.data[i].current * 20;
      this.meshes[i].position.y += this.data[i].normal.y * this.data[i].current * 20;
    }
  },
  over: function(i) {
    this.data[i].target = 1.0;
  },
  out: function(i) {
    this.data[i].target = 0.0;
  },
  below: false
});

// The graph model
var VoodooPieGraph = voodoo.Model.extend({
  name: 'VoodooPieGraph',
  viewType: VoodooPieGraphView,
  update: function(deltaTime) {
    this.view.update(deltaTime);
  },
  initialize: function(options) {
    this.elementId = options.elementId;
    this.data = options.data;
    var self = this;
    self.on('mouseover', function(event) {
      self.view.over(event.triggerId);
    });
    self.on('mouseout', function(event) {
      self.view.out(event.triggerId);
    });
  }
});