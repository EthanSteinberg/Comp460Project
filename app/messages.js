/*
This is just documentation for all the message types.

The basic message wrapper is simply:

{
	"type": type,
}

The various data types are:

AssignTeam: {
	team: The team for the player,
	readyStates: The inial ready states
}

SetReadyState: {
	readyState: A boolean indicating whether the player is ready or not
}

UpdateReadyStates: {
	readyStates: { teamId: readyState }
}

StartGame: {
	initialState: All the entities in an Object,
	team: The team for the player
	// The team is technically redundant, but makes for much easier debugging as you can start games immediately.
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
	shipyardId: the id of the shipyard to build from
	templateNumber: the number for the template
	template: the template of the ship
}

AttackShip: {
	id: the ship to attack with,
	targetId: the ship to attack
	targetMode: what attack mode the ship is in
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
