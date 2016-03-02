#pragma strict

class StarBaseComponent extends MonoBehaviour 
{
    private static var mInstance : StarBaseComponent;
    static function Get() : StarBaseComponent
    {
    	return mInstance;
    }

    private var mModules : StarBaseModuleComponent[];
    private var mModuleSlots : Transform[];

	function Awake()
	{
		mInstance = this;
		InitModuleSlots();
		mModules = new StarBaseModuleComponent[mModuleSlots.Length];
	}

	function InitModuleSlots()
	{
		var i : int = 0;
		var moduleCount : int = 0;
		for(i=0; i<transform.childCount;i++)
		{
			if (transform.GetChild(i).gameObject.name == "ModuleSlot")
			{
				moduleCount++;
			}
		}

		mModuleSlots = new Transform[moduleCount];
		var moduleCountIndex : int = 0;
		for(i=0; i<transform.childCount;i++)
		{
			if (transform.GetChild(i).gameObject.name == "ModuleSlot")
			{
				mModuleSlots[moduleCountIndex] = transform.GetChild(i);
				moduleCountIndex++;
			}
		}
	}

	function GetModuleSlotCount() : int
	{
		if (mModuleSlots)
			return mModuleSlots.Length;
		return 0;
	}

	function SpawnModule(name : String)
	{
		//Look in the ConfigTool here
		var config : JSONNode = ConfigTool.GetCombatantConfigByName(name);
		if (config)
		{
			print("SpawnModule module_prefab=" + config["Model"]);
			var newObj : GameObject = GameObject.Instantiate(Resources.Load(config["Model"])) as GameObject;
			newObj.transform.localScale = transform.lossyScale;
			newObj.transform.parent = transform;
			var moduleComp : StarBaseModuleComponent = newObj.GetComponent(StarBaseModuleComponent);
			var combatant : CombatantComponent = newObj.GetComponent(CombatantComponent);
			if (combatant)
				combatant.SetConfig( config );
			AddModule(moduleComp);
		}
	}

	function AddModule(module : StarBaseModuleComponent)
	{
		var addIndex : int = -1;
		for(var i=0; i<mModules.Length;i++)
		{
			if (mModules[i] == null)
			{
				addIndex = i;
				mModules[i] = module;
				break;
			}
		}

		if (addIndex < 0)
			return;

		module.Setup(this, mModuleSlots[addIndex].position, Quaternion.Euler(0.0, Random.Range(0.0, 359.0), 0.0));
	}

	function GetModuleCount() : int
	{
		var moduleCount : int = 0;
		for(var i=0; i<mModules.Length;i++)
		{
			if (mModules[i] != null)
				moduleCount++;
		}
		return moduleCount;
	}

	function GetModuleIndex(obj : GameObject) : int
	{
		if (obj == gameObject)
			return -1;

		for(var i=0; i<mModules.Length;i++)
		{
			if (mModules[i].gameObject == obj)
				return i;
		}
		return -1;
	}

	function GetModuleIndex(module : StarBaseModuleComponent) : int
	{
		for(var i=0; i<mModules.Length;i++)
		{
			if (mModules[i] == module)
				return i;
		}
		return -1;
	}

	function GetModuleSlotAtIndex(index : int) : Transform
	{
		if (index == -1)
			return transform;

		if ((index >=0) && (index < mModuleSlots.Length))
			return mModuleSlots[index];

		return null;
	}

	function GetModuleAtIndex(index : int) : StarBaseModuleComponent
	{
		if ((index >=0) && (index < mModules.Length))
			return mModules[index];

		return null;
	}

	function CanMoveModuleUp(module : StarBaseModuleComponent) : boolean
	{
		var index : int = GetModuleIndex(module);
		return (index > 0);
	}

	function MoveModuleUp(module : StarBaseModuleComponent)
	{
		var index : int = GetModuleIndex(module);
		if (index > 0)
		{
			SwapModules(index, index-1);
		}
	}

	function CanMoveModuleDown(module : StarBaseModuleComponent) : boolean
	{
		var index : int = GetModuleIndex(module);
		return ((index != -1) && (index < (mModuleSlots.Length+1)));
	}

	function MoveModuleDown(module : StarBaseModuleComponent)
	{
		var index : int = GetModuleIndex(module);
		if ((index != -1) && (index < (mModuleSlots.Length+1)))
		{
			SwapModules(index, index+1);
		}
	}

	private function SwapModules(indexA : int, indexB : int)
	{
		var moduleA : StarBaseModuleComponent = mModules[indexA];
		var moduleB : StarBaseModuleComponent = mModules[indexB];

		mModules[indexA] = moduleB;
		if (moduleB) moduleB.MoveTo(mModuleSlots[indexA].localPosition);

		mModules[indexB] = moduleA;
		if (moduleA) moduleA.MoveTo(mModuleSlots[indexB].localPosition);
	}

	function OnMouseDown() 
    {
        StarBaseGUI.Get().OnSelected(gameObject);
    }
}