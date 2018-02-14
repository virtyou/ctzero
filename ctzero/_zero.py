# coding=utf-8
import os, string, json, time
from cantools.web import log, respond, succeed, cgi_get, read_file
from cantools.util import read, write, cmd, output

LANG = {
    "english": "en-US",
    "mandarin": "zh-guoyu"
}
CMDS = {
    "say": {
        "mandarin": [
            "wget \"http://tts.mobvoi.com/api/synthesis?nettype=wifi×tamp=1484898152748&language=unknown&audio_type=mp3&product=bd_yunnan&detail_output=true&text='%s'\" -O %s.json"
        ],
        "english": [
            'aws polly synthesize-speech --output-format mp3 --voice-id Joanna --text "%s" %s.mp3',
            'aws polly synthesize-speech --output-format json --voice-id Joanna --text "%s" --speech-mark-types=\'["viseme"]\' %s.json'
        ]
    },
    "rec": {
        "transcode": "avconv -i %s.webm %s.wav", # stampath, stampath
        "interpret": "gcloud ml speech recognize %s.wav --language-code=%s" # stampath, lang
    }
}

def response():
    action = cgi_get("action", choices=["say", "rec"])
    language = cgi_get("language")
    comz = CMDS[action]
    if action == "say":
        words = cgi_get("words")
        log("say -> %s :: %s"%(language, words))
        fname = "".join([c for c in words if c in string.letters]) or hash(words)
        fpath = "sound/" + fname
        fpjson = "%s.json"%(fpath,)
        if not os.path.exists(fpjson):
            for command in comz[language]:
                cmd(command%(words, fpath))
        data = read(fpjson)
        robj = {}
        if language == "mandarin":
            robj["data"] = json.loads(data)
        else:
            robj["url"] = "/%s.mp3"%(fpath,)
            robj["visemes"] = json.loads("[%s]"%(",".join(data[:-1].split("\n"))));
        succeed(robj)
    elif action == "rec":
        stamp = str(time.time())
        spath = os.path.join("sound_in", stamp)
        log("rec -> %s :: %s"%(language, spath))
        write(read_file(cgi_get("data")), "sound_in/%s")
        cmd(comz["transcode"]%(spath, spath))
        res = output(comz["interpret"]%(spath, LANG[language]))
        succeed(res.split('"transcript": "')[1].split('"')[0])

respond(response, threaded=True)