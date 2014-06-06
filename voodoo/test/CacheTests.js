// ----------------------------------------------------------------------------
// File: CacheTests.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------



/**
 * Tests for the model and view caches.
 *
 * @constructor
 */
var CacheTests = TestCase('CacheTests');


/**
 * Test case setup. Runs once before each test.
 */
CacheTests.prototype.setUp = function() {
  // Create an engine with no antialiasing so no seam layers.
  voodoo.engine = new voodoo.Engine({ antialias: false });

  // Global counters available to each test case.
  this.modelCacheHits = 0;
  this.modelCacheMisses = 0;
  this.viewCacheHits = 0;
  this.viewCacheMisses = 0;

  var globals = this;

  /**
   * A base view class for counting cache hits and misses.
   */
  this.BaseTestView = voodoo.View.extend({
    load: function() {
      if (this.cache.has('testKey')) {
        globals.viewCacheHits++;
        assertEquals('testValue', this.cache.get('testKey'));
      } else {
        globals.viewCacheMisses++;
        this.cache.set('testKey', 'testValue');
      }
    }
  });

  /**
   * A base model class for counting cache hits and misses.
   */
  this.BaseTestModel = voodoo.Model.extend({
    name: 'TestModel',
    viewType: this.BaseTestView,

    initialize: function(options) {
      if (this.cache.has('testKey')) {
        globals.modelCacheHits++;
        assertEquals('testValue', this.cache.get('testKey'));
      } else {
        globals.modelCacheMisses++;
        this.cache.set('testKey', 'testValue');
      }
    },

    clearCache: function() {
      this.cache.delete('testKey');
    }
  });
};


/**
 * Shuts down the engine between test cases.
 */
CacheTests.prototype.tearDown = function() {
  var voodooEngine = voodoo.engine;
  if (voodooEngine)
    voodooEngine.destroy();
};


/**
 * Tests all four functions of the model cache.
 */
CacheTests.prototype.testModelCache = function() {
  var TestModel = this.BaseTestModel.extend({
    organization: 'TestOrganization'
  });

  assertEquals(0, this.modelCacheHits);
  assertEquals(0, this.modelCacheMisses);

  new TestModel();

  assertEquals(0, this.modelCacheHits);
  assertEquals(1, this.modelCacheMisses);

  new TestModel();

  assertEquals(1, this.modelCacheHits);
  assertEquals(1, this.modelCacheMisses);

  var model = new TestModel();

  assertEquals(2, this.modelCacheHits);
  assertEquals(1, this.modelCacheMisses);

  model.clearCache();
  new TestModel();

  assertEquals(2, this.modelCacheHits);
  assertEquals(2, this.modelCacheMisses);
};


/**
 * Tests the model cache without specifying the organization name.
 */
CacheTests.prototype.testModelCacheWithNoOrganization = function() {
  assertEquals(0, this.modelCacheHits);
  assertEquals(0, this.modelCacheMisses);

  new this.BaseTestModel();

  assertEquals(0, this.modelCacheHits);
  assertEquals(1, this.modelCacheMisses);

  new this.BaseTestModel();

  assertEquals(1, this.modelCacheHits);
  assertEquals(1, this.modelCacheMisses);
};


/**
 * Tests that the views are successfully
 */
CacheTests.prototype.testViewCache = function() {
  var numViewsPerModel = 3;

  assertEquals(0, this.viewCacheHits);
  assertEquals(0, this.viewCacheMisses);

  new this.BaseTestModel();

  assertEquals(0, this.viewCacheHits);
  assertEquals(numViewsPerModel, this.viewCacheMisses);

  new this.BaseTestModel();

  assertEquals(numViewsPerModel, this.viewCacheHits);
  assertEquals(numViewsPerModel, this.viewCacheMisses);
};


/**
 * Tests that objects in other model's caches can be accessed.
 */
CacheTests.prototype.testForeignModelCache = function() {
  var TestView = voodoo.View.extend();
  var LocalModel = voodoo.Model.extend({
    name: 'Local',
    viewType: TestView,
    initialize: function(options) {
      this.cache.set('testKey', 'testValue', 'Foreign', 'TestOrganization');
    }
  });

  new LocalModel();

  var ForeignModel = voodoo.Model.extend({
    name: 'Foreign',
    organization: 'TestOrganization',
    viewType: TestView,
    initialize: function(options) {
      assertEquals('testValue', this.cache.get('testKey'));
    }
  });
};


/**
 * Tests that objects in other model's caches can be accessed but
 * without organization names
 */
CacheTests.prototype.testForeignModelCacheNoOrganization = function() {
  var TestView = voodoo.View.extend();
  var LocalModel = voodoo.Model.extend({
    name: 'Local',
    viewType: TestView,
    initialize: function(options) {
      this.cache.set('testKey', 'testValue', 'Foreign');
    }
  });

  new LocalModel();

  var ForeignModel = voodoo.Model.extend({
    name: 'Foreign',
    viewType: TestView,
    initialize: function(options) {
      assertEquals('testValue', this.cache.get('testKey'));
    }
  });

  new ForeignModel();
};
