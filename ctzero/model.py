from cantools import db
from ctuser.model import CTUser

class Asset(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	variety = db.String(choices=["texture", "stripset", "morphStack"])
	name = db.String()
	item = db.Binary(unique=True)

class Thing(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	texture = db.ForeignKey(kind=Asset)
	stripset = db.ForeignKey(kind=Asset)
	morphStack = db.ForeignKey(kind=Asset)
	kind = db.String() # furnishing, headgear, head, eye, arm, leg, etc
	name = db.String()
	custom = db.Text()
	opts = db.JSON() # base opts

	def json(self):
		return {
			"name": self.name,
			"opts": self.opts,
			"custom": self.custom,
			"texture": self.texture and self.texture.get().item.urlsafe(),
			"stripset": self.stripset and self.stripset.get().item.urlsafe(),
			"morphStack": self.morphStack and self.morphStack.get().item.urlsafe()
		}

class Part(db.TimeStampedBase):
	parent = db.ForeignKey(kind="Part")
	base = db.ForeignKey(kind=Thing) # base Thing OR template
	template = db.String() # zero.base.torso / templates.whatever / etc
	opts = db.JSON() # passed to template or merged into Thing.opts{}
	assets = db.ForeignKey(kind=Asset, repeated=True) # merged into opts

	def json(self):
		d = self.base and self.base.get().json() or { "opts": {} }
		d["template"] = self.template
		d["opts"].update(self.opts)
		for asset in db.get_multi(self.assets):
			d["opts"][asset.name] = asset.item.urlsafe()
		d["parts"] = [p.json() for p in Part.query(Part.parent == self.key).fetch()]
		return d

class Person(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	body = db.ForeignKey(kind=Part)
	name = db.String()
	voice = db.String()
	mood = db.JSON() # {mad,happy,sad,antsy}

	def json(self):
		return {
			"name": self.name,
			"voice": self.voice,
			"mood": self.mood,
			"body": self.body.get().json()
		}

class Room(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	base = db.ForeignKey(kind=Thing)
	opts = db.JSON() # merged into Thing.opts{}

	def json(self):
		d = self.base and self.base.get().json() or { "opts": {} }
		d["opts"].update(self.opts)
		d["objects"] = [f.json() for f in Furnishing.query(Furnishing.parent == self.key).fetch()]
		return d

class Furnishing(db.TimeStampedBase):
	parent = db.ForeignKey(kinds=["Room", "Furnishing"])
	base = db.ForeignKey(kind=Thing)
	opts = db.JSON() # merged into Thing.opts{} - includes pos, rot, etc

	def json(self):
		d = self.base and self.base.get().json() or { "opts": {} }
		d["opts"].update(self.opts)
		d["parts"] = [f.json() for f in Furnishing.query(Furnishing.parent == self.key).fetch()]
		return d

class Door(Furnishing):
	pass

# should each room have a default incoming portal?
class Portal(db.TimeStampedBase): # asymmetrical (one per direction)
	source = db.ForeignKey(kind=Door)
	target = db.ForeignKey(kind=Door)