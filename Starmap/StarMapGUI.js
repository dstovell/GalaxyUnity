#pragma strict

class StarMapGUI extends MonoBehaviour
{

var settingsIcon : Texture;

var mLoadingScreen : GUITexture;

enum MenuState { None, Collapsed, Main, Loading, MoveFleet, AttackWithFleet }

private var menuState : MenuState;

private var guiNativeHeight = 480.0;

private var mButtonHeight = 75;
private var mButtonWidth = 100;

var mGuiInFocus = false;
var mFocusFrameCount = 0;

private var renameString : String = "";
private var mSelectedStar : GameObject;
private var mSelectedPlanet : GameObject;

private static var mInstance : StarMapGUI;
static function Get()
{
	return mInstance;
}

function GetMenuState() : MenuState
{
	return menuState;
}

function Awake() 
{
	mInstance = this;
	Screen.orientation = ScreenOrientation.LandscapeLeft;

	menuState = MenuState.Collapsed;
	
	if (mLoadingScreen)
	{
		mLoadingScreen.enabled = false;
	}
}

function Start() 
{
	FactionManager.Init();

	//var loadedMap : boolean = LoadStarMap();
	//if (!loadedMap)
	//{
	//	GenerateStarMap();
	//}
	
	var capitol : StarNode = StarMap.SetViewFactionCapitol(WebTool.GetStoredUsername());
	StarMapCamera.Get().OnStarSelected(capitol.model);
}

function GenerateStarMap()
{
	//var mapSize = Vector2(600, 600);
	//StarMap.Generate(25, Vector3(-1*mapSize.x/2.0, 0, mapSize.y/2.0), Vector3(mapSize.x/2.0, 0, -1*mapSize.y/2.0));
	
	if (StarMapCamera.Get())
		StarMapCamera.Get().InitForAll();
}

function ClearStarMap()
{
	if (StarMapCamera.Get())
		StarMapCamera.Get().ClearTargets();

	StarMap.Clear();
}

function LoadStarMap()
{
	var loadedMap : boolean = StarMap.LoadLocal();
	return loadedMap;
}

function SaveStarMap()
{
	StarMap.SaveLocal();
}

function ClearSavedStarMap()
{
	StarMap.ClearLocal();
}

function SetGuiInFocus()
{
	mGuiInFocus = true;
	mFocusFrameCount = 5;
}

function IsGuiInFocus()
{
	return mGuiInFocus;
}

function OnGUI() 
{
	var scaleValue = Screen.height/guiNativeHeight;
	var guiScale: Vector3;
	guiScale.x = scaleValue;
    guiScale.y = scaleValue; 
    guiScale.z = 1;
    
    var unscaledMatrix = GUI.matrix;
    GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, guiScale);

	if (mFocusFrameCount == 0)
		mGuiInFocus = false;
	else
		mFocusFrameCount--;
	
	switch (menuState)
	{
		case MenuState.None:
			break;
		case MenuState.Collapsed:
			OnCollapsed();
			break;
		case MenuState.Main:
			OnMain();
			break;
		case MenuState.MoveFleet:
			OnMoveFleet();
			break;
		case MenuState.AttackWithFleet:
			OnAttackWithFleet();
			break;
		case MenuState.Loading:	
			OnLoading();
			break;
	}
	
	if ((menuState != MenuState.MoveFleet) && (menuState != MenuState.AttackWithFleet))
	{
		if (mSelectedStar)
		{
			OnStar();
		}
		else if (mSelectedPlanet)
		{
			OnPlanet();
		}
	}
	
	GUI.matrix = unscaledMatrix;
}

