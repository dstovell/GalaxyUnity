#pragma strict

class DockedCombatantNode
{
	var combatantNode : CombatantNode;
	var isLaunched : boolean = false;
	var isReadyForLaunch : boolean = false;
	var obj : GameObject;
}

class LaunchPath
{
	var docked : Transform;
	var launched : Transform;
}

class HangerComponent extends MonoBehaviour
{

var launchPaths : LaunchPath[]; 

private var mLaunchTimer : float = 0.0;
private var mLaunchInterval : float = 0.5;
private var mLastLaunchPath : int = -1;

private var mDockedCombatants : List.<DockedCombatantNode>;

function Awake()
{
	mDockedCombatants = new List.<DockedCombatantNode>();
}

function Start() 
{
}

function AddCombatant(configName : String)
{
	var node : CombatantNode = new CombatantNode();
	node.configName = configName;
	
	AddCombatant(node);
}

function AddCombatant(node : CombatantNode)
{
	var dockedCombatant : DockedCombatantNode = new DockedCombatantNode();
	dockedCombatant.combatantNode = node;

	mDockedCombatants.Add(dockedCombatant);
}

function QueueLaunchAll()
{
	for (var i=0; i<mDockedCombatants.Count; i++)
	{
		if (!mDockedCombatants[i].isLaunched)
		{
			mDockedCombatants[i].isReadyForLaunch = true;
		}
	}
}

function AvailableForLaunch()
{
	for (var i=0; i<mDockedCombatants.Count; i++)
	{
		if (!mDockedCombatants[i].isLaunched && !mDockedCombatants[i].isReadyForLaunch)
		{
			return true;
		}
	}
	return false;
}

function Launch(combatant : DockedCombatantNode)
{
	var config : JSONNode = ConfigTool.GetCombatantConfigByName(combatant.combatantNode.configName);
	if (!config)
	{
		combatant.isReadyForLaunch = false;
		return;
	}
	
	var launchPathToUse : int = mLastLaunchPath+1;
	if (launchPathToUse >= launchPaths.Length)
		launchPathToUse = 0;

	var path : LaunchPath = launchPaths[launchPathToUse];
	mLastLaunchPath = launchPathToUse;
	
	combatant.obj = GameObject.Instantiate(Resources.Load(config["Model"]), path.docked.position, path.docked.rotation) as GameObject;
	combatant.obj.tag = gameObject.tag;
	
	if (CombatManager.Get())
	{
		CombatManager.Get().UpdateTeams();
	}
	
	combatant.isReadyForLaunch = false;
	combatant.isLaunched = true;
	
	mLaunchTimer = mLaunchInterval;
}

function IsLaunching()
{
	for (var i=0; i<mDockedCombatants.Count; i++)
	{
		if (!mDockedCombatants[i].isLaunched)
		{
			print("IsLaunching name="+gameObject.name);
			return true;
		}
	}
	return false;
}

function Update()
{
	if (mLaunchTimer > 0.0)
	{
		mLaunchTimer -= Time.deltaTime;
		return;
	}

	for (var i=0; i<mDockedCombatants.Count; i++)
	{
		if (mDockedCombatants[i].isReadyForLaunch && !mDockedCombatants[i].isLaunched)
		{
			Launch(mDockedCombatants[i]);
			break;
		}
	}
}

} //HangerComponent