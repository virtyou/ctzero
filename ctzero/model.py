from cantools import db
from ctuser.model import CTUser

class Asset(db.TimeStampedBase):
    owner = db.ForeignKey(kind=CTUser)
    variety = db.String(choices=["texture", "stripset"])
    name = db.String()
    identifier = db.String()
    item = db.Binary(unique=True)

    def json(self):
        return self.data()

class Thing(db.TimeStampedBase):
    owner = db.ForeignKey(kind=CTUser)
    texture = db.ForeignKey(kind=Asset)
    stripset = db.ForeignKey(kind=Asset)
    morphStack = db.String() # should be Asset, but Thing.js gets complicated...
    kind = db.String() # furnishing, headgear, head, eye, arm, leg, etc
    name = db.String()
    custom = db.Text()
    material = db.JSON()
    morphs = db.JSON()
    opts = db.JSON() # base opts

    def json(self):
        d = {
            "key": self.key.urlsafe(),
            "name": self.name,
            "kind": self.kind,
            "custom": self.custom,
            "material": self.material,
            "morphs": self.morphs or {},
            "morphStack": self.morphStack,
            "texture": self.texture and self.texture.get().item.urlsafe() or None,
            "stripset": self.stripset and self.stripset.get().item.urlsafe() or None
        }
        self.opts and d.update(self.opts)
        return d

class Part(db.TimeStampedBase):
    parent = db.ForeignKey(kind="Part")
    base = db.ForeignKey(kind=Thing) # base Thing OR template
    template = db.String() # zero.base.torso / templates.whatever / etc
    material = db.JSON()
    morphs = db.JSON() # merged into Things.morphs{}
    opts = db.JSON() # passed to template or merged into Thing.opts{}
    assets = db.ForeignKey(kind=Asset, repeated=True) # merged into opts

    def json(self):
        d = self.base and self.base.get().json() or {}
        if "key" in d: # thing key
            d["thing_key"] = d["key"]
        d["key"] = self.key.urlsafe()
        d["template"] = self.template
        for key in ["material", "morphs"]:
            val = getattr(self, key)
            if val:
                if key not in d:
                    d[key] = {}
                d[key].update(val)
        self.opts and d.update(self.opts)
        for asset in db.get_multi(self.assets):
            d[asset.name] = asset.item.urlsafe()
        d["parts"] = [p.json() for p in Part.query(Part.parent == self.key).fetch()]
        if not self.parent and "name" not in d:
            d["name"] = "body"
        return d

class Person(db.TimeStampedBase):
    owner = db.ForeignKey(kind=CTUser)
    body = db.ForeignKey(kind=Part)
    name = db.String()
    voice = db.String()
    mood = db.JSON()
    vibe = db.JSON()
    mods = db.JSON()
    dances = db.JSON()
    gestures = db.JSON()
    responses = db.JSON()

    def json(self):
        return {
            "key": self.key.urlsafe(),
            "name": self.name,
            "voice": self.voice,
            "mood": self.mood or {},
            "vibe": self.vibe or {},
            "mods": self.mods or {},
            "dances": self.dances or {},
            "gestures": self.gestures or {},
            "responses": self.responses or {},
            "body": self.body.get().json()
        }

class Room(db.TimeStampedBase):
    owner = db.ForeignKey(kind=CTUser)
    base = db.ForeignKey(kind=Thing)
    name = db.String()
    environment = db.String()
    material = db.JSON()
    lights = db.JSON()
    cameras = db.JSON()
    opts = db.JSON() # merged into Thing.opts{}

    def json(self):
        d = self.base and self.base.get().json() or {}
        self.opts and d.update(self.opts)
        if "key" in d: # thing key
            d["thing_key"] = d["key"]
        d["key"] = self.key.urlsafe()
        for iname in ["name", "environment", "lights", "cameras"]:
            item = getattr(self, iname)
            if item:
                d[iname] = item
        d["owner"] = self.owner.urlsafe()
        if self.material:
            if "material" not in d:
                d["material"] = {}
            d["material"].update(self.material)
        d["objects"] = [f.json() for f in Furnishing.query(Furnishing.parent == self.key).fetch()]
        d["portals"] = [p.data() for p in Portal.query(Portal.target == self.key).fetch()] # incoming
        return d

class Furnishing(db.TimeStampedBase):
    parent = db.ForeignKey(kinds=["Room", "Furnishing"])
    base = db.ForeignKey(kind=Thing)
    material = db.JSON()
    opts = db.JSON() # merged into Thing.opts{} - includes pos, rot, etc

    def rm(self, *args, **kwargs):
        portals = self.portals(False)
        if "outgoing" in portals:
            portals["outgoing"].rm()
        for port in portals["incoming"]:
            port.rm()
        super(Furnishing, self).rm(*args, **kwargs)

    def portals(self, data=True): # portal only
        portals = { "incoming": Portal.query(Portal.target == self.key).fetch() }
        if data:
            portals["incoming"] = [p.data() for p in portals["incoming"]]
        out = Portal.query(Portal.source == self.key).get()
        if out:
            portals["outgoing"] = data and out.data() or out
        return portals

    def json(self):
        d = self.base and self.base.get().json() or {}
        self.opts and d.update(self.opts)
        if "key" in d: # thing key
            d["thing_key"] = d["key"]
        d["key"] = self.key.urlsafe()
        d["parent"] = self.parent.urlsafe()
        if self.material:
            if "material" not in d:
                d["material"] = {}
            d["material"].update(self.material)
        d["parts"] = [f.json() for f in Furnishing.query(Furnishing.parent == self.key).fetch()]
        if d["kind"] == "portal":
            d["portals"] = self.portals()
        return d

# should each room have a default incoming portal?
class Portal(db.TimeStampedBase): # asymmetrical (one per direction)
    source = db.ForeignKey(kind=Furnishing) # base.kind == "portal"
    target = db.ForeignKey(kinds=[Furnishing, Room]) # Room -> pending

    def json(self):
        return self.data()