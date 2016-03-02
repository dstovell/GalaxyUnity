#pragma strict

enum WarpType
{
	In,
	Out
}

class WarpComponent extends MonoBehaviour
{

static private var warpDistance : float = 10000.0;
static private var maxScale : float = 100.0;

private var type : WarpType;
private var startPos : Vector3;
private var endPos : Vector3;
private var direction : Vector3;
private var tValue : float;
private var startTime : float;
private var delay : float;


static function WarpIn(obj : GameObject, finalPos : Vector3, direction : Vector3, delay : float)
{
	var warp : WarpComponent = obj.GetComponent(WarpComponent);
	if (!warp)
		warp = obj.AddComponent(WarpComponent);

	warp.type = WarpType.In;
	warp.endPos = finalPos;
	warp.direction = direction.normalized;
	warp.delay = delay;
	
	warp.startPos = finalPos - warp.direction*warpDistance;
	obj.transform.position = warp.startPos;
	
	warp.tValue = 0.0;
}

static function WarpOut(obj : GameObject, direction : Vector3, delay : float)
{
	var warp : WarpComponent = obj.GetComponent(WarpComponent);
	if (!warp)
		warp = obj.AddComponent(WarpComponent);

	warp.type = WarpType.Out;
	warp.startPos = obj.transform.position;
	warp.direction = direction.normalized;	
	warp.endPos = warp.startPos + warp.direction*warpDistance;
	warp.tValue = 0.0;
	warp.delay = delay;
	
	//Debug.Log(obj.name + " WarpOut from [" + warp.startPos.x + "," + warp.startPos.z + "] [" +warp.endPos.x + "," +warp.endPos.z+ "]" );
}

function Start() 
{
	startTime = Time.fixedTime + delay;

	var collider = gameObject.GetComponent(Collider);
	if (collider != null)
	{
		collider.enabled = false;
	}
}

function GetNewT(currentT : float, elapsedTime : float)
{
	var minIncrement : float = 0.0001;
	var increment : float = 0.0;

	if (type == WarpType.In)
	{
		increment = Mathf.Max(0.1*elapsedTime*(1.0 - currentT), minIncrement);
	}
	else
	{
		increment = Mathf.Max(0.1*elapsedTime*currentT, minIncrement);
	}
	
	return Mathf.Min(currentT + increment, 1.0);
}

function GetScale(currentT : float)
{
	//var scale : float = 1.0;
	if (type == WarpType.In)
	{
		return Mathf.Lerp(maxScale, 1.0, currentT);
	}
	else
	{
		//scale = 50.0*currentT + 1.0;
		return Mathf.Lerp(1.0, maxScale, currentT);
	}
	
	//return Mathf.Min(scale, maxScale);
}

function FixedUpdate() 
{
	if (tValue >= 1.0)
		return;

	var elapsedTime : float = Time.fixedTime - startTime;
	if (elapsedTime < 0.0) 
		return;
	
	tValue = GetNewT(tValue, elapsedTime);
	
	var newPos = Vector3.Lerp(startPos, endPos, tValue);
	
	gameObject.transform.LookAt(endPos);
	gameObject.transform.position = newPos;
	
	//var baseScale : float = gameObject.transform.localScale.z;
	//gameObject.transform.localScale = new Vector3(baseScale*GetScale(tValue), baseScale, baseScale);
	
	if (tValue >= 1.0)
	{
		var collider = gameObject.GetComponent(Collider);
		if (collider != null)
		{
			collider.enabled = true;
		}
		Component.Destroy(this);
	}
}

}