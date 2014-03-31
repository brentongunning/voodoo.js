// ----------------------------------------------------------------------------
// File: ShaderTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Test cases to make sure the Shader class works as expected.
 *
 * @constructor
 */
ShaderTests = TestCase('ShaderTests');


/**
 * Shutdown the engine between test cases.
 */
ShaderTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests that the Shader class can be extended from other types.
 */
ShaderTests.prototype.testShaderExtend = function() {
  var Base = voodoo.Model.extend({
    name: 'Base',
    viewType: voodoo.View.extend({
      load: function() {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial();
        var mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
      }
    })
  });

  var ShaderBase = Base.extend(voodoo.Shader);
  var BaseShader = voodoo.Shader.extend(Base);

  var instance1 = new ShaderBase();
  var instance2 = new BaseShader();

  instance1.ambient = 'black';
  instance2.setEmissive('blue');
};


/**
 * Tests that the changeAmbient, changeEmissive and changeShading events work.
 */
ShaderTests.prototype.testShaderEvents = function() {
  var instance = new voodoo.Shader();

  var changeAmbient = 0;
  var changeEmissive = 0;
  var changeShading = 0;

  instance.on('changeAmbient', function() { changeAmbient++; });
  instance.on('changeEmissive', function() { changeEmissive++; });
  instance.on('changeShading', function() { changeShading++; });

  instance.ambient = 'yellow';
  instance.emissive = 'red';
  instance.shading = voodoo.Shader.ShadingStyle.Flat;

  instance.setAmbient('green');
  instance.setEmissive('blue');
  instance.setShading(voodoo.Shader.ShadingStyle.None);

  assertEquals(2, changeEmissive);
  assertEquals(2, changeAmbient);
  assertEquals(2, changeShading);
};
