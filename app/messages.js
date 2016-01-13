/*
This is just documentation for all the message types.

The basic message wrapper is simply:

{
	"type": type,
}

The various data types are:

MoveShip: {
	shipId: the id of the ship to move
	targetLocation: the id of the target to move to
}

SetShipPosition: {
	shipId: the id of the ship
	position: the position of the ship
}

MakeBuilding: {
	building: the building type
	x: x position of the building location
	y: y position of the building location
}

SetPosition: {
	object: the object type
	position: the position of the object
}

*/
