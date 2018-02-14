# coding=utf-8
import os, string, json, time
from cantools.web import log, respond, succeed, cgi_get, read_file
from cantools.util import read, write, cmd, output
from cantools import config

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
        "interpret": {
            "gcloud": "gcloud ml speech recognize %s.wav --language-code=%s", # stampath, lang
            "baidu": 'wget --header="Content-Type: audio/wav;rate=16000" --post-file=%s.wav "http://vop.baidu.com/server_api?lan=%s&cuid=10569015&token=%s" -O %s.json' # stampath, lang, token, stampath
        }
    },
    "baidu_token": 'wget "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=%s&client_secret=%s&" -O baidu.token' # id, secret
}

def baidu_token():
    cfg = config.ctzero.asr
    now = time.time()
    if not cfg.token or cfg.expiration < now:
        log("acquiring baidu token")
        cmd(CMDS["baidu_token"]%(cfg.id, cfg.secret))
        tdata = json.loads(read("baidu.token"))
        cfg.token = tdata["access_token"]
        cfg.expiration = tdata["expires_in"] + now

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
        write(read_file(cgi_get("data")), "%s.webm"%(spath,))
        cmd(comz["transcode"]%(spath, spath))
        cfg = config.ctzero.asr
        lng = LANG[language]
        intcom = comz["interpret"][cfg.mode]
        if cfg.mode == "baidu":
            baidu_token()
            cmd(intcom%(spath, lng.split("-")[0], cfg.token, spath))
            res = read("%s.json"%(spath,), isjson=True)["result"][0]
        else: # gcloud
            op = output(intcom%(spath, lng))
            log(op)
            res = op.split('"transcript": "')[1].split('"')[0]
        succeed(res)

respond(response, threaded=True)