#pragma strict

enum StarType
{
	Red,
	Yellow,
	Blue,
	
	NumTypes
}

class StarComponent extends MonoBehaviour
{

var type : StarType;

var starNode : StarNode;

function Start () 
{

}

function FixedUpdate() 
{
	var rotationRate = 12.0 * Time.fixedDeltaTime;
	
	transform.RotateAround(transform.position, Vector3.up, rotationRate);
}

function OnMouseDown()
{
	if (StarMapCamera.Get())
	{
		StarMapCamera.Get().OnStarSelected(gameObject);
	}
}

static private var prefabs : GameObject[] = null;
	
static function InitPrefabs()
{
	if (prefabs)
		return;

	prefabs = new GameObject[StarType.NumTypes];
	
	prefabs[StarType.Red] = Resources.Load("Star_Red") as GameObject;
	prefabs[StarType.Yellow] = Resources.Load("Star_Yellow") as GameObject;
	prefabs[StarType.Blue] = Resources.Load("Star_Blue") as GameObject;
}

static function DestroyPrefabs()
{
	for (var i=0; i<StarType.NumTypes; i++)
	{
		GameObject.Destroy( prefabs[i] );
		prefabs[i] = null;
	}
	prefabs = null;
}

static function Instantiate(type : StarType, pos : Vector3)
{
	var obj : GameObject = GameObject.Instantiate(prefabs[type], pos, Quaternion.identity) as GameObject;
	var size : float = GetSize(type);
	obj.transform.localScale = Vector3(size, size, size);
#if UNITY_IPHONE
    if (obj.collider)
    {
        var sphereCollider : SphereCollider = obj.collider as SphereCollider;
        sphereCollider.radius *= 3.0;
    }
#endif
	return obj;
}

static function RandomType()
{
	var type : StarType = Random.Range(0, StarType.NumTypes);
	return type;
}

static function GetSize(type : StarType)
{
	return 8.0;
}

}