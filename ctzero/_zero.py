from cantools.web import log, respond, succeed, cgi_get, read_file
from ctzero.speech import chat, say, rec
from model import db

def response():
    action = cgi_get("action", choices=["say", "rec", "chat", "json"])
    if action == "chat":
        succeed(chat(cgi_get("question")))
    language = cgi_get("language")
    voice = cgi_get("voice", default="Joanna")
    if action == "say":
        words = cgi_get("words")
        prosody = cgi_get("prosody", default={
            "rate": "medium",
            "pitch": "medium"
        })
        succeed(say(language, voice, words, prosody))
    elif action == "rec":
        succeed(rec(language, cgi_get("data")))
    elif action == "json": # better name?
        succeed(db.get(cgi_get("key")).json())

respond(response, threaded=True)