{
	"metadata": {
		"version": 4.3,
		"type": "Object",
		"generator": "ObjectExporter"
	},
	"geometries": [
		{
			"uuid": "82BCF5C9-2142-41C9-8F41-5EBED91AB2F9",
			"type": "CircleGeometry",
			"radius": 20,
			"segments": 8
		},
		{
			"uuid": "37762E61-D338-4527-90FA-1300AE49DCAD",
			"type": "TorusGeometry",
			"radius": 100,
			"tube": 40,
			"radialSegments": 18,
			"tubularSegments": 16,
			"arc": 6.283185307179586
		}],
	"materials": [
		{
			"uuid": "87A53CCD-AA72-40D9-BB73-C3B0E9D3618A",
			"type": "MeshPhongMaterial",
			"color": 11176021,
			"ambient": 0,
			"emissive": 0,
			"specular": 1118481,
			"shininess": 30,
			"opacity": 1,
			"transparent": false,
			"wireframe": false
		},
		{
			"uuid": "6DBE300B-D06E-4F14-87C2-68A4C6C52359",
			"type": "MeshPhongMaterial",
			"color": 255,
			"ambient": 0,
			"emissive": 0,
			"specular": 1118481,
			"shininess": 30,
			"opacity": 1,
			"transparent": false,
			"wireframe": false
		}],
	"object": {
		"uuid": "47BC84C7-CFCF-4427-83DE-A0F5BBDCFABA",
		"type": "Scene",
		"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
		"children": [
			{
				"uuid": "B31D6D34-1B8B-4E14-B2AE-B202F139F9DF",
				"name": "Circle 1",
				"type": "Mesh",
				"geometry": "82BCF5C9-2142-41C9-8F41-5EBED91AB2F9",
				"material": "87A53CCD-AA72-40D9-BB73-C3B0E9D3618A",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0.1792980581521988,-11.746628761291504,0,1]
			},
			{
				"uuid": "CADAF928-C999-4D9B-A05B-AF1814C7693B",
				"name": "Torus 2",
				"type": "Mesh",
				"geometry": "37762E61-D338-4527-90FA-1300AE49DCAD",
				"material": "6DBE300B-D06E-4F14-87C2-68A4C6C52359",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,93.378173828125,1]
			}]
	}
}