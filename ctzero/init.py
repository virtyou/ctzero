copies = {
	".": ["sound", "sound_in", "maps", "models"],
	"js": ["morphs"]
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