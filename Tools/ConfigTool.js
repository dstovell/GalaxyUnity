#pragma strict

import SimpleJSON;

class ConfigNode
{
	var name : String;
	var json : JSONNode;
}

static class ConfigTool extends MonoBehaviour
{

private var mCombatantDefault : TextAsset;
private var mComponentDefault : TextAsset;

private var mCombatantConfigs : List.<ConfigNode>;
private var mComponentConfigs : List.<ConfigNode>;

function Init()
{
	mCombatantConfigs = new List.<ConfigNode>();
	mComponentConfigs = new List.<ConfigNode>();
	
	mCombatantDefault = Resources.Load("CombatantsDefault") as TextAsset;
	mComponentDefault = Resources.Load("ComponentsDefault") as TextAsset;
}

function FetchCombatantConfigs() : IEnumerator
{
	var url : String = WebTool.mBaseUrl + "/i/combatants";
	
	var webRequest : WWW = new WWW(url);
	
	yield webRequest;
	
	if (webRequest.error || (webRequest.text == "[]"))
	{
		Debug.Log("FetchCombatantConfigs failed, using local default");
		StoreConfigs(mCombatantConfigs, mCombatantDefault.text);
	}
	else
	{
		StoreConfigs(mCombatantConfigs, webRequest.text);
	}
}

function FetchComponentConfigs() : IEnumerator
{
	var url : String = WebTool.mBaseUrl + "/i/components";
	
	var webRequest : WWW = new WWW(url);
	
	yield webRequest;
	
	if (webRequest.error || (webRequest.text == "[]"))
	{
		Debug.Log("FetchComponentConfigs failed, using local default");
		StoreConfigs(mComponentConfigs, mComponentDefault.text);
	}
	else
	{
		StoreConfigs(mComponentConfigs, webRequest.text);
	}
}

private function StoreConfigs(configs : List.<ConfigNode>, json : String) : void
{
	Debug.Log("StoreConfigs json["+json+"]");
	
	var nodes : JSONNode = JSON.Parse(json);
	
	for (var i=0; i<nodes.Count; i++)
	{
		var newNode : ConfigNode = new ConfigNode();
		newNode.name = nodes[i]["Name"];
		newNode.json = nodes[i];
		
		Debug.Log("StoreConfig name["+newNode.name+"]");
		
		configs.Add(newNode);
	}
}

function GetCombatantConfigCount() : int
{
	if (mCombatantConfigs)
		return mCombatantConfigs.Count;
	else
		return 0;
}

function GetCombatantConfig(index : int) : JSONNode
{
	if ((index >= 0) && (index < mCombatantConfigs.Count))
	{
		return mCombatantConfigs[index].json;
	}
	
	return null;
}

function GetCombatantConfigByName(name : String) : JSONNode
{
	for (var i=0; i<mCombatantConfigs.Count; i++)
	{
		if (mCombatantConfigs[i].json && (mCombatantConfigs[i].json["Name"].Value == name))
		{
			return mCombatantConfigs[i].json;
		}
	}
	
	return null;
}

function GetCombatantConfigByPrefabName(name : String) : JSONNode
{
	for (var i=0; i<mCombatantConfigs.Count; i++)
	{
		if (mCombatantConfigs[i].json && (mCombatantConfigs[i].json["Model"].Value == name))
		{
			return mCombatantConfigs[i].json;
		}
	}
	
	return null;
}

function GetComponentConfigCount() : int
{
	if (mComponentConfigs)
		return mComponentConfigs.Count;
	else
		return 0;
}

function GetComponentConfig(index : int) : JSONNode
{
	if ((index >= 0) && (index < mComponentConfigs.Count))
	{
		return mComponentConfigs[index].json;
	}
	
	return null;
}

function GetComponentConfigByName(name : String) : JSONNode
{
	for (var i=0; i<mComponentConfigs.Count; i++)
	{
		if (mComponentConfigs[i].json && (mComponentConfigs[i].json["Name"].Value == name))
		{
			return mComponentConfigs[i].json;
		}
	}
	
	return null;
}

} //ConfigTool