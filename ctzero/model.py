from cantools import db
from ctuser.model import CTUser

class Member(CTUser):
    cc = db.JSON() # carecoin {person,membership}

class Augmentation(db.TimeStampedBase):
    owners = db.ForeignKey(kind=Member, repeated=True)
    name = db.String()
    markers = db.JSON(default={})
    lights = db.JSON(default=[{"variety": "ambient"}])

    def json(self):
        return self.data()

class Asset(db.TimeStampedBase):
    owners = db.ForeignKey(kind=Member, repeated=True)
    variety = db.String(choices=["texture", "stripset"])
    kind = db.String() # furnishing, headgear, hair, head, eye, etc
    name = db.String()
    identifier = db.String()
    item = db.Binary(unique=True)

    def path(self):
        return self.item.urlsafe()

    def json(self):
        return self.data()

def assetize(ent, d):
    for item in ["texture", "stripset"]:
        a = getattr(ent, item, None)
        if a:
            ast = a.get()
            d[item] = ast.path()
            d["%s_name"%(item,)] = ast.name
            d["%s_owners"%(item,)] = [o.urlsafe() for o in ast.owners]

class Thing(db.TimeStampedBase):
    owners = db.ForeignKey(kind=Member, repeated=True)
    texture = db.ForeignKey() # Asset or similar (requires item Binary column)!!
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
            "owners": [o.urlsafe() for o in self.owners]
        }
        assetize(self, d)
        self.opts and d.update(self.opts)
        return d

class Part(db.TimeStampedBase):
    parent = db.ForeignKey(kind="part")
    base = db.ForeignKey(kind=Thing) # base Thing OR template
    template = db.String() # zero.base.torso / templates.whatever / etc
    material = db.JSON()
    morphs = db.JSON() # merged into Things.morphs{}
    opts = db.JSON() # passed to template or merged into Thing.opts{}
    assets = db.ForeignKey(kind=Asset, repeated=True) # merged into opts
    texture = db.ForeignKey() # Asset or Asset-like model

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
        assetize(self, d)
        d["parts"] = [p.json() for p in Part.query(Part.parent == self.key).fetch()]
        if not self.parent and "name" not in d:
            d["name"] = "body"
        return d

class Person(db.TimeStampedBase):
    owners = db.ForeignKey(kind=Member, repeated=True)
    basepacks = db.ForeignKey(kind="person", repeated=True)
    basepack = db.String(repeated=True)
    body = db.ForeignKey(kind=Part)
    name = db.String()
    voice = db.String()
    mood = db.JSON()
    vibe = db.JSON()
    mods = db.JSON()
    gear = db.JSON()
    dances = db.JSON()
    gestures = db.JSON()
    responses = db.JSON()
    ai = db.JSON() # {identity"",options{quote,opinion,retort,fallback,brief}}

    def packed(self):
        pz = ["mood", "vibe", "mods", "gear", "dances", "gestures", "responses"]
        bz = db.get_multi(self.basepacks)
        d = {
            "basepack": self.basepack,
            "basepacks": [{
                "identifier": "%s's basepacks: %s"%(self.name, b.name),
                "key": b.id(),
                "pack": b.basepack,
                "label": "%s (by %s)"%(b.name, b.owners[0].get().fullName()),
                "owners": [o.urlsafe() for o in b.owners]
            } for b in bz]
        }
        for p in pz:
            d[p] = {}
            for b in bz:
                if p in b.basepack:
                    for k, v in (getattr(b, p) or {}).items():
                        d[p][k] = v
            for k, v in (getattr(self, p) or {}).items():
                d[p][k] = v
        return d

    def json(self):
        d = {
            "key": self.key.urlsafe(),
            "name": self.name,
            "voice": self.voice,
            "ai": self.ai,
            "body": self.body.get().json(),
            "owners": [o.urlsafe() for o in self.owners]
        }
        d.update(self.packed())
        return d

class Room(db.TimeStampedBase):
    owners = db.ForeignKey(kind=Member, repeated=True)
    base = db.ForeignKey(kind=Thing)
    name = db.String()
    environment = db.String()
    grippy = db.Boolean(default=True)
    material = db.JSON()
    lights = db.JSON()
    cameras = db.JSON()
    automatons = db.JSON() # [{person,program{interval{base,coefficient,randomize},activities[]}}]
    opts = db.JSON() # merged into Thing.opts{}

    def json(self):
        d = self.base and self.base.get().json() or {}
        self.opts and d.update(self.opts)
        if "key" in d: # thing key
            d["thing_key"] = d["key"]
        d["key"] = self.key.urlsafe()
        for iname in ["name", "environment", "lights", "cameras", "automatons"]:
            item = getattr(self, iname)
            if item:
                d[iname] = item
        d["owners"] = [o.urlsafe() for o in self.owners]
        d["grippy"] = self.grippy
        if self.material:
            if "material" not in d:
                d["material"] = {}
            d["material"].update(self.material)
        d["objects"] = [f.json() for f in Furnishing.query(Furnishing.parent == self.key).fetch()]
        d["portals"] = [p.data() for p in Portal.query(Portal.target == self.key).fetch()] # incoming
        return d

class Furnishing(db.TimeStampedBase):
    parent = db.ForeignKey(kinds=["room", "furnishing"])
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