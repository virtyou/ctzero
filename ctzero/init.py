import os
mdir = os.path.join("js", "morphs")
dirs = ["sound", "sound_in", "maps", "models", mdir]
copies = {
	mdir: ["head1.js"]
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
cfg = {
	"asr": {
		"mode": "gcloud", # or "baidu" -- default "gcloud" mode requires gcloud to be installed and configured
		"id": None,       # baidu only
		"secret": None    # baidu only
	}
}