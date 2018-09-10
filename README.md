# ctzero
This package contains the core zero libraries.


# Back (Init Config)

    import os
    mdir = os.path.join("js", "morphs")
    edir = os.path.join("js", "environments")
    dirs = ["sound", "sound_in", "maps", "models", mdir]
    copies = {
    	mdir: ["head1.js"]
    }
    
    syms = {
    	".": ["_zero.py"],
    	"js": ["zero", "shaders"]
    }
    model = {
    	"ctzero.model": ["*"]
    }
    routes = {
    	"/_zero": "_zero.py",
    	"/sound": "sound",
    	"/maps": "maps",
    	"/models": "models"
    }
    cfg = {
    	"asr": {
    		"mode": "gcloud", # or "baidu" -- default "gcloud" mode requires gcloud to be installed and configured
    		"id": None,       # baidu only
    		"secret": None    # baidu only
    	},
    	"chat": {             # currently supports pandorabots mode
    		"host": "aiaas.pandorabots.com",
    		"appid": None,
    		"userkey": None,
    		"botname": None
    	}
    }

# Front (JS Config)

## core.config.ctzero
### Import line: 'CT.require("core.config");'
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
    	}
    }