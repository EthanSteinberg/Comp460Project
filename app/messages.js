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

MakeShip {
	islandID: the island the ship will be made on
	x: x position of the building location
	y: y position of the building location
	shipstats: the stats of the ship
}

SetPosition: {
	object: the object type
	position: the position of the object
	islandID: the id of the island the object is associated with
	stats: the stats of the object
}

SetResources: {
	coin: the amount of coin you have
}


UpdateTimeLeftToBuildHandler: {
	id: The building id,
	timeLeftToBuild: the number of ticks left to build,
	object: The building type
}

*/
