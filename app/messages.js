/*
This is just documentation for all the message types.

The basic message wrapper is simply:

{
	"type": type,
}

The various data types are:

StartGame: {
	initialState: All the entities in an Object,
	team: The team for the player
}


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
	template: the template of the ship
}

AttackShip: {
	id: the ship to attack with,
	targetId: the ship to attack
	targetMode: what attack mode the ship is in
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
