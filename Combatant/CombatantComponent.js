#pragma strict

import SimpleJSON;

class CombatantComponent extends MonoBehaviour
{

var mConfigName : String;
var mCombatantConfig : JSONNode;
var mComponentConfigs : List.<JSONNode>;

var mCombatComp : CombatComponent;

var mCombatantIcon : Texture;

//eventually this will be a property of the weapon itself
var mWeaponIcon : Texture;

function Awake()
{
	mCombatComp = GetComponent(CombatComponent);
	
	if (mConfigName && (mCombatantConfig == null))
	{
		var config : JSONNode = ConfigTool.GetCombatantConfigByName(mConfigName);
		if (!config)
		{
			config =  ConfigTool.GetCombatantConfigByPrefabName(gameObject.name);
		}
		
		if (config)
		{
			SetConfig(config);
		}
		else
		{	
			var configJSON : TextAsset = Resources.Load(mConfigName) as TextAsset;
			if (configJSON)
				mCombatantConfig = JSON.Parse(configJSON.text);
		}
	}
}

function Start () 
{
    if (mCombatantConfig["HudArt"] != null)
    	mCombatantIcon = Resources.Load(mCombatantConfig["HudArt"]);
    
    OnTurnBegin();
}

function Update() 
{
	
}

function OnTurnBegin()
{
}

function OnTurnEnd()
{
}

function GetMaxMove()
{
	return mCombatantConfig["MaxMovementDistance"].AsInt;
}

function GetMaxSpeed() : float
{
	var maxMove : int = GetMaxMove();
	var maxSpeed : float = maxMove * 15.0;

	return maxSpeed;
}

function GetCombatantType() : String
{
	if (mCombatantConfig)
	{
		if (mCombatantConfig["Type"] != null)
		{
			return mCombatantConfig["Type"].Value;
		}
	}
	
	return "";
}

function IsMilitary() : boolean
{
	var type : String = GetCombatantType();
	if ((type == "Fighter") || (type == "Corvette") || (type == "Frigate") || (type == "Destroyer") || (type == "Carrier") || (type == "Turret"))
		return true;
	return false;
}

function SetConfig(config : JSONNode)
{
	mCombatantConfig = config;
	AddDefaultComponentConfigs();
}

function AddDefaultComponentConfigs()
{
	if ((mCombatantConfig["DefaultComponents"] != null))
	{
		var componentCSV : String = mCombatantConfig["DefaultComponents"].Value;
		var split : String[] = componentCSV.Split(","[0]);
		for(var s in split)
		{	
			AddComponentConfig( ConfigTool.GetComponentConfigByName(s) );
		}
	}
}

function AddComponentConfig(config : JSONNode)
{
	if (config == null)
		return;

	if (mComponentConfigs == null)
	{
		mComponentConfigs = new List.<JSONNode>();
	}
	
	//print("[AddComponentConfig] [" + config["Category"] + "][" + config["Name"] + "] to " + gameObject.name);
	
	mComponentConfigs.Add(config);
}

function ClearComponentConfigs()
{
	if (mComponentConfigs)
	{
		mComponentConfigs.Clear();
	}
}

}