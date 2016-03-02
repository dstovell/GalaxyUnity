#pragma strict

class LoaderCamera extends MonoBehaviour
{

var ZoomRange:Vector2 = Vector2(0.5,2);
var CurrentZoom:float = 1;
var ZoomSpeed:float = 0.05;
var ZoomRotation:float = 0.05;

var TargetArray:GameObject[];
var CameraVector:Vector3;

private var InitPos:Vector3;
private var InitRotation:Vector3;

private var InputRotation:float;

private static var mInstance : LoaderCamera;
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
	InitPos = transform.position;
    InitRotation = transform.eulerAngles;
    
    InputRotation = 0.0;
    
    SendMessage("InitForTeam", "Team1");
    //InitForAll();
}

function InitForAll()
{
	TargetArray = GameObject.FindGameObjectsWithTag("Spawn_Point");
}

function InitForTeam(teamTag : String)
{
	var spawnComp : SpawnPointComponent;
	var teamSpawnPointCount : int = 0;
	var spawnPoints : GameObject[] = GameObject.FindGameObjectsWithTag("Spawn_Point");
	var i : int;
	
	for (i=0; i<spawnPoints.length; i++)
	{
		spawnComp = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp.teamToSpawn == teamTag)
		{
			teamSpawnPointCount++;
		}
	}
	
	var spawnIndex : int = 0;
	TargetArray = new GameObject[teamSpawnPointCount];
	for (i=0; i<spawnPoints.length; i++)
	{
		spawnComp = spawnPoints[i].GetComponent(SpawnPointComponent);
		if (spawnComp.teamToSpawn == teamTag)
		{
			TargetArray[spawnIndex] = spawnPoints[i];
			spawnIndex++;
		}
	}
}

function Update() 
{
	UpdateInput();

	var cameraTargets = 0;
	var targetCenter = Vector3(0,0,0);
	for (var i=0; i<TargetArray.length; i++)
	{
		targetCenter += TargetArray[i].transform.position;
		cameraTargets++;
	}
	targetCenter = targetCenter / cameraTargets;
	
	//Zoom
    CurrentZoom -= Input.GetAxis("Mouse ScrollWheel") * Time.deltaTime * 1000 * ZoomSpeed;
    CurrentZoom = Mathf.Clamp(CurrentZoom,ZoomRange.x,ZoomRange.y);
    
	var cameraDesiredPos = targetCenter + CurrentZoom*CameraVector;
	
	transform.position = cameraDesiredPos;
	transform.RotateAround(targetCenter,  Vector3.up, InputRotation);
	transform.LookAt(targetCenter);
}

function UpdateInput()
{
	if (Input.GetKey(KeyCode.A))
	{
		InputRotation += 3.0;
	}
	else if (Input.GetKey(KeyCode.D))
	{
		InputRotation -= 3.0;
	}
	
	if ((Input.touchCount == 1) && (Input.GetTouch(0).phase == TouchPhase.Moved))
	{
		// Get movement of the finger since last frame
		var touchDeltaPosition:Vector2 = Input.GetTouch(0).deltaPosition;
		InputRotation += touchDeltaPosition.x * 0.1;
	}
}

} //LoaderCamera


