from cantools.web import respond, succeed, cgi_get
from model import db, Thing, Person, Room

def response():
    action = cgi_get("action", choices=["json", "opts", "extras"])
    if action == "json": # better name?
        ent = db.get(cgi_get("key"))
        if ent.polytype == "ctuser":
            succeed({
                "people": [p.json() for p in Person.query(Person.owner == ent.key).fetch()],
                "rooms": [r.json() for r in Room.query(Room.owner == ent.key).fetch()]
            })
        succeed(ent.json())
    elif action == "extras":
        data = { "furnishing": {}, "headgear": {} }
        for kind in data:
            for item in Thing.query(Thing.kind == kind).fetch():
                data[kind][item.name] = item.json()
        succeed(data)
    elif action == "opts":
        ent = db.get(cgi_get("key"))
        prop = cgi_get("prop", default="opts")
        opts = cgi_get("opts")
        obj = (getattr(ent, prop) or {}).copy()
        obj.update(opts)
        setattr(ent, prop, obj)
        ent.put()

respond(response)