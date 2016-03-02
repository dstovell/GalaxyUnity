#pragma strict

class HudGUI extends MonoBehaviour
{

var mChatGui : ChatGUI;

var mLoadingScreen : GUITexture;

enum MenuState { Main, Options, Loading }

enum HudState { None, AttackSelected, MoveSelected, BattleEnded }

private var menuState : MenuState;
private var hudState : HudState;

private var guiNativeHeight = 480.0;

private var mAvatarHeight = 120;
private var mAvatarWidth = 80;
private var mInfoHeight = 24;
private var mButtonHeight = 75;
private var mButtonWidth = 100;

var mGuiInFocus = false;
var mFocusFrameCount = 0;

var tactialModeIcon : Texture;
var cinematicModeIcon : Texture;
var moveIcon : Texture;
var moveSelectedIcon : Texture;
var attackIcon : Texture;
var attackSelectedIcon : Texture;
var regroupIcon : Texture;
var retreatIcon : Texture;

private static var mInstance : HudGUI;
static function Get()
{
	return mInstance;
}

function Awake() 
{
	mInstance = this;
	Screen.orientation = ScreenOrientation.LandscapeLeft;

	menuState = MenuState.Main;
	hudState = HudState.None;
		
	if (mLoadingScreen)
	{
		mLoadingScreen.enabled = false;
	}
		
	//mChatGui = gameObject.AddComponent(ChatGUI);
}

function SetGuiInFocus()
{
	mGuiInFocus = true;
	mFocusFrameCount = 5;
}

function IsGuiInFocus()
{
	//return mGuiInFocus || mChatGui.IsGuiInFocus();
	return false;
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
		case MenuState.Main:
			if (hudState != HudState.BattleEnded)
				OnMain();
			break;
		case MenuState.Options:
			if (hudState != HudState.BattleEnded)
				OnOptions();
			break;
		case MenuState.Loading:	
			OnLoading();
			break;
	}
	
	switch (hudState)
	{
		case HudState.None:
			break;
		case HudState.BattleEnded:
			OnBattleEnded();
			break;
	}
	
	GUI.matrix = unscaledMatrix;
}

function OnMain()
{
	GUILayout.BeginArea (Rect (10,10,100,100));
		if ( GUILayout.Button(GUIContent(tactialModeIcon, "onHUD"), GUILayout.Height(mButtonHeight)) )
		{
			menuState = MenuState.Options;
			CombatManager.Get().RequestTactialMode();
		}
		if (GUI.tooltip)
			SetGuiInFocus();
	GUILayout.EndArea ();
}

function OnOptions()
{
	//Cache this:
	var spawnPoints = GameObject.FindGameObjectsWithTag("Spawn_Point");

	GUILayout.BeginArea (Rect (10,10,100,600));
		if (GUILayout.Button(GUIContent(cinematicModeIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			menuState = MenuState.Main;
			hudState = HudState.None;
			CombatManager.Get().RequestCinematicMode();
		}
		
		if (hudState == HudState.MoveSelected)
		{
			if (GUILayout.Button(GUIContent(moveSelectedIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
				hudState = HudState.None;
		}
		else
		{
			if (GUILayout.Button(GUIContent(moveIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
				hudState = HudState.MoveSelected;
		}
		
		if (hudState == HudState.AttackSelected)
		{
			if (GUILayout.Button(GUIContent(attackSelectedIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
				hudState = HudState.None;
		}
		else
		{
			if (GUILayout.Button(GUIContent(attackIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
				hudState = HudState.AttackSelected;
		}
		
		if (GUILayout.Button(GUIContent(regroupIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			hudState = HudState.None;
			CombatManager.Get().RequestRegroup();
		}
		if (GUILayout.Button(GUIContent(retreatIcon, "onHUD"), GUILayout.Height(mButtonHeight)))
		{
			hudState = HudState.None;
			CombatManager.Get().RequestRetreat();
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
	
	if (GameStateManager.IsCampaignCombat())
	{
		CombatManager.Get().Shutdown();
		Application.LoadLevel("GalaxyViewer");
	}
	else
	{
		CombatManager.Get().Shutdown();
		Application.LoadLevel("SpaceLoader");
	}
}

function LoadLoader()
{
	menuState = MenuState.Loading;
	hudState = HudState.None;

	if (mLoadingScreen)
	{
		mLoadingScreen.pixelInset.x = 0;
		mLoadingScreen.pixelInset.y = 0;
		mLoadingScreen.pixelInset.height = Screen.height;
		mLoadingScreen.pixelInset.width = Screen.width;
		
		mLoadingScreen.enabled = true;
	}
}

function OnBattleEnded()
{
	GUILayout.BeginArea(Rect (230,340,250,500));
		var winningTeam : String = CombatManager.Get().GetWinningTeamTag();
		var youWon = (winningTeam == "Team1");
		if (winningTeam)
		{
			if (youWon)
				GUILayout.Box("You won the battle!");
			else
				GUILayout.Box("You lost the battle!");
		}
		else
		{
			GUILayout.Box("The battle was a draw.");
		}
		if (GameStateManager.IsCampaignCombat())
		{
			if (GUILayout.Button(GUIContent("Star Map", "onHUD"), GUILayout.Height(mButtonHeight)))
			{
				LoadLoader();
			}
		}
		else
		{
			if (GUILayout.Button(GUIContent("Main Menu", "onHUD"), GUILayout.Height(mButtonHeight)))
			{
				LoadLoader();
			}
		}
	GUILayout.EndArea();
}

function GetHudState()
{
	return hudState;
}

function Update()
{
	//Game OVER
	if (CombatManager.Get().IsBattleOver())
	{
		hudState = HudState.BattleEnded;
	}
}

} //HudGUI
