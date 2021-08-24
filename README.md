# ctzero
This package contains the core zero libraries.


# Back (Init Config)

    import os
    mdir = os.path.join("js", "morphs")
    cdir = os.path.join("js", "custom")
    tdir = os.path.join("js", "templates")
    edir = os.path.join("js", "environments")
    dirs = ["sound", "sound_in", "maps", "models", mdir, cdir, tdir, edir]
    copies = {
    	mdir: ["head1.js"]
    }
    
    syms = {
    	".": ["_zero.py", "_speech.py", "ardata"],
    	"js": ["zero", "shaders"]
    }
    model = {
    	"ctzero.model": ["*"]
    }
    routes = {
    	"/_zero": "_zero.py",
    	"/_speech": "_speech.py",
    	"/sound": "sound",
    	"/maps": "maps",
    	"/models": "models",
    	"/ardata": "ardata"
    }
    cfg = {
    	"asr": {
    		"audlib": "ffmpeg", # or avconv (certain older distros)
    		"mode": "gcloud",   # or "baidu" -- default "gcloud" mode requires gcloud to be installed and configured
    		"id": None,         # baidu only
    		"secret": None      # baidu only
    	},
    	"chat": {
    		"mode": "aiio",     # aiio | pandorabots
    		"appid": None,      # pb only
    		"userkey": None,    # pb only
    		"botname": None
    	}
    }
    requires = ["ctuser"]

# Front (JS Config)

## core.config.ctzero
### Import line: 'CT.require("core.config");'
    {
    	"lib": {
    		"ar": "https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar.js"
    	},
    	"camera": {
    		"ar": false,
    		"vr": false,
    		"mouse": true,
    		"xlro": {
    			"x": 20,
    			"y": -0.5
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
    		"objects": [],
    		"automatons": []
    	},
    	"people": [],
    	"script": [],
    	"morphs": {
    		"delta_cutoff": 0.1
    	},
    	"media": {
    		"proxy": true
    	},
    	"env": {},
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