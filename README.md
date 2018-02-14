# ctzero
This package contains the core zero libraries.


# Back (Init Config)

    copies = {
    	".": ["sound", "sound_in", "maps", "models"]
    }
    
    syms = {
    	".": ["_zero.py"],
    	"js": ["zero"]
    }
    routes = {
    	"/_zero": "_zero.py",
    	"/sound": "sound",
    	"/maps": "maps",
    	"/models": "models"
    }
    

# Front (JS Config)

## core.config.ctzero
### Import line: 'CT.require("core.config");'
    {
    	"camera": {
    		"controls": {
    			"rotateSpeed": 1.0,
    			"zoomSpeed": 1.2,
    			"panSpeed": 0.8,
    			"noZoom": false,
    			"noPan": false,
    			"staticMoving": true,
    			"dynamicDampingFactor": 0.3
    		},
    		"springs": {},
    		"patterns": {}
    	},
    	"room": {
    		"name": "vroom",
    		"lights": [{
    			"variety": "ambient"
    		}],
    		"objects": []
    	},
    	"people": []
    }