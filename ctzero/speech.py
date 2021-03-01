# coding=utf-8
import os, string, json, time
from cantools.util import read, write, cmd, output
from cantools.web import log, read_file
from cantools import config
try:
    from string import letters
except: # py38
    from string import ascii_letters as letters

LANG = {
    "english": "en-US",
    "mandarin": "zh-guoyu"
}
CMDS = {
    "say": [
        'aws polly synthesize-speech --output-format mp3 --voice-id %s --text "%s" %s.mp3',
        'aws polly synthesize-speech --output-format json --voice-id %s --text "%s" --speech-mark-types=\'["viseme"]\' %s.json'
    ],
    "rec": {
        "transcode": config.ctzero.asr.audlib + " -i %s.webm -ac 1 %s.wav", # stampath, stampath
        "interpret": {
            "gcloud": "gcloud ml speech recognize %s.wav --language-code=%s", # stampath, lang
            "baidu": 'wget --header="Content-Type: audio/wav;rate=16000" --post-file=%s.wav "http://vop.baidu.com/server_api?lan=%s&cuid=10569015&token=%s" -O %s.json' # stampath, lang, token, stampath
        }
    },
    "baidu_token": 'wget "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=%s&client_secret=%s&" -O baidu.token' # id, secret
}
BAIDU_TOKEN_LIFE = 2592000

def load_token(now):
    cfg = config.ctzero.asr
    tdata = json.loads(read("baidu.token"))
    cfg.token = tdata["access_token"]
    cfg.expiration = tdata["expires_in"] + now

def baidu_token():
    cfg = config.ctzero.asr
    now = time.time()
    if not cfg.token and os.path.exists("baidu.token"):
        ts = os.path.getmtime("baidu.token")
        if ts + BAIDU_TOKEN_LIFE > now:
            load_token(ts)
    if not cfg.token or cfg.expiration < now:
        log("acquiring baidu token")
        cmd(CMDS["baidu_token"]%(cfg.id, cfg.secret))
        load_token(now)

def chat(question):
    from pb_py import main as PB
    cfg = config.ctzero.chat
    resp = PB.talk(cfg.userkey, cfg.appid, cfg.host, cfg.botname, question)["response"]
    return resp.split("[URL]")[0]

def say(language, voice, words, prosody):
    comz = CMDS["say"]
    rate = prosody["rate"]
    pitch = prosody["pitch"]
    if language == "mandarin":
        voice = "Zhiyu"
    log("say -> %s [%s @ %s, %s] :: %s"%(language, voice, rate, pitch, words))
    whash = "".join([c for c in words if c in letters])
    if not whash or len(whash) > 200:
        whash = hash(words)
    fname = "%s%s%s%s"%(voice, rate, pitch, whash)
    fpath = "sound/" + fname
    fpjson = "%s.json"%(fpath,)
    if not os.path.exists(fpjson):
        fullwords = words.replace('"', '')
        fullfpath = fpath
        start = "<speak><prosody"
        for key, val in prosody.items():
            start += " %s='%s'"%(key, val)
        fullwords = "%s>%s</prosody></speak>"%(start, fullwords)
        fullfpath = "--text-type ssml %s"%(fpath,)
        for command in comz:
            cmd(command%(voice, fullwords, fullfpath))
    data = read(fpjson)
    robj = {}
    robj["url"] = "/%s.mp3"%(fpath,)
    robj["visemes"] = json.loads("[%s]"%(",".join(data[:-1].split("\n"))));
    return robj

def rec(language, data):
    comz = CMDS["rec"]
    stamp = str(time.time())
    spath = os.path.join("sound_in", stamp)
    log("rec -> %s :: %s"%(language, spath))
    write(read_file(data), "%s.webm"%(spath,), binary=True)
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
    return res