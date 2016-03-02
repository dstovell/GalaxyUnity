#pragma strict

class StarMapCamera extends MonoBehaviour
{

private var GalaxyZoomRange:Vector2 = Vector2(80, 200);
private var SolarSystemZoomRange:Vector2 = Vector2(6, 80);
var CurrentZoom:float;

var lastStarSelected : GameObject;
var isStarbaseSelected : boolean;
var TargetArray:GameObject[];

var cameraComp : KGFOrbitCam = null;

private static var mInstance : StarMapCamera;
static function Get()
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
    cameraComp = gameObject.GetComponent(KGFOrbitCam);
   
    InitForAll();
}

function InitForAll()
{
	//TargetArray = GameObject.FindGameObjectsWithTag("Star");
	CurrentZoom = GalaxyZoomRange.y;
}

function ClearTargets()
{
	TargetArray = null;
	
	StarMapGUI.Get().OnClearSelected();
}

function SelectLastStar()
{
	if (lastStarSelected)
	{
		OnStarSelected(lastStarSelected);
	}
}

function OnStarSelected(star : GameObject)
{
	if (StarMapGUI.Get().GetMenuState() == StarMapGUI.MenuState.MoveFleet)
	{
		StarMapGUI.Get().OnStarSelected(star);
		return;
	}

	print("OnStarSelected lastStarSelected="+lastStarSelected + " isStarbaseSelected="+isStarbaseSelected);
	if (TargetArray && (TargetArray.Length == 1))
    {
    	if (TargetArray[0] == star)
    	{
    		if (CurrentZoom > SolarSystemZoomRange.y)
    		{
    			cameraComp.SetZoom(SolarSystemZoomRange.y);
    			return;
    		}
    	}
    }

	TargetArray = new GameObject[1];
	TargetArray[0] = star;
	lastStarSelected = star;
	
	var settingsGameObject : GameObject = GameObject.Find("CamSettings_Galaxy");
	if (settingsGameObject)
	{
		print("Set CamSettings_Galaxy");
		var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
		//settings.itsRoot.itsRoot = star;
		//settings.itsTransformTarget.itsTransformTarget = star;
		settings.Apply();
		cameraComp.SetZoom(CurrentZoom);
	}
	isStarbaseSelected = false;
	
	StarMapGUI.Get().OnStarSelected(star);
}

function OnPlanetSelected(planet : GameObject)
{
	print("OnPlanetSelected lastStarSelected");
	TargetArray = new GameObject[1];
	TargetArray[0] = planet;
	
	if (CurrentZoom > SolarSystemZoomRange.x)
    {
    	cameraComp.SetZoom(SolarSystemZoomRange.x);
    }
    
    var settingsGameObject : GameObject = GameObject.Find("CamSettings_Galaxy");
	if (settingsGameObject)
	{
		print("Set CamSettings_Galaxy");
		var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
		//settings.itsRoot.itsRoot = planet;
		settings.Apply();
		cameraComp.SetZoom(SolarSystemZoomRange.x);
	}
	isStarbaseSelected = false;
    
    StarMapGUI.Get().OnPlanetSelected(planet);
}

function OnStarbaseSelected(starbase : GameObject)
{
	print("Camera OnStarbaseSelected starbase=" + starbase);

	TargetArray = new GameObject[1];
	TargetArray[0] = starbase;
	
	if (CurrentZoom > SolarSystemZoomRange.x)
    {
    	cameraComp.SetZoom(SolarSystemZoomRange.x);
    }
    
    var settingsGameObject : GameObject = GameObject.Find("CamSettings_StarBase");
	if (settingsGameObject)
	{
		print("Set CamSettings_Starbase");
		var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
		//settings.itsRoot.itsRoot = starbase;
		settings.Apply();
	}
    isStarbaseSelected = true;
    
    StarMapGUI.Get().OnStarbaseSelected(starbase);
}

function Update() 
{
	UpdateZoom();
}

function GetCurrentZoom() : float
{
	return cameraComp.GetZoomCurrent();
}

function GetTargetZoom() : float
{
	return cameraComp.GetZoom();
}

function UpdateZoom()
{
	if (isStarbaseSelected)
		return;

    if (TargetArray && (TargetArray.Length == 1))
    {
    	CurrentZoom = GetCurrentZoom();
    	//CurrentZoom = Mathf.Clamp(CurrentZoom, SolarSystemZoomRange.x, GalaxyZoomRange.y);

    	if ((CurrentZoom > SolarSystemZoomRange.y) && (GetTargetZoom() > SolarSystemZoomRange.y))
    	{
    		if (StarMap.viewMode == StarMapViewMode.SolarSystem)
    		{
    			print("change to Galaxy CurrentZoom=" + CurrentZoom);
    			/*if (TargetArray[0] != lastStarSelected)
    				OnStarSelected(lastStarSelected);
    			var prevTarget : StarNode = StarMap.FindStarNode(TargetArray[0]);
				StarMap.SetViewMode(StarMapViewMode.Galaxy, prevTarget);*/
			}
    	}
    	else
    	{
    		if (StarMap.viewMode == StarMapViewMode.Galaxy)
    		{
	    		/*var target : StarNode = StarMap.FindStarNode(TargetArray[0]);
				if (target)
				{
				print("change to SolarSystem found target");
					StarMap.SetViewMode(StarMapViewMode.SolarSystem, target);
				}*/
			}
    	}
    }
    else
    {    
    	//CurrentZoom = Mathf.Clamp(CurrentZoom, GalaxyZoomRange.x, GalaxyZoomRange.y);
    }
}

} //StarMapCamera


