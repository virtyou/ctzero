from cantools.web import respond, succeed, cgi_get
from ctzero.speech import chat, say, rec

def response():
    action = cgi_get("action", choices=["say", "rec", "chat"])
    if action == "chat":
        succeed(chat(cgi_get("question"),
            cgi_get("identity", required=False),
            cgi_get("mood", required=False),
            cgi_get("options", required=False)))
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