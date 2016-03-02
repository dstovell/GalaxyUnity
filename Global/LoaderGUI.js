#pragma strict

class LoaderGUI extends MonoBehaviour
{

var team1CombatantPrefabs : GameObject[];
var team2CombatantPrefabs : GameObject[];
var combatantIcons : Texture[];

private var combatantPrefabs : GameObject[];

private var webCombatantPrefabs : GameObject[];
private var webCombatantIcons : Texture[];

enum MenuState { Title, Main, Account, CreateUser, LoginUser, AddCombatant, LoadLevel, Loading, Starbase }

var menuState : MenuState;
private var numCombatants : int;
private var currentTeamToLoad : String;

private var guiNativeHeight = 480.0;

var mLoadingScreen : GUITexture;
private var mLevelToLoad : String;

private var mUnscaledMatrix : Matrix4x4;

private var mButtonHeight = 75;

private var mEmail : String = "";
private var mPassword : String = "";

var titleCard : Texture;
var carrierGameObject : GameObject;

private static var mInstance : LoaderGUI;
static function Get() : LoaderGUI
{
	return mInstance;
}

function Awake()
{
	mInstance = this;
	Screen.orientation = ScreenOrientation.LandscapeLeft;
}

function Start() 
{
	menuState = MenuState.Title;
	
	numCombatants = 0;

	if (mLoadingScreen)
	{
		mLoadingScreen.pixelInset.x = 0;
		mLoadingScreen.pixelInset.y = 0;
		mLoadingScreen.pixelInset.height = Screen.height;
		mLoadingScreen.pixelInset.width = Screen.width;
		mLoadingScreen.enabled = false;
	}
	
	WebTool.Init();
	WebTool.AttemptAutoLogin();
	
	ConfigTool.Init();
	ConfigTool.FetchCombatantConfigs();
	ConfigTool.FetchComponentConfigs();
}

function InitForTeam(teamTag : String)
{
	//if (teamTag == "Team1")
	//	combatantPrefabs = team1CombatantPrefabs;
	//else if (teamTag == "Team2")
	//	combatantPrefabs = team2CombatantPrefabs;

	var combatants = GameObject.FindGameObjectsWithTag(teamTag);
	
	if (combatants)
	{
		numCombatants = combatants.length;
		
		//Remove the carrier for now
		numCombatants--;
	}
	
	currentTeamToLoad = teamTag;
	
	InitWithWebCombatants();
	
	//var settingsGameObject : GameObject = GameObject.Find("CamSettings_" + teamTag);
	//if (settingsGameObject)
	//{
	//	var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
	//	settings.Apply();
	//}
}

function InitWithWebCombatants()
{
	if (ConfigTool.GetCombatantConfigCount() == 0)
		return;

	if (webCombatantPrefabs == null)
	{
		var i : int = 0;
		var miltaryCount : int = 0;
		for (i=0; i<ConfigTool.GetCombatantConfigCount(); i++)
		{
			if (ConfigTool.GetCombatantConfig(i)["Type"].Value == "Fighter")
				miltaryCount++;
		}
	
		webCombatantPrefabs = new GameObject[miltaryCount];
		webCombatantIcons = new Texture[miltaryCount];
		var addIndex : int = 0;
		for (i=0; i<ConfigTool.GetCombatantConfigCount(); i++)
		{
			if (ConfigTool.GetCombatantConfig(i)["Type"].Value == "Fighter")
			{
				webCombatantPrefabs[addIndex] = Resources.Load(ConfigTool.GetCombatantConfig(i)["Model"]);
				webCombatantPrefabs[addIndex].name = ConfigTool.GetCombatantConfig(i)["Name"];
				webCombatantIcons[addIndex] = Resources.Load(ConfigTool.GetCombatantConfig(i)["FlavorArt"]);
				addIndex++;
			}
		}
	}

	combatantPrefabs = webCombatantPrefabs;
	combatantIcons = webCombatantIcons;	
}


function ShowCarrier()
{
	var settingsGameObject : GameObject = GameObject.Find("CamSettings_Carrier");
	if (settingsGameObject)
	{
		var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
		settings.Apply();
	}
	
	if (carrierGameObject)
		carrierGameObject.SetActive(true);
}

function ScaleGUI() 
{
	var scaleValue = Screen.height/guiNativeHeight;
	var guiScale: Vector3;
	guiScale.x = scaleValue;
    guiScale.y = scaleValue; 
    guiScale.z = 1;
    
    mUnscaledMatrix = GUI.matrix;
    GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, guiScale);
}

function UnscaleGUI() 
{
	GUI.matrix = mUnscaledMatrix;
}

