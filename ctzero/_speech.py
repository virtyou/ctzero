import random
from cantools.web import respond, succeed, cgi_get, local
from ctzero.speech import chat, say, rec, trans, kvoices
from cantools import config

def response():
    action = cgi_get("action", choices=["say", "rec", "chat", "trans"])
    if action == "chat":
        res = local('response')
        addr = res and res.ip or "rando"
        succeed(chat(cgi_get("question"),
            cgi_get("identity", required=False),
            cgi_get("mood", required=False),
            cgi_get("options", required=False),
            cgi_get("name", required=False),
            cgi_get("asker", default=addr)))
    language = cgi_get("language")
    voice = cgi_get("voice", default=random.choice(kvoices))
    if action == "say":
        words = cgi_get("words")
        prosody = cgi_get("prosody", default={
            "rate": "medium",
            "pitch": "medium"
        })
        succeed(say(language, voice, words, prosody))
    elif action == "rec":
        succeed(rec(language, cgi_get("data")))
    elif action == "trans":
        succeed(trans(cgi_get("words"), language, cgi_get("target")))

respond(response, threaded=config.ctzero.threadspeech)