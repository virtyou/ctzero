from cantools.web import log, respond, succeed, cgi_get, read_file
from ctzero.speech import chat, say, rec
from model import db, Person, Room

def response():
    action = cgi_get("action", choices=["say", "rec", "chat", "json"])
    if action == "json": # better name?
        ent = db.get(cgi_get("key"))
        if ent.polytype == "ctuser":
            succeed({
                "people": [p.json() for p in Person.query(Person.owner == ent.key).fetch()],
                "rooms": [r.json() for r in Room.query(Room.owner == ent.key).fetch()]
            })
        succeed(ent.json())
    elif action == "chat":
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

respond(response, threaded=True)