function OnGUI() 
{
	ScaleGUI();

	switch (menuState)
	{
		case MenuState.Title:
			OnTitle();
			break;
		case MenuState.Main:
			OnMain();
			break;
		case MenuState.Account:
			OnAccount();
			break;
		case MenuState.CreateUser:
			OnCreateUser();
			break;
		case MenuState.LoginUser:
			OnLoginUser();
			break;
		case MenuState.AddCombatant:
			OnAddCombatant();
			UnscaleGUI();
			OnRemoveCombatant();
			break;
		case MenuState.LoadLevel:
			OnLoadLevel();
			break;
		case MenuState.Loading:
			UnscaleGUI();
			OnLoading();
			break;
		case MenuState.Starbase:
			break;
	}
	
	UnscaleGUI();
}

function OnTitle()
{
	GUILayout.BeginArea( Rect(10,10,200,600) );
		
		GUILayout.Box(titleCard, GUILayout.Height(mButtonHeight));		
		
		if (WebTool.IsLoggedIn())
		{
			GUILayout.Box("Welcome: " + WebTool.GetStoredUsername());
		}
		else
		{
			GUILayout.Box("Please Login");
		}
		
		if ( GUILayout.Button("User Account", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Account;
		}
		
		if (WebTool.IsLoggedIn())
		{
			if ( GUILayout.Button("New Campaign", GUILayout.Height(mButtonHeight)) )
			{
				StarMap.GenerateStarMapForFaction(WebTool.GetStoredUsername());
				GameStateManager.Init();
			
				RemoveAllCombatants();
				LoadLevel("GalaxyViewer");
			}
		}
		else 
		{
			GUILayout.Box("\nNew Campaign", GUILayout.Height(mButtonHeight));
		}
		
		if ( GUILayout.Button("Quick Combat", GUILayout.Height(mButtonHeight)) )
		{
			ShowCarrier();
			menuState = MenuState.Main;
		}
		
		if (GUILayout.Button("Quit", GUILayout.Height(mButtonHeight)) )
		{
			Application.Quit();
		}
	GUILayout.EndArea();
}

function OnMain()
{
	GUILayout.BeginArea( Rect(10,10,200,600) );
		
		GUILayout.Box(titleCard, GUILayout.Height(mButtonHeight));
		
		if (WebTool.IsLoggedIn())
		{
			GUILayout.Box("Welcome: " + WebTool.GetStoredUsername());
		}
		else
		{
			GUILayout.Box("Please Login");
		}
		
		if ( GUILayout.Button("Load Drones", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.AddCombatant;
			SendMessage("InitForTeam", "Team1");
		}
		if (numCombatants > 0)
		{
			if (GUILayout.Button("Load Level", GUILayout.Height(mButtonHeight)) )
			{
				menuState = MenuState.LoadLevel;
			}
		}
		else
		{
			GUILayout.Box("\n\nLoad Level", GUILayout.Height(mButtonHeight));
		}
		if (GUILayout.Button("Starbase", GUILayout.Height(mButtonHeight)))
		{
			menuState = MenuState.Starbase;
			StarBaseGUI.Get().SelectBase();
		}
		if (GUILayout.Button("Main Menu", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Title;
		}
		
		//if (GUILayout.Button("Quit", GUILayout.Height(mButtonHeight)) )
		//{
		//	Application.Quit();
		//}
	GUILayout.EndArea();
}

function OnAccount()
{
	GUILayout.BeginArea( Rect(10,10,200,600) );
		if (WebTool.IsLoggedIn())
		{
			GUILayout.Box("Welcome: " + WebTool.GetStoredUsername());
		}
		else
		{
			GUILayout.Box("Please Login");
		}
	
		if (!WebTool.IsUserCreated())
		{
			if ( GUILayout.Button("Create User", GUILayout.Height(mButtonHeight)) )
			{
				menuState = MenuState.CreateUser;
			}
		}
		else
		{
			if ( GUILayout.Button("Forget User", GUILayout.Height(mButtonHeight)) )
			{
				WebTool.Logout();
				WebTool.ForgetUserData();
				mEmail = "";
				mPassword = "";
			}
		}
		
		if (!WebTool.IsLoggedIn())
		{
			if ( GUILayout.Button("Login User", GUILayout.Height(mButtonHeight)) )
			{
				menuState = MenuState.LoginUser;
			}
		}
		else
		{
			if ( GUILayout.Button("Logout", GUILayout.Height(mButtonHeight)) )
			{
				WebTool.Logout();
			}
		}
		
		if ( GUILayout.Button("Back", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Title;
		}
	GUILayout.EndArea();
}

function OnCreateUser()
{
	GUILayout.BeginArea( Rect(10,10,200,600) );
		GUILayout.Box("Email:");
		mEmail = GUILayout.TextField(mEmail, 32);
		GUILayout.Box("Password:");
		mPassword = GUILayout.PasswordField(mPassword, "*"[0], 32);
		
		if ( GUILayout.Button("Create User", GUILayout.Height(mButtonHeight)) )
		{
			WebTool.CreateUser(mEmail, mPassword);
		}
		else if ( GUILayout.Button("Back", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Title;
		}
	GUILayout.EndArea();
	
	if (WebTool.IsUserCreated())
	{
		menuState = MenuState.Title;
	}
}

function OnLoginUser()
{
	if (mEmail == "")
		mEmail = WebTool.GetStoredEmail();
	if (mPassword == "")
		mPassword = WebTool.GetStoredPassword();

	GUILayout.BeginArea( Rect(10,10,200,600) );
		GUILayout.Box("Email:");
		mEmail = GUILayout.TextField(mEmail, 32);
		GUILayout.Box("Password:");
		mPassword = GUILayout.PasswordField(mPassword, "*"[0], 32);
		
		if ( GUILayout.Button("Login User", GUILayout.Height(mButtonHeight)) )
		{
			WebTool.LoginUser(mEmail, mPassword);
		}
		else if ( GUILayout.Button("Back", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Main;
		}
	GUILayout.EndArea();
	
	if (WebTool.IsLoggedIn())
	{
		menuState = MenuState.Title;
	}
}

function OnAddCombatant()
{
	//Cache this:
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");

	GUILayout.BeginArea( Rect(10,10,200,600) );
		//GUILayout.BeginHorizontal("");
			for (var i=0; i<combatantPrefabs.length; i++)
			{
				if (numCombatants < spawnPoints.length)
				{
					//if ( GUILayout.Button( combatantIcons[i] ) )
					if ( GUILayout.Button( combatantPrefabs[i].name, GUILayout.Height(mButtonHeight) ) )
					{
						LoadCombatant(i, currentTeamToLoad);
					}
				}
			}
		//GUILayout.EndHorizontal();
		if ( GUILayout.Button("Back", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Main;
			SendMessage("InitForTeam", "Team1");
		}
	GUILayout.EndArea();
}

function OnRemoveCombatant()
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	for (var i=0; i<spawnPoints.length; i++)
	{		
		var spawnComp : SpawnPointComponent = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp && spawnComp.IsUsed() && (spawnComp.teamToSpawn == currentTeamToLoad))
		{
			//var screenPos : Vector3 = Camera.main.WorldToScreenPoint(spawnComp.GetSpawnPostion());
			var screenPos : Vector3 = Camera.main.WorldToScreenPoint(spawnPoints[i].transform.position);
			
			var width : float = 100;
			var height : float = 100;
			GUILayout.BeginArea( Rect(screenPos.x-width/2,Screen.height-screenPos.y-height/2,width,height) );
				if ( GUILayout.Button("Remove") )
				{
					spawnComp.DestroySpawned();
					numCombatants--;
				}
			GUILayout.EndArea();
		}
	}
}

function OnLoadLevel()
{
	GUILayout.BeginArea( Rect(10,10,200,600) );
		if ( GUILayout.Button("HexGrid Space", GUILayout.Height(mButtonHeight)) )
		{
			LoadLevel("SpaceTest_Hex");
		}
		/*if ( GUILayout.Button("Base Space", GUILayout.Height(mButtonHeight)) )
		{
			LoadLevel("SpaceTest_Base");
		}*/
		if (GUILayout.Button("Back", GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Main;
		}
	GUILayout.EndArea();
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
	
	Application.LoadLevel(mLevelToLoad);
}

function LoadCombatant(index : int, teamTag : String)
{
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");
	for (var i=0; i<spawnPoints.length; i++)
	{
		var spawnComp : SpawnPointComponent = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp && !spawnComp.IsUsed() && (spawnComp.teamToSpawn == teamTag))
		{
			var spawnPos = spawnComp.GetSpawnPostion();
			
			var newPrefab : GameObject = Instantiate(combatantPrefabs[index],Vector3.zero,Quaternion.identity);
			newPrefab.transform.position = spawnPos;
			newPrefab.transform.rotation = spawnPoints[i].transform.rotation;
			newPrefab.tag = teamTag;
			DontDestroyOnLoad(newPrefab);
			numCombatants++;
			
			if (ConfigTool.GetCombatantConfigCount() > index)
			{
				var combatant : CombatantComponent = newPrefab.GetComponent(CombatantComponent);
				combatant.SetConfig( ConfigTool.GetCombatantConfig(index) );
			}
			
			if (spawnComp.spawnAction == SpawnAction.Launch)
			{
				var carrierObject : GameObject = GetAbsoluteParent(spawnPoints[i]);
				newPrefab.transform.parent = carrierObject.transform;
				
				//Hacky fix
				DontDestroyOnLoad(carrierObject);
			}
						
			spawnComp.MarkUsed(newPrefab);
			break;
		}
	}
}

function GetAbsoluteParent(obj : GameObject) : GameObject
{
	var transform : Transform = obj.transform;
	while (transform.parent)
	{
		transform = transform.parent;
	}
	return transform.gameObject;
}

function ApplyComponentConfig(combatantObj : GameObject, componentConfigIndex : int)
{
	if (ConfigTool.GetComponentConfigCount() > componentConfigIndex)
	{
		var combatant : CombatantComponent = combatantObj.GetComponent(CombatantComponent);
		combatant.AddComponentConfig( ConfigTool.GetComponentConfig(componentConfigIndex) );
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

function LoadLevel(levelName : String)
{
	mLevelToLoad = levelName;
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

}