function OnCollapsed()
{
	GUILayout.BeginArea (Rect (10,10,150,400));
		if (GUILayout.Button(GUIContent(settingsIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			menuState = MenuState.Main;
		}
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnMain()
{
	GUILayout.BeginArea (Rect (10,10,150,400));
		if (GUILayout.Button(GUIContent("Close", "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			menuState = MenuState.Collapsed;
		}
		if (GUILayout.Button(GUIContent("Regenerate Map", "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			ClearStarMap();
			GenerateStarMap();
		}
		if (GUILayout.Button(GUIContent("Save Map", "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			SaveStarMap();
		}
		if (GUILayout.Button(GUIContent("Clear Saved Map", "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			ClearSavedStarMap();
		}
		if (GUILayout.Button(GUIContent("Main Menu", "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			ClearStarMap();
			LoadLoader();
		}
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnStar()
{
	var starComp : StarComponent = mSelectedStar.GetComponent(StarComponent);
	if (!starComp)
		return;
		
	var isControlled : boolean = FactionManager.IsTerritoryControlled(starComp.starNode);
	var isOccupied : boolean = FactionManager.IsTerritoryOccupied(starComp.starNode);

	var scaleValue = Screen.height/guiNativeHeight;
	var width = Screen.width / scaleValue;

	GUILayout.BeginArea (Rect (width-160,10,150,210));
		GUILayout.TextArea("Star: "+starComp.starNode.GetName());
		GUILayout.TextArea("Owner: "+FactionManager.GetTerritoryOwnerName(starComp.starNode));
		if (isControlled)
		{
			//GUILayout.FlexibleSpace();
			//renameString = GUILayout.TextField(renameString);
			//if (GUILayout.Button(GUIContent("Rename Star", "onHUD"), GUILayout.Height(mButtonHeight)))
			//{
			//	starComp.starNode.givenName = renameString;
			//}
		}
		if (isOccupied)
		{
			if (GUILayout.Button(GUIContent("Fleet Move", "onHUD"), GUILayout.Height(mButtonHeight)))
			{
				menuState = MenuState.MoveFleet;				
			}
			if (GUILayout.Button(GUIContent("Fleet Attack", "onHUD"), GUILayout.Height(mButtonHeight)))
			{
				menuState = MenuState.AttackWithFleet;
			}
		}
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnMoveFleet()
{
	var scaleValue = Screen.height/guiNativeHeight;
	var width = Screen.width / scaleValue;

	GUILayout.BeginArea (Rect (width-160,10,150,210));
		GUILayout.Box("Moving fleet to...");
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnAttackWithFleet()
{
	var scaleValue = Screen.height/guiNativeHeight;
	var width = Screen.width / scaleValue;

	GUILayout.BeginArea (Rect (width-160,10,150,210));
		GUILayout.Box("Attack system with Fleet...");
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnPlanet()
{
	var planetComp : PlanetComponent = mSelectedPlanet.GetComponent(PlanetComponent);
	if (!planetComp)
		return;
		
	var isControlled : boolean = FactionManager.IsTerritoryControlled(planetComp.planetNode.parentStar);
	var isOccupied : boolean = FactionManager.IsTerritoryOccupied(planetComp.planetNode.parentStar);
		
	var scaleValue = Screen.height/guiNativeHeight;
	var width = Screen.width / scaleValue;
		
	GUILayout.BeginArea (Rect (width-160,10,150,250));
		GUILayout.TextArea("Planet: "+planetComp.planetNode.GetName());
		GUILayout.TextArea("Type: "+PlanetComponent.GetTypeName(planetComp.type));
		GUILayout.TextArea(PlanetComponent.GetText(planetComp.type));
		if (isControlled)
		{
			//GUILayout.FlexibleSpace();
			//renameString = GUILayout.TextField(renameString);
			//if (GUILayout.Button(GUIContent("Rename Planet", "onHUD"), GUILayout.Height(mButtonHeight)))
			//{
			//	planetComp.planetNode.givenName = renameString;
			//}
		}
		else if (isOccupied)
		{
			if (GUILayout.Button(GUIContent("Colonize", "onHUD"), GUILayout.Height(mButtonHeight)))
			{
				var capitol : TerritoryNode = FactionManager.GetFactionCapitol(WebTool.GetStoredUsername());
			
				FactionManager.ChangeTerritoryControl(planetComp.planetNode.parentStar, WebTool.GetStoredUsername(), (capitol == null));
				FactionManager.BuildBase(planetComp.planetNode, WebTool.GetStoredUsername());
				planetComp.planetNode.SetViewMode(StarMapViewMode.SolarSystem, planetComp.planetNode.parentStar);
			}
		}
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnLoading()
{
	var width : float = 100;
	var height : float = 100;
	var x : float = Screen.width/2 - width/2;
	var y : float = Screen.height/2 - height/2;
	GUILayout.BeginArea( Rect(x,y,width,height) );
		GUILayout.Box("Loading");
	GUILayout.EndArea();
	
	Application.LoadLevel("SpaceLoader");
}

function LoadLoader()
{
	OnClearSelected();
	menuState = MenuState.Loading;

	if (mLoadingScreen)
	{
		mLoadingScreen.pixelInset.x = 0;
		mLoadingScreen.pixelInset.y = 0;
		mLoadingScreen.pixelInset.height = Screen.height;
		mLoadingScreen.pixelInset.width = Screen.width;
		
		mLoadingScreen.enabled = true;
	}
}

function Update()
{
}

function CanAttack(fleet : FleetNode, star : StarNode) : boolean
{
	var fleetLocation : StarNode = fleet.locationStar;
	if (fleetLocation == star)
		return false;
	
	if (!fleetLocation.IsConnectedTo(star))
		return false;
		
	var fleetFaction : FactionNode = fleet.owner;
	var starFaction : FactionNode = FactionManager.GetTerritoryOwner(star);
	if (!starFaction || (fleetFaction == starFaction))
		return false;
		
	return true;
}

function MoveFleet(startStar : GameObject, endStar : GameObject) : boolean
{
	var startStarComp : StarComponent = startStar.GetComponent(StarComponent);
	var endStarComp : StarComponent = endStar.GetComponent(StarComponent);
	
	//You can only travel between connected nodes
	if (!startStarComp.starNode.IsConnectedTo(endStarComp.starNode))
		return false;

	var fleetToMove : FleetNode = FactionManager.TerritoryOccupier(startStarComp.starNode);
	if (CanAttack(fleetToMove, endStarComp.starNode))
		return false;
	
	if (fleetToMove)
	{	
		FactionManager.MoveFleet(fleetToMove, endStarComp.starNode);
		
		GameObject.Destroy(startStarComp.starNode.ringModel);
		startStarComp.starNode.ringModel = null;
		startStarComp.starNode.InitComponents();
		startStarComp.starNode.OnSelected();
		
		GameObject.Destroy(endStarComp.starNode.ringModel);
		endStarComp.starNode.ringModel = null;
		endStarComp.starNode.InitComponents();
		
		StarMap.RefreshViewMode();
		
		return true;
	}
	return false;
}

function AttackWithFleet(startStar : GameObject, endStar : GameObject) : boolean
{
	var startStarComp : StarComponent = startStar.GetComponent(StarComponent);
	var endStarComp : StarComponent = endStar.GetComponent(StarComponent);

	var fleetToAttackWith : FleetNode = FactionManager.TerritoryOccupier(startStarComp.starNode);
	if (!fleetToAttackWith)
		return false;
	if (!CanAttack(fleetToAttackWith, endStarComp.starNode))
		return false;
	
	var fleetModel : GameObject = GameObject.Instantiate(StarMap.fleetModelPrefab, Vector3(-10000, -10000, -10000), Quaternion.identity) as GameObject;
	GameObject.DontDestroyOnLoad(fleetModel);
	
	var hanger : HangerComponent = fleetModel.GetComponent(HangerComponent);
	if (hanger)
	{
		for (var i=0; i<10; i++)
			hanger.AddCombatant("Heavy Drone");
	}
	
	var territoryOwner : FactionNode = FactionManager.GetTerritoryOwner(endStarComp.starNode);
	
	GameStateManager.AddTeam("Team1", fleetToAttackWith.owner, fleetToAttackWith);
	GameStateManager.AddTeam("Team2", territoryOwner, null);
	
	GameStateManager.SetLocale(endStarComp.starNode, null, territoryOwner);
	
	StarMap.PrepareForLevelLoad();
	Application.LoadLevel("SpaceTest_Hex");
	
	return true;
}

function OnStarSelected(star : GameObject)
{
	var success : boolean = false;
	if (menuState == MenuState.MoveFleet)
	{
		success = MoveFleet(mSelectedStar, star);
		if (success)
			menuState = MenuState.Collapsed;
		return;
	}
	else if (menuState == MenuState.AttackWithFleet)
	{
		success = AttackWithFleet(mSelectedStar, star);
		if (success)
			menuState = MenuState.Collapsed;
		return;
	}

	StarBaseGUI.Get().UnSelect();

	var starComp : StarComponent = null;
	if (mSelectedStar)
	{
		starComp = mSelectedStar.GetComponent(StarComponent);
		if (starComp && starComp.starNode)
			starComp.starNode.OnUnSelected();
	}

	mSelectedStar = star;
	mSelectedPlanet = null;
	
	starComp = mSelectedStar.GetComponent(StarComponent);
	if (starComp)
	{
		renameString = starComp.starNode.GetName();
		if (starComp && starComp.starNode)
			starComp.starNode.OnSelected();
	}
}

function OnPlanetSelected(planet : GameObject)
{
	StarBaseGUI.Get().UnSelect();
	
	mSelectedStar = null;
	mSelectedPlanet = planet;
	
	var planetComp : PlanetComponent = mSelectedPlanet.GetComponent(PlanetComponent);
	if (planetComp)
		renameString = planetComp.planetNode.GetName();
}

function OnStarbaseSelected(starbase : GameObject)
{
	mSelectedStar = null;
	mSelectedPlanet = null;

	renameString = "Starbase";
	menuState = MenuState.None;
	StarBaseGUI.Get().SelectBase();
}

function OnClearSelected()
{
	mSelectedStar = null;
	mSelectedPlanet = null;
	renameString = "";
}


} //HudGUI
