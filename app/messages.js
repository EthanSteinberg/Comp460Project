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

MakeBuilding: {
	building: the building type
	x: x position of the building location
	y: y position of the building location
}

MakeShip {
	islandID: the island the ship will be made on
	x: x position of the building location
	y: y position of the building location
	template: the template of the ship
}

SetPosition: {
	object: the object type
	position: the position of the object
	islandID: the id of the island the object is associated with
	template: the template of the object
}

SetResources: {
	coin: the amount of coin you have
}


UpdateTimeLeftToBuildHandler: {
	id: The building id,
	timeLeftToBuild: the number of ticks left to build,
	object: The building type
}

AttackShip: {
	id: the ship to attack with,
	targetId: the ship to attack
}

FireShot: {
	id: The hardpoint to attack with,
	targetId: The id of the target
}

UpdateEntity: {
	id: The id of the entity,
	data: The new data for the entity
}

RemoveEntity: {
	id: The id of the entity,
	data: The new data for the entity
}
*/
