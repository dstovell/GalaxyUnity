#pragma strict

class StarBaseGUI extends MonoBehaviour 
{
	private var guiNativeHeight = 480.0;
	private var mButtonHeight = 75;
	private var mUnscaledMatrix : Matrix4x4;

	private static var mInstance : StarBaseGUI;
    static function Get() : StarBaseGUI
    {
    	return mInstance;
    }

	enum MenuState
	{
		None,
		ObjectSelected,
		AddModule,

		NumTypes
	}

	var addModuleIcon : Texture;
	var closeIcon : Texture;
	var upIcon : Texture;
	var downIcon : Texture;

	private var mMenuState : MenuState = MenuState.None;
	private var mLastCameraTarget : GameObject;
	private var mSelectedModuleIndex : int = -1;

	private var mSelectedModule : StarBaseModuleComponent = null;

    function Awake()
    {
    	mInstance = this;
    	mSelectedModuleIndex = -1;
    }

    function OnSelected(obj : GameObject)
    {
    	if (mSelectedModule) mSelectedModule.OnUnSelected();

    	mSelectedModuleIndex = StarBaseComponent.Get().GetModuleIndex(obj);
    	mSelectedModule = obj.GetComponent(StarBaseModuleComponent);
    	if (mSelectedModule) mSelectedModule.OnSelected();
    	mMenuState = MenuState.ObjectSelected;
    }

    function IsBaseSelected() : boolean
    {
    	return ((mMenuState == MenuState.ObjectSelected) && (mSelectedModuleIndex < 0));
    }

    function IsModuleSelected() : boolean
    {
    	return ((mMenuState == MenuState.ObjectSelected) && !IsBaseSelected());
    }
    
    function SelectBase() : boolean
    {
    	OnSelected( StarBaseComponent.Get().gameObject );
    }
    
	function UnSelect() : boolean
    {
    	if (mSelectedModule) mSelectedModule.OnUnSelected();
    
    	mMenuState = MenuState.None;
    	mSelectedModuleIndex = -1;
    	mSelectedModule = null;
    }

    function Update()
    {
    	if (!StarMapGUI.Get())
    	{
    		UpdateCamera();
    	}
    }

    function UpdateCamera()
    {
    	if ((mMenuState == MenuState.ObjectSelected) || (mMenuState == MenuState.AddModule))
    	{
    		var cameraRoot : Transform = StarBaseComponent.Get().GetModuleSlotAtIndex(mSelectedModuleIndex);
    		if (mLastCameraTarget != cameraRoot.gameObject)
			{
				var settingsGameObject : GameObject = GameObject.Find("CamSettings_StarBase");
				if (settingsGameObject)
				{
					var settings : KGFOrbitCamSettings = settingsGameObject.GetComponent(KGFOrbitCamSettings);
					if (settings)
					{
						print("Set CamSettings_Starbase");
						//settings.itsRoot.itsRoot = cameraRoot.gameObject;
						settings.Apply();
						mLastCameraTarget = cameraRoot.gameObject;
					}
				}
			}
    	}
    	else
    	{
    		mLastCameraTarget = null;
    	}
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
    
    	switch(mMenuState)
    	{
    		case MenuState.ObjectSelected:
    			OnObjectSelected();
    			break;
    		case MenuState.AddModule:
    			OnAddModule();
    			break;
    		default:
    			break;
    	}
    	
    	UnscaleGUI();
    }

    function OnObjectSelected()
    {
    	var icon : Texture = null;
    
    	GUILayout.BeginArea( Rect(10,10,200,600) );
    	{
	    	if (IsBaseSelected())
	    	{
		    	if (GUILayout.Button(closeIcon, GUILayout.Height(mButtonHeight)))
				{
					UnSelect();
					if (StarMapCamera.Get())
					{
						StarMapCamera.Get().SelectLastStar();
					}
					else if (LoaderGUI.Get())
					{
						LoaderGUI.Get().menuState = LoaderGUI.MenuState.Main;
						LoaderGUI.Get().ShowCarrier();
					}
					return;
				}
	    		for (var i:int=0; i<StarBaseComponent.Get().GetModuleSlotCount(); i++)
	    		{
	    			var moduleComp : StarBaseModuleComponent = StarBaseComponent.Get().GetModuleAtIndex(i);
	    			if (moduleComp)
	    			{
	    				//Button allowing user to select module i
	    				icon = moduleComp.GetIcon(); 
	    				
						//GUILayout.Button(mSelectedModule.GetName(), GUILayout.Height(mButtonHeight));
						if (GUILayout.Button(icon, GUILayout.Height(mButtonHeight)))
						{
							OnSelected(moduleComp.gameObject);
			    		}
	    			}
	    		}

	    		var openSlotCount : int = StarBaseComponent.Get().GetModuleSlotCount() - StarBaseComponent.Get().GetModuleCount();
	    		if (openSlotCount > 0)
	    		{
		    		if (GUILayout.Button(addModuleIcon, GUILayout.Height(mButtonHeight)))
					{
		    			mMenuState = MenuState.AddModule;
		    		}
	    		}
	    	
    		}
    		else if (IsModuleSelected())
    		{
	    		//Close
	    		if (GUILayout.Button(closeIcon, GUILayout.Height(mButtonHeight)))
				{
					mMenuState = MenuState.ObjectSelected;
					SelectBase();
					return;
				}
				
				icon = mSelectedModule.GetIcon(); 
				
				if (icon)
					GUILayout.Box(icon, GUILayout.Height(mButtonHeight));
				else
					GUILayout.Box(mSelectedModule.GetName(), GUILayout.Height(mButtonHeight));

				GUILayout.Space(32);
				GUILayout.Box("Move:", GUILayout.Height(mButtonHeight));
	    		if (StarBaseComponent.Get().CanMoveModuleUp(mSelectedModule))
	    		{
	    			if (GUILayout.Button(upIcon, GUILayout.Height(mButtonHeight)))
					{
						StarBaseComponent.Get().MoveModuleUp( mSelectedModule );
						OnSelected( mSelectedModule.gameObject );
					}
	    		}

	    		//Module functions

	    		if (StarBaseComponent.Get().CanMoveModuleDown(mSelectedModule))
	    		{
	    			if (GUILayout.Button(downIcon, GUILayout.Height(mButtonHeight)))
					{
						StarBaseComponent.Get().MoveModuleDown( mSelectedModule );
						OnSelected( mSelectedModule.gameObject );
					}
	    		}
    		}
    	}
    	GUILayout.EndArea();
    }

    function OnAddModule()
    {
    	GUILayout.BeginArea( Rect(10,10,200,600) );
    	{
	    	//Close
	    	if (GUILayout.Button(closeIcon, GUILayout.Height(mButtonHeight)))
			{
				mMenuState = MenuState.ObjectSelected;
				SelectBase();
				return;
			}

	    	//Loop through all the module definitions in the ConfigTool here
	    	for (var i=0; i<ConfigTool.GetCombatantConfigCount(); i++)
			{
				if (ConfigTool.GetCombatantConfig(i)["Type"].Value == "StationModule")
				{
					var config : JSONNode = ConfigTool.GetCombatantConfig(i);
					if (GUILayout.Button(Resources.Load(config["HudArt"]) as Texture, GUILayout.Height(mButtonHeight)))
					{
						StarBaseComponent.Get().SpawnModule( config["Name"] );
					}
				}
			}
	    }
	    GUILayout.EndArea();
    }

 } //