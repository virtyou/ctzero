# coding=utf-8
import os, string, json, time
from cantools.util.ai import vox, kvoices, tox, pb
from cantools.util import read, write, cmd, output, repitch
from cantools.web import log, read_file
from model import Translation
from .spcfg import *
from string import digits
try:
    from string import letters
except: # py38
    from string import ascii_letters as letters

goodchars = letters + digits
rates = ["x-slow", "slow", "medium", "fast", "x-fast"]
pitches = ["x-low", "low", "medium", "high", "x-high"]

def name2val(item, items):
    return 0.2 + 0.4 * items.index(item)

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

def trans(words, sourceLang, targetLang):
    t = Translation.query(Translation.words == words,
        Translation.source == sourceLang, Translation.target == targetLang).get()
    if not t:
        tmode = config.ctzero.trans
        res = output(CMDS["trans"][tmode]%(sourceLang, targetLang, words))
        if tmode == "gcloud":
            res = res.split(": ")[-1]
        t = Translation(words=words, source=sourceLang, target=targetLang, result=res)
        t.put()
    return t.result

def chat(question, identity=None, mood=None, options=None, name=None, asker=None):
    cfg = config.ctzero.chat
    if cfg.mode == "pandorabots":
        log("pb(%s - using %s) -> %s"%(identity, cfg.botname, question))
        return pb(question, cfg.botname, cfg.appid, cfg.userkey)
    identity = identity or cfg.botname
    log("tox(%s) -> %s"%(identity, question))
    return tox(question, identity, name, mood, asker, options)

def say(language, voice, words, prosody):
    comz = CMDS["say"]
    rate = prosody["rate"]
    pitch = prosody["pitch"]
    if language == "mandarin":
        voice = "Zhiyu"
    log("say -> %s [%s @ %s, %s] :: %s"%(language, voice, rate, pitch, words))
    whash = "".join([c for c in words if c in goodchars])
    if not whash or len(whash) > 200:
        whash = hash(words)
    fname = "%s%s%s%s"%(voice, rate, pitch, whash)
    fpath = "sound/" + fname
    fpjson = "%s.json"%(fpath,)
    if not os.path.exists(fpjson):
        fullwords = words.replace('"', '')
        if voice in kvoices:
            # TODO : language code conversion! (replace "a")
            vox(fullwords, voice, name2val(rate, rates), "a", fpath)
            pitchval = name2val(pitch, pitches)
            if pitchval != 1:
                repitch(fpath, pitchval)
        else:
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
    if cfg.mode == "vosk": # language code?
        cmd(intcom%(spath, spath))
        res = read("%s.txt"%(spath,)).replace("\n", " ")
    elif cfg.mode == "baidu":
        baidu_token()
        cmd(intcom%(spath, lng.split("-")[0], cfg.token, spath))
        res = read("%s.json"%(spath,), isjson=True)["result"][0]
    else: # gcloud
        op = output(intcom%(spath, lng))
        log(op)
        res = op.split('"transcript": "')[1].split('"')[0]
    return res