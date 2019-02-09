{
	"camera": {
		"opts": {
			"antialias": true
		},
		"noControls": false,
		"controls": {
			"rotateSpeed": 1.0,
			"zoomSpeed": 1.2,
			"panSpeed": 0.8,
			"noZoom": false,
			"noPan": false,
			"staticMoving": true,
			"dynamicDampingFactor": 0.3
		},
		"springs": {
			"position": {
				"x": {
					"k": 20,
					"damp": 40
				},
				"y": {
					"k": 20,
					"damp": 40
				},
				"z": {
					"k": 20,
					"damp": 40
				}
			},
			"rotation": {
				"x": {
					"k": 20,
					"damp": 40
				},
				"y": {
					"k": 20,
					"damp": 40
				},
				"z": {
					"k": 20,
					"damp": 40
				}
			},
			"looker": {
				"x": {
					"k": 20,
					"damp": 5
				},
				"y": {
					"k": 20,
					"damp": 5
				},
				"z": {
					"k": 20,
					"damp": 5
				}
			}
		},
		"patterns": {}
	},
	"room": {
		"name": "vroom",
		"lights": [{
			"variety": "ambient"
		}],
		"objects": []
	},
	"people": [],
	"script": [],
	"morphs": {
		"delta_cutoff": 0.1
	},
	"brain": {
		"chain": {
			"delay": 500
		},
		"modal": {
			"noClose": true,
			"className": "basicpopup noframe",
			"transition": "slide",
			"slide": {
				"origin": "right"
			}
		}
	}
}