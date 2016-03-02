#pragma strict

enum SpawnAction
{
	None,
	WarpIn,
	Launch
}

class SpawnPointComponent extends MonoBehaviour
{

var teamToSpawn : String;
var spawnAction : SpawnAction;

private var spawnLocation : Vector3;
private var isUsed;

private var spawnedObject : GameObject;

function Awake() 
{
	//Make sure its hidden when we're running the game!
	//renderer.enabled = false;
	
	isUsed = false;
	
	var spawnHeight = transform.localScale.y;
	spawnLocation = transform.position;
}

function GetSpawnPostion()
{
	return spawnLocation;
}

function MarkUsed(spawned : GameObject)
{
	isUsed = true;
	spawnedObject = spawned;
}

function DestroySpawned()
{
	if (isUsed)
	{
		isUsed = false;
		Destroy(spawnedObject);
	}
}

function IsUsed()
{
	return isUsed;
}

}