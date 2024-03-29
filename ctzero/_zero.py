from cantools.web import respond, succeed, cgi_get
from model import db, Thing, Person, Room

def response():
    action = cgi_get("action", choices=["json", "opts", "things"])
    if action == "json": # better name?
        ekey = cgi_get("key", required=False)
        ent = ekey and db.get(ekey)
        if not ent or ent.polytype == "member":
            pq = Person.query()
            rq = Room.query()
            if ent:
                pq.filter(Person.owners.contains(ent.key.urlsafe()))
                if not cgi_get("allrooms", required=False):
                    rq.filter(Room.owners.contains(ent.key.urlsafe()))
            succeed({
                "people": [p.json() for p in pq.fetch()],
                "rooms": [r.json() for r in rq.fetch()]
            })
        succeed(ent.json())
    elif action == "things":
        thingz = {}
        for item in Thing.query().fetch():
            if item.kind not in thingz:
                thingz[item.kind] = {}
            thingz[item.kind][item.name] = item.json()
        succeed(thingz)
    elif action == "opts":
        ent = db.get(cgi_get("key"))
        prop = cgi_get("prop", default="opts")
        opts = cgi_get("opts")
        obj = (getattr(ent, prop) or {}).copy()
        obj.update(opts)
        setattr(ent, prop, obj)
        ent.put()

respond(response)