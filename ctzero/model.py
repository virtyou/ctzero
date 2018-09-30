from cantools import db
from ctuser.model import CTUser

class Thing(db.TimeStampedBase):
	owner = db.ForeignKey(kind=CTUser)
	opts = db.Text()
	texture = db.Binary()
	stripset = db.Binary()
	morphStack = db.Binary()

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