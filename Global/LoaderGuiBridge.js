#pragma strict

class LoaderGuiBridge extends MonoBehaviour
{

//******************************************************//
//These variables are data bound to the Daikon Forge widgets
//"Red Team Drones" and "Blue Team Drones"
//******************************************************//
var team1CombatantUiCount : int;
var team2CombatantUiCount : int;

var team1CombatantPrefabs : GameObject[];
var team2CombatantPrefabs : GameObject[];

private var team1CombatantCount : int = 0;
private var team2CombatantCount : int = 0;

var mLoadingScreen : GUITexture;
private var mLevelToLoad : String;

function Start() 
{
	if (mLoadingScreen)
	{
		mLoadingScreen.pixelInset.x = 0;
		mLoadingScreen.pixelInset.y = 0;
		mLoadingScreen.pixelInset.height = Screen.height;
		mLoadingScreen.pixelInset.width = Screen.width;
		mLoadingScreen.enabled = false;
	}
	
	//******************************************************//
	//Daikon Forge widgets reset to zero when returning to
	//the loader, so we need to remove the drones for now
	//to avoid bugs
	//******************************************************//
	RemoveAllCombatants();
}

function Update()
{
	//******************************************************//
	//Here we detect the changes in the widget values and 
	//spawn or destroy drones for the correct team to match.
	//We also re-focus the camera so you can see what's happening
	//******************************************************//
	if (team1CombatantUiCount > team1CombatantCount)
	{
		LoaderCamera.Get().InitForTeam("Team1");
		LoadCombatant("Team1", team1CombatantPrefabs[0]);
		team1CombatantCount++;
	}
	else if (team1CombatantUiCount < team1CombatantCount)
	{
		LoaderCamera.Get().InitForTeam("Team1");
		RemoveCombatant("Team1");
		team1CombatantCount--;
	}
	
	if (team2CombatantUiCount > team2CombatantCount)
	{
		LoaderCamera.Get().InitForTeam("Team2");
		LoadCombatant("Team2", team2CombatantPrefabs[0]);
		team2CombatantCount++;
	}
	else if (team2CombatantUiCount < team2CombatantCount)
	{
		LoaderCamera.Get().InitForTeam("Team2");
		RemoveCombatant("Team2");
		team2CombatantCount--;
	}
}

function LoadCombatant(teamTag : String, prefab : GameObject)
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	for (var i=0; i<spawnPoints.length; i++)
	{
		var spawnComp : SpawnPointComponent = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp && !spawnComp.IsUsed() && (spawnComp.teamToSpawn == teamTag))
		{
			var spawnPos = spawnComp.GetSpawnPostion();
			
			var newPrefab : GameObject = Instantiate(prefab, Vector3.zero, Quaternion.identity);
			newPrefab.transform.position = spawnPos;
			newPrefab.tag = teamTag;
			DontDestroyOnLoad(newPrefab);
			
			spawnComp.MarkUsed(newPrefab);
			break;
		}
	}
}

function RemoveCombatant(teamTag : String)
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	for (var i=0; i<spawnPoints.length; i++)
	{		
		var spawnComp : SpawnPointComponent = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp && spawnComp.IsUsed() && (spawnComp.teamToSpawn == teamTag))
		{
			spawnComp.DestroySpawned();
			break;
		}
	}
}

function RemoveAllCombatants()
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	for (var i=0; i<spawnPoints.length; i++)
	{		
		var spawnComp : SpawnPointComponent = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp && spawnComp.IsUsed())
		{
			spawnComp.DestroySpawned();
		}
	}
}

//******************************************************//
//This is called by the Daikon Forge button "Start Hot Seat"
//******************************************************//
function OnLoadLevel()
{
	if ((team1CombatantCount > 0) && (team2CombatantCount > 0))
	{
		LoadLevel("SpaceTest_Hex");
	}
}

function LoadLevel(levelName : String)
{
	mLevelToLoad = levelName;

	if (mLoadingScreen)
	{
		mLoadingScreen.pixelInset.x = 0;
		mLoadingScreen.pixelInset.y = 0;
		mLoadingScreen.pixelInset.height = Screen.height;
		mLoadingScreen.pixelInset.width = Screen.width;
		
		mLoadingScreen.enabled = true;
	}
}

function OnGUI()
{
	if (mLevelToLoad)
	{
		var width : float = 100;
		var height : float = 100;
		var x : float = Screen.width/2 - width/2;
		var y : float = Screen.height/2 - height/2;
		GUILayout.BeginArea( Rect(x,y,width,height) );
			GUILayout.Box("Loading");
		GUILayout.EndArea();
		
		Application.LoadLevel(mLevelToLoad);
	}
}

}