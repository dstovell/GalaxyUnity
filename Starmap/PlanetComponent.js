#pragma strict

enum PlanetType
{
	Volcanic,
	Arid,
	EarthLike,
	Frozen,
	GasGiant,	
	
	NumTypes
}

class PlanetComponent extends MonoBehaviour
{

var type : PlanetType;

var planetNode : PlanetNode;

function Start () 
{

}

function FixedUpdate() 
{
	var rotationRate = -4.0 * Time.fixedDeltaTime;
	
	transform.RotateAround(transform.position, Vector3.up, rotationRate);
}

function OnMouseDown()
{
	if (StarMapCamera.Get())
	{
		if (planetNode.HasStarBase() && StarBaseComponent.Get())
			StarMapCamera.Get().OnStarbaseSelected(StarBaseComponent.Get().gameObject);
		else
			StarMapCamera.Get().OnPlanetSelected(gameObject);
	}
}

static private var maxPrefabsOfType : int = 10;
static private var prefabCount : int[] = null;
static private var prefabs : GameObject[,] = null;

static function GetPrefabName(type : PlanetType, index : int)
{
	var oneBasedIndex : int = index + 1; 
	switch(type)
	{
		case PlanetType.Volcanic: return "Planet_Volcanic_" + oneBasedIndex;
		case PlanetType.Arid: return "Planet_Arid_" + oneBasedIndex;
		case PlanetType.EarthLike: return "Planet_EarthLike_" + oneBasedIndex;
		case PlanetType.Frozen: return "Planet_Frozen_" + oneBasedIndex;
		case PlanetType.GasGiant: return "Planet_GasGiant_" + oneBasedIndex;
	}
	return "";
}

static function GetRandomPrefabIndex(type : PlanetType)
{
	return Random.Range(0, prefabCount[type]-1);
}
	
static function InitPrefabs()
{
	if (prefabs)
		return;
		
	if (!prefabCount)
	{
		prefabCount = new int[PlanetType.NumTypes];
		prefabCount[PlanetType.Volcanic] = 3;
		prefabCount[PlanetType.Arid] = 3;
		prefabCount[PlanetType.EarthLike] = 1;
		prefabCount[PlanetType.Frozen] = 2;
		prefabCount[PlanetType.GasGiant] = 5;
		
		for (var k=0; k<PlanetType.NumTypes; k++)
		{
			if (prefabCount[k] > maxPrefabsOfType)
				prefabCount[k] = maxPrefabsOfType;
		}
	}
	
	prefabs = new GameObject[PlanetType.NumTypes, maxPrefabsOfType];
	
	for (var i=0; i<PlanetType.NumTypes; i++)
	{
		if (prefabCount[i] > maxPrefabsOfType)
			prefabCount[i] = maxPrefabsOfType;
	
		for (var j=0; j<prefabCount[i]; j++)
		{
			prefabs[i,j] = Resources.Load( GetPrefabName(i, j) ) as GameObject;
			//Debug.Log("InitPrefabs ["+i+","+j+"] name="+GetPrefabName(i, j) + " prefab=" + prefabs[i,j]);
		}
	}
}

static function DestroyPrefabs()
{
	for (var i=0; i<PlanetType.NumTypes; i++)
	{
		for (var j=0; j<prefabCount[i]; j++)
		{
			GameObject.Destroy( prefabs[i,j] );
			prefabs[i,j] = null;
		}
	}
	prefabs = null;
}

static function Instantiate(type : PlanetType, prefabIndex : int, pos : Vector3, node : PlanetNode)
{
	//Debug.Log("PlanetComponent.Instantiate name=" + GetPrefabName(type, prefabIndex));

	var obj : GameObject = GameObject.Instantiate(prefabs[type,prefabIndex], pos, Quaternion.identity) as GameObject;
	var planetComp = obj.GetComponent(PlanetComponent);
	var size : float = GetSize(type);
	obj.transform.localScale = Vector3(size, size, size);
	planetComp.planetNode = node;
#if UNITY_IPHONE
    if (obj.collider)
    {
        var sphereCollider : SphereCollider = obj.collider as SphereCollider;
        sphereCollider.radius *= 2.0;
    }
#endif
	return obj;
}

static function RandomType()
{
	var type : PlanetType = Random.Range(0, PlanetType.NumTypes);
	return type;
}

static function GetSize(type : PlanetType)
{
	switch(type)
	{
		case PlanetType.Volcanic: return 2.5;
		case PlanetType.Arid: return 2.5;
		case PlanetType.EarthLike: return 3.5;
		case PlanetType.Frozen: return 2.5;
		case PlanetType.GasGiant: return 5.0; 
	}
	return 1.0;
}

static function GetTypeName(type : PlanetType)
{
	switch(type)
	{
		case PlanetType.Volcanic: return "Volcanic";
		case PlanetType.Arid: return "Arid";
		case PlanetType.EarthLike: return "Temperate";
		case PlanetType.Frozen: return "Frozen";
		case PlanetType.GasGiant: return "Gas Giant";
	}
	return "";
}

static function GetText(type : PlanetType)
{
	switch(type)
	{
		case PlanetType.Volcanic: return "A wasteland interspersed with slab-like rocks and periodically refreshed by volcanism.";
		case PlanetType.Arid: return "A dry desertscape, filled with high dunes.";
		case PlanetType.EarthLike: return "Largely covered by oceans and fresh water with ample native life forms.";
		case PlanetType.Frozen: return "A desolate world covered with ice and snow.";
		case PlanetType.GasGiant: return "A massive ball of hydrogen and helium with rings rich in heavy minerals.";
	}
	return "";
}

}