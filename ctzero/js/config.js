{
	"camera": {
		"vr": false,
		"xlro": {
			"x": 20,
			"y": 1
		},
		"opts": {
			"antialias": true
		},
		"fov": 25,
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
	"multi": false,
	"room": {
		"gravity": true,
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
	"media": {
		"proxy": true
	},
	"brain": {
		"noChat": false,
		"chain": {
			"delay": 500
		},
		"responses": {
			"unintelligible": {
				"phrase": [
					"what was that?",
					"i didn't quite catch what you said",
					"could you please repeat that?",
					"i'm sorry, i missed that",
					"come again?"
				]
			}
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