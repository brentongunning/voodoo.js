var VoodooRingView = voodoo.View.extend({
  load: function() {
    this.geometry = new THREE.TorusGeometry(1, 0.135, 20, 80)
    this.material = new THREE.MeshPhongMaterial({ambient: 0x907030, color: 0x907030});
    this.torus = new THREE.Mesh(this.geometry, this.material);
    this.torus.rotation.y = Math.PI / 2;
    this.scene.add(this.torus);
  },
  unload: function() {
    this.scene.remove(this.torus);
  },
  update: function(x, y, scale) {
    this.torus.position.x = x;
    this.torus.position.y = y;
    this.torus.position.z = 0;
    this.torus.scale.x = this.torus.scale.y = this.torus.scale.z = scale;
    this.dirty();
  }
});

var VoodooRing = voodoo.Model.extend({
  name: 'VoodooRing',
  viewType: VoodooRingView,
  initialize: function(options) {
    this.color = options.color;
    this.upperElement = options.upperElement;
    this.lowerElement = options.lowerElement;
    this.x = 0;
    this.speed = -150;
  },
  update: function(deltaTime) {
    var upper = voodoo.utility.findAbsolutePosition(this.upperElement);
    var lower = voodoo.utility.findAbsolutePosition(this.lowerElement);

    var left = upper.x;
    var right = upper.x + this.upperElement.offsetWidth - 1;
    var top = upper.y;
    var bottom = lower.y + this.lowerElement.offsetHeight - 1;
    var height = (bottom - top) * 2.0 / 3.0;

    this.x += this.speed * deltaTime;
    if (this.speed > 0) {
      if (this.x > right) {
        this.x = right;
        this.speed = -this.speed;
      }
    }
    else {
      if (this.x < left) {
        this.x = left;
        this.speed = -this.speed;
      }
    }

    this.view.update(this.x, (top + bottom) / 2, height);
  },
});