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
	".": ["_zero.py", "_speech.py"],
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
	"/models": "models"
}
cfg = {
	"asr": {
		"audlib": "ffmpeg", # or avconv (certain older distros)
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
requires = ["ctuser"]