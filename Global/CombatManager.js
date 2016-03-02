#pragma strict

class CombatantTeam
{
	var mTeamName : String;
	var mTeamTag : String;
	
	var mTeamMembers : GameObject[];
	
	function Setup(tag : String, name : String, teamMembers : GameObject[])
	{
		mTeamName = name;
		mTeamTag = tag;		
		mTeamMembers = teamMembers;
		
		SetupTeamMembers();
	}
	
	function SetupTeamMembers()
	{
		var aiComp : AIComponent = null;
		for (var i=0; i<mTeamMembers.Length; i++)
		{
			aiComp = mTeamMembers[i].GetComponent(AIComponent);
			if (!aiComp)
			{
				mTeamMembers[i].AddComponent(AIComponent);
			}
		}
	}
	
	function BeginCombat()
	{
		var aiComp : AIComponent = null;
		var combat : CombatComponent = null;
		for (var i=0; i<mTeamMembers.Length; i++)
		{
			aiComp = mTeamMembers[i].GetComponent(AIComponent);
			combat = mTeamMembers[i].GetComponent(CombatComponent);
			if (aiComp)
			{
				aiComp.Enable();
			}
		}
	}
	
	function Shutdown()
	{
		for (var i=0; i<mTeamMembers.Length; i++)
		{
			var aiComp : AIComponent = mTeamMembers[i].GetComponent(AIComponent);
			if (aiComp)
			{
				UnityEngine.Object.Destroy(aiComp);
			}
		}
		
		mTeamMembers = null;
	}
}

class CombatManager extends MonoBehaviour
{

private static var mInstance : CombatManager;
static function Get()
{
	return mInstance;
}
function Awake()
{
	mInstance = this;
	
	mGridColliderPlane = GameObject.Find("Plane");
}

enum Mode
{
	Intro,
	Cinematic,
	Tactical,
	Outro
}

private var mMode : Mode;

var tacticalCameraTarget : GameObject;
private var mGridColliderPlane : GameObject;

var mTeams : CombatantTeam[];

function SetupTeams()
{
	mTeams = new CombatantTeam[GameStateManager.MAX_COMBAT_TEAMS];
	
	for (var i=0; i<GameStateManager.MAX_COMBAT_TEAMS; i++)
	{
		//Team tags are 1-indexed
		var tagIndex = i+1;
		var tag : String = "Team"+tagIndex;
		var members : GameObject[] = GameObject.FindGameObjectsWithTag(tag);
		if (members)//&& (members.Length > 0))
		{
			mTeams[i] = new CombatantTeam();
			mTeams[i].Setup(tag, tag, GameObject.FindGameObjectsWithTag(tag));
		}
	}
}

function UpdateTeams()
{
	for (var i=0; i<GameStateManager.MAX_COMBAT_TEAMS; i++)
	{
		//Team tags are 1-indexed
		var tagIndex = i+1;
		var tag : String = "Team"+tagIndex;
		var members : GameObject[] = GameObject.FindGameObjectsWithTag(tag);
		if (members && mTeams[i])
		{
			mTeams[i].Setup(tag, tag, GameObject.FindGameObjectsWithTag(tag));
			mTeams[i].BeginCombat();
		}
	}
}

function GetCombatantsOnTeam(obj : GameObject)
{
	return GetCombatantsOnTeam(obj.tag);
}

function GetCombatantsOnTeam(teamTag : String)
{
	for (var i=0;i<mTeams.Length;i++)
	{
		if (mTeams[i].mTeamTag == teamTag)
		{
			return mTeams[i].mTeamMembers;
		}
	}
	return null;
}

function GetCombatantsNotOnTeam(obj : GameObject)
{
	return GetCombatantsNotOnTeam(obj.tag);
}

function GetCombatantsNotOnTeam(teamTag : String)
{
	for (var i=0;i<mTeams.Length;i++)
	{
		if (mTeams[i].mTeamTag != teamTag)
		{
			return mTeams[i].mTeamMembers;
		}
	}
	return null;
}

function GetAllCombatants()
{
	var i : int = 0;
	var j : int = 0;

	var total : int = 0;
	for (i=0;i<mTeams.Length;i++)
	{
		total += mTeams[i].mTeamMembers.Length;
	}
	
	var combatants : GameObject[] = new GameObject[total];
	var index : int = 0;
	for (i=0;i<mTeams.Length;i++)
	{
		for (j=0;j<mTeams[i].mTeamMembers.Length;j++)
		{
			combatants[index] = mTeams[i].mTeamMembers[j];
			index++;
		}
	}
	
	return combatants;
}

function IsTeamWarping(teamTag : String)
{
	var members : GameObject[] = GetCombatantsOnTeam(teamTag);
	
	if (members)
	{	
		for (var i=0; i<members.Length; i++)
		{
			if (members[i].GetComponent(WarpComponent))
				return true;
		}
	}
	return false;
}

function IsTeamLaunching(teamTag : String)
{
	var members : GameObject[] = GetCombatantsOnTeam(teamTag);
	
	if (members)
	{	
		for (var i=0; i<members.Length; i++)
		{
			var hanger : HangerComponent = members[i].GetComponent(HangerComponent);
			if (hanger && hanger.IsLaunching())
				return true;
		}
	}
	return false;
}

function Shutdown()
{
	ProcessOutCome();

	DestroyAllCombatants();
	
	for (var i=0;i<mTeams.Length;i++)
	{
		mTeams[i].Shutdown();
		mTeams[i] = null;
	}
	mTeams = null;
}

function ProcessOutCome()
{
	//If battle didn't end with a winner, no result for now
	if (IsBattleOver())
	{
		var winningTeamTag : String = GetWinningTeamTag();
		var winningFaction : FactionNode = GameStateManager.GetFactionByTag(winningTeamTag);
		var winningFleet : FleetNode = GameStateManager.GetFleetByTag(winningTeamTag);
		var combatLocale : CombatLocale = GameStateManager.GetLocale();
		if (winningFaction && combatLocale)
		{
			if (combatLocale.owner != winningFaction)
			{
				  //FactionManager.ChangeTerritoryControl(combatLocale.star, winningFaction.name, false);
				  FactionManager.ClearTerritoryControl(combatLocale.star);
			}
			
			if (winningFleet && (winningFleet.locationStar != combatLocale.star))
			{
				FactionManager.MoveFleet(winningFleet, combatLocale.star);
			}
		}
	}
	
	GameStateManager.Clear();
}

function DestroyAllCombatants()
{
	for (var i=0;i<mTeams.Length;i++)
	{
		for (var j=0;j<mTeams[i].mTeamMembers.Length;j++)
		{
			var combatComp : CombatComponent = mTeams[i].mTeamMembers[j].GetComponent(CombatComponent);
			if (combatComp)
			{
				GameObject.Destroy(mTeams[i].mTeamMembers[j]);
			}
		}
	}
}

function DestroyDeadCombatants()
{
	for (var i=0;i<mTeams.Length;i++)
	{
		for (var j=0;j<mTeams[i].mTeamMembers.Length;j++)
		{
			var combatComp : CombatComponent = mTeams[i].mTeamMembers[j].GetComponent(CombatComponent);
			if (combatComp && combatComp.IsDead())
			{
				GameObject.Destroy(mTeams[i].mTeamMembers[j]);
			}
		}
	}
}

function IsBattleOver()
{
	if (GetNumTeamsRemaining() <= 1)
	{
		return true;
	}
	
	return false;
}


function GetNumTeamsRemaining()
{
	var remainingTeamCount = 0;
	if (!mTeams)
		return remainingTeamCount;
	
	var combatComp : CombatComponent = null;
	for (var i=0;i<mTeams.Length;i++)
	{
		if (mTeams[i].mTeamMembers)
		{
			for (var j=0;j<mTeams[i].mTeamMembers.Length;j++)
			{
				combatComp = mTeams[i].mTeamMembers[j].GetComponent(CombatComponent);
				if (combatComp && !combatComp.IsDead())
				{
					remainingTeamCount++;
					break;
				}
			}
		}
	}
	
	return remainingTeamCount;
}

function GetWinningTeamTag()
{
	if (!mTeams)
		return "";

	var combatComp : CombatComponent = null;
	for (var i=0;i<mTeams.Length;i++)
	{
		for (var j=0;j<mTeams[i].mTeamMembers.Length;j++)
		{
			combatComp = mTeams[i].mTeamMembers[j].GetComponent(CombatComponent);
			if (combatComp && !combatComp.IsDead())
			{
				return mTeams[i].mTeamName;
			}
		}
	}
	
	return "";
}

function GetCombatantType(obj : GameObject) : String
{
	var combatantComp : CombatantComponent = obj.GetComponent(CombatantComponent);
	if (combatantComp)
	{
		return combatantComp.GetCombatantType();
	}
	return "";
}

function GetFollowTargetScore(obj : GameObject) : float
{
	var combatComp : CombatComponent = obj.GetComponent(CombatComponent);
	if (combatComp && combatComp.IsDead())
	{
		return 0.0;
	}

	if (GetCombatantType(obj) == "Fighter")
	{ 
		return 1.0;
	}
	
	if (GetCombatantType(obj) == "Turret")
	{ 
		return 0.75;
	}
	
	return 0.5;
}

function Start() 
{
	SetupTeams();

	mMode = Mode.Intro;
}

function RequestTactialMode() : boolean
{
	if (mMode == Mode.Cinematic)
	{
		mMode = Mode.Tactical;
		return true;
	}
	return false;
}

function RequestCinematicMode() : boolean
{
	if (mMode == Mode.Tactical)
	{
		mMode = Mode.Cinematic;
		return true;
	}
	return false;
}

function RequestRegroup() : boolean
{
	return false;
}

function RequestRetreat() : boolean
{
	return false;
}

private function GetTargetTimeScale() : float
{
	var scale : float = 1.0;
	if (mMode == Mode.Cinematic)
	{
		//Will likely need some complex logic here
		scale = 1.0;
	}
	else if (mMode == Mode.Tactical)
	{
		scale = 0.2;
	}
	
	return scale;
}

private function BeginCombat()
{
	for (var i=0;i<mTeams.Length;i++)
	{
		mTeams[i].BeginCombat();
	}
}

function FixedUpdate() 
{
	var targetScale = GetTargetTimeScale();
	if (Time.timeScale != targetScale)
	{
		//Lerp this later
		Time.timeScale = targetScale;
	}

	if (mMode == Mode.Intro)
	{
		UpdateIntro(Time.fixedDeltaTime);
	}
	else if (mMode == Mode.Cinematic)
	{
		UpdateCinematic(Time.fixedDeltaTime);
	}
	else if (mMode == Mode.Tactical)
	{
		UpdateTactical(Time.fixedDeltaTime);
	}
	else if (mMode == Mode.Outro)
	{
		UpdateOutro(Time.fixedDeltaTime);
	}
}

private function UpdateIntro(deltaTime : float)
{
	if (!IsTeamWarping("Team1"))
	{
		BeginCombat();
		if (!IsTeamLaunching("Team1"))
		{
			mMode = Mode.Cinematic;
		}
		return;
	}
	
	if (!IsActiveCamera("Spawn"))
	{
		SetActiveCamera("Spawn");
	}
}

private function UpdateCinematic(deltaTime : float)
{
	if (IsBattleOver())
	{
		mMode = Mode.Outro;
		return;
	}

	var combatants : GameObject[] = GetCombatantsOnTeam("Team1");
	var bestTarget : GameObject = null;
	var bestTargetScore : float = 0.0;
	for (var i=0;i<combatants.Length; i++)
	{
		var score : float = GetFollowTargetScore(combatants[i]);
		if (score > bestTargetScore)
		{
			bestTarget = combatants[i];
			bestTargetScore = score;
		}
	}
	
	var zoom : float = 40;
	if (GetCombatantType(bestTarget) == "Carrier")
		zoom = 200;
	else if (GetCombatantType(bestTarget) == "Turret")
		zoom = 80;	
	
	SetActiveCamera("Follow", bestTarget, zoom);
}

private function UpdateTactical(deltaTime : float)
{
	if (IsBattleOver())
	{
		mMode = Mode.Outro;
		return;
	}

	var centerPos : Vector3 = Vector3.zero;
	var targetMin : Vector3 = Vector3.zero;
	var targetMax : Vector3 = Vector3.zero;
	var combatants : GameObject[] = GetCombatantsOnTeam("Team1");
	var combatComp : CombatComponent = null;
	var numCameraTargets : int = 0;
	for (var i=0;i<combatants.Length; i++)
	{
		combatComp = combatants[i].GetComponent(CombatComponent);
		if (combatComp && !combatComp.IsDead())
		{
			centerPos += combatants[i].transform.position;
			numCameraTargets++;
			
			if (combatants[i].transform.position.x > targetMax.x) targetMax.x = combatants[i].transform.position.x;
			if (combatants[i].transform.position.z > targetMax.z) targetMax.z = combatants[i].transform.position.z;
			if (combatants[i].transform.position.x < targetMin.x) targetMin.x = combatants[i].transform.position.x;
			if (combatants[i].transform.position.z < targetMin.z) targetMin.z = combatants[i].transform.position.z;
		}
	}
	
	var targetAreaSize : float = Vector3.Distance(targetMax, targetMin);
	var zoom : float = targetAreaSize / 2.0;
	
	if (numCameraTargets > 0)
	{
		centerPos /= numCameraTargets;
		centerPos.y = 0;
		tacticalCameraTarget.transform.position = centerPos;
	}

	//if (!IsActiveCamera("Tactical"))
	{
		SetActiveCamera("Tactical", zoom);
	}
}

private function UpdateOutro(deltaTime : float)
{
	if (!IsActiveCamera("Outro"))
	{
		SetActiveCamera("Outro");
	}
}

private function GetCameraSettings(name : String) : KGFOrbitCamSettings
{
	var settingsGameObject : GameObject = GameObject.Find("CamSettings_" + name);
	if (settingsGameObject)
	{
		var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
		return settings;
	}
	return null;
}

private var mCurrentCameraSettings : String;

private function IsActiveCamera(name : String) : boolean
{
	return (name == mCurrentCameraSettings);
}

private function SetActiveCamera(name : String)
{
	var settings : KGFOrbitCamSettings = GetCameraSettings(name);
	if (settings)
	{
		//settings.itsRoot.itsLinkTargetPositionSpeed = 2.0 / GetTargetTimeScale();
	
		settings.Apply();
		mCurrentCameraSettings = name;
	}
}

private function SetActiveCamera(name : String, zoom : float)
{
	var settings : KGFOrbitCamSettings = GetCameraSettings(name);
	if (settings)
	{
		if (GetTargetTimeScale() < 1.0)
		{
			//settings.itsRoot.itsLinkTargetPositionSpeed = 2.0 * 20.0;
			//Debug.Log("SetActiveCamera speed=" + settings.itsRoot.itsLinkTargetPositionSpeed);
		}
		//settings.itsZoom.itsMinZoom = zoom;
		//settings.itsZoom.itsMaxZoom = zoom;
		//settings.itsZoom.itsStartZoom = zoom;
		settings.Apply();
		mCurrentCameraSettings = name;
	}
}

private function SetActiveCamera(name : String, newRoot : GameObject)
{
	var settings : KGFOrbitCamSettings = GetCameraSettings(name);
	if (settings)
	{
		//settings.itsRoot.itsLinkTargetPositionSpeed = 2.0 / GetTargetTimeScale();
		//settings.itsRoot.itsRoot = newRoot;
		settings.Apply();
		mCurrentCameraSettings = name;
	}
}

private function SetActiveCamera(name : String, newRoot : GameObject, zoom : float)
{
	var settings : KGFOrbitCamSettings = GetCameraSettings(name);
	if (settings)
	{
		//settings.itsRoot.itsLinkTargetPositionSpeed = 2.0 / GetTargetTimeScale();
		//settings.itsRoot.itsRoot = newRoot;
		//settings.itsZoom.itsMinZoom = zoom;
		//settings.itsZoom.itsMaxZoom = zoom;
		//settings.itsZoom.itsStartZoom = zoom;
		settings.Apply();
		mCurrentCameraSettings = name;
	}
}

} //CombatManager