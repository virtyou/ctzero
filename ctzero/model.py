from cantools import db

class Thing(db.TimeStampedBase):
	opts = db.Text()
	assets = db.Binary(repeated=True)

class Room(Thing):
	pass

class Door(Thing):
	room = db.ForeignKey(kind=Room)
	position = db.Integer(repeated=True) # x, y, z
	rotation = db.Integer(repeated=True) # x, y, z

class Portal(db.TimeStampedBase): # asymmetrical (one per direction)
	source = db.ForeignKey(kind=Door)
	target = db.ForeignKey(kind=Door)