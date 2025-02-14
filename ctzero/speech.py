# coding=utf-8
import os, string, json, time
from cantools.util import read, write, cmd, output
from cantools.web import log, post, read_file
from cantools.util.admin import ai as ddgchat
from model import Translation
from .spcfg import *
from string import digits
try:
    from string import letters
except: # py38
    from string import ascii_letters as letters

goodchars = letters + digits
DUX = ["o3-mini", "gpt-4o-mini", "claude-3-haiku", "llama-3.1-70b", "mixtral-8x7b"]

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
        res = output(CMDS["trans"]%(words, sourceLang, targetLang)).split(": ")[-1]
        t = Translation(words=words, source=sourceLang, target=targetLang, result=res)
        t.put()
    return t.result

def chat(question, identity=None, mood=None, options=None, name=None, asker=None):
    cfg = config.ctzero.chat
    aicfg = AIZ[cfg.mode]
    if identity in DUX:
        log("ddgchat(%s) -> %s"%(identity, question))
        return ddgchat(question, identity, shorten="PHRASE")
    if cfg.mode == "aiio":
        return post("%s://%s/%s"%(aicfg["proto"], aicfg["host"], aicfg["path"]), data={
            "identity": identity or cfg.botname,
            "statement": question,
            "options": options,
            "mood": mood,
            "name": name,
            "asker": asker
        }, ctjson=True)
    from pb_py import main as PB
    resp = PB.talk(cfg.userkey, cfg.appid, aicfg["host"], cfg.botname, question)["response"]
    return resp.split("[URL]")[0]

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