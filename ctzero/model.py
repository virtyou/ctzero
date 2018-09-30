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
	opts = db.JSON() # base opts
	name = db.String()
	custom = db.Text()

class Part(db.TimeStampedBase):
	parent = db.ForeignKey(kind="Part")
	base = db.ForeignKey(kind=Thing)
	opts = db.JSON() # merged into Thing.opts{}

class Person(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	body = db.ForeignKey(kind=Part)
	name = db.String()
	voice = db.String()
	mood = db.JSON() # {mad,happy,sad,antsy}

class Room(Thing):
	pass

class Door(Thing):
	room = db.ForeignKey(kind=Room)
	position = db.Integer(repeated=True) # x, y, z
	rotation = db.Integer(repeated=True) # x, y, z

# should each room have a default incoming portal?
class Portal(db.TimeStampedBase): # asymmetrical (one per direction)
	source = db.ForeignKey(kind=Door)
	target = db.ForeignKey(kind=Door)