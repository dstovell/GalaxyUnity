#pragma strict

function Start() 
{
	PlaceLocalCombatants();
}

function PlaceLocalCombatants()
{
	PlaceTeam("Team1");
	PlaceTeam("Team2");
}

function IsSpawnable(obj : GameObject) : boolean
{
	//Check if the ship is currently docked
	if (obj.transform.parent)
		return false;
		
	var combatantComp : CombatantComponent = obj.GetComponent(CombatantComponent);
	if (combatantComp)
		return combatantComp.IsMilitary();
		
	return false;
}

function PlaceTeam(teamTag : String)
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	var localCombatants = GameObject.FindGameObjectsWithTag(teamTag);
	for (var i=0; i<localCombatants.length; i++)
	{
		if (IsSpawnable(localCombatants[i]))
		{
			for (var j=0; j<spawnPoints.length; j++)
			{
				var spawnComp : SpawnPointComponent = spawnPoints[j].GetComponent(SpawnPointComponent);
				if (spawnComp && !spawnComp.IsUsed() && (spawnComp.teamToSpawn == teamTag) && (spawnComp.spawnAction != SpawnAction.Launch))
				{
					var spawnPos = spawnComp.GetSpawnPostion();
					
					localCombatants[i].transform.position = spawnPos;
					localCombatants[i].transform.rotation = spawnPoints[j].transform.rotation;
					
					//This is slow, but we only ever do it once per player per level
					localCombatants[i].SendMessage("OnSpawned");
					
					spawnComp.MarkUsed(localCombatants[i]);
					
					if (spawnComp.spawnAction == SpawnAction.WarpIn)
					{
						WarpComponent.WarpIn(localCombatants[i], spawnPos, Vector3(1,0,0), 1.0);
					}					
					break;
				}
			}
		}
	}
}