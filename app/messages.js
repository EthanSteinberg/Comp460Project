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

*/
