#pragma strict


class StrategyCamera extends MonoBehaviour
{

var ZoomRange:Vector2 = Vector2(0.5,2);
var CurrentZoom:float = 1;
var ZoomSpeed:float = 0.2;
var ZoomRotation:float = 0.05;

var TargetArray:GameObject[];
var CameraVector:Vector3;

private var InitPos:Vector3;
private var InitRotation:Vector3;

private var InputRotation:float;

private var ActionTarget:GameObject;
private var HoldActionTargetTime : float = 0;
var distance = 20.0;
var height = 5.0;
var heightDamping = 2.0;
var rotationDamping = 3.0;
var currentRotation : Quaternion;
var currentRotationAngle : float;
var wantedRotationAngle : float;
var wantedHeight : float;
var currentHeight : float;

private static var mInstance : StrategyCamera;
static function Get()
{
	return mInstance;
}

function Awake()
{
	mInstance = this;
}

function Start()
{
	InitPos = transform.position;
    InitRotation = transform.eulerAngles;
    
    InputRotation = 0.0;

    ActionTarget = null;
}

function FixedUpdate() 
{
	if (CombatManager.Get().IsBattleOver())
		return;

	if (false)
	{
		UpdateActionSelectionCamera();
	}
	else
	{
		UpdateActionResolveCamera();
	}
}

function UpdateActionResolveCamera()
{
	Time.timeScale = 1.0;

	UpdateInput();

	var cameraTargets = 0;
	var targetCenter = Vector3(0,0,0);
	for (var i=0; i<TargetArray.length; i++)
	{
		var combatComp = TargetArray[i].GetComponent(CombatComponent);
		if (!combatComp.IsDead())
		{
			targetCenter += TargetArray[i].transform.position;
			cameraTargets++;
		}
	}
	
	if (cameraTargets == 0)
		return;
	
	targetCenter = targetCenter / cameraTargets;
	
	//Zoom
    CurrentZoom -= Input.GetAxis("Mouse ScrollWheel") * Time.fixedDeltaTime * 1000 * ZoomSpeed;
    if (Input.touchCount == 2)
    {
        var touch1 : Touch = Input.GetTouch(0);
        var touch2 : Touch = Input.GetTouch(1);
        var curDist : Vector2 = touch1.position - touch2.position;
        var prevDist : Vector2 = (touch1.position - touch1.deltaPosition) - (touch2.position - touch2.deltaPosition);
        var delta : float = curDist.magnitude - prevDist.magnitude;
        if (delta > 10)
        {
            CurrentZoom -= delta * Time.fixedDeltaTime; 
        }
        else if (delta < -10)
        {
            CurrentZoom -= delta * Time.fixedDeltaTime; 
        }
    }
    CurrentZoom = Mathf.Clamp(CurrentZoom,ZoomRange.x,ZoomRange.y);
    
    if ((Input.touchCount == 1) && (Input.GetTouch(0).phase == TouchPhase.Moved))
	{
		//if (HudGUI.Get().GetHudState() != HudGUI.HudState.Move)
		if (false)
		{
			// Get movement of the finger since last frame
			var touchDeltaPosition:Vector2 = Input.GetTouch(0).deltaPosition;
			
			InputRotation += touchDeltaPosition.x * 0.1;
		}
	}
	
	var cameraDesiredPos = targetCenter + CurrentZoom*CameraVector;
	
	transform.position = cameraDesiredPos;
	transform.RotateAround(targetCenter,  Vector3.up, InputRotation);
	transform.LookAt(targetCenter);
}

function UpdateHighlightCamera() 
{
    // Early out if we don't have a target
    if (!ActionTarget.transform)
        return;
 
    // Calculate the current rotation angles
    wantedRotationAngle = ActionTarget.transform.eulerAngles.y;
    wantedHeight = ActionTarget.transform.position.y + height;
 
    currentRotationAngle = transform.eulerAngles.y;
    currentHeight = transform.position.y;
 
    // Damp the rotation around the y-axis
    currentRotationAngle = Mathf.LerpAngle (currentRotationAngle, wantedRotationAngle, rotationDamping * Time.fixedDeltaTime);
 
    // Damp the height
    currentHeight = Mathf.Lerp (currentHeight, wantedHeight, heightDamping * Time.fixedDeltaTime);
 
    // Convert the angle into a rotation
    currentRotation = Quaternion.Euler (0, currentRotationAngle, 0);
 
    // Set the position of the camera on the x-z plane to:
    // distance meters behind the target
    transform.position = ActionTarget.transform.position;
    transform.position -= currentRotation * Vector3.forward * distance;
 
    // Set the height of the camera
    transform.position.y = currentHeight;
 
    // Always look at the target
    transform.LookAt (ActionTarget.transform);
}

function UpdateActionSelectionCamera()
{
	Time.timeScale = 1.0;

	UpdateInput();

	var cameraTargets = 0;
	var targetCenter = Vector3(0,0,0);
	for (var i=0; i<TargetArray.length; i++)
	{
		var combatComp = TargetArray[i].GetComponent(CombatComponent);
		if (!combatComp.IsDead())
		{
			targetCenter += TargetArray[i].transform.position;
			cameraTargets++;
		}
	}
	
	if (cameraTargets == 0)
		return;
	
	targetCenter = targetCenter / cameraTargets;
	
	//Zoom
    CurrentZoom -= Input.GetAxis("Mouse ScrollWheel") * Time.fixedDeltaTime * 1000 * ZoomSpeed;
    if (Input.touchCount == 2)
    {
        var touch1 : Touch = Input.GetTouch(0);
        var touch2 : Touch = Input.GetTouch(1);
        var curDist : Vector2 = touch1.position - touch2.position;
        var prevDist : Vector2 = (touch1.position - touch1.deltaPosition) - (touch2.position - touch2.deltaPosition);
        var delta : float = curDist.magnitude - prevDist.magnitude;
        if (delta > 10)
        {
            CurrentZoom -= delta * Time.fixedDeltaTime; 
        }
        else if (delta < -10)
        {
            CurrentZoom -= delta * Time.fixedDeltaTime; 
        }
    }
    CurrentZoom = Mathf.Clamp(CurrentZoom,ZoomRange.x,ZoomRange.y);
    
    if ((Input.touchCount == 1) && (Input.GetTouch(0).phase == TouchPhase.Moved))
	{
		//if (HudGUI.Get().GetHudState() != HudGUI.HudState.Move)
		if (false)
		{
			// Get movement of the finger since last frame
			var touchDeltaPosition:Vector2 = Input.GetTouch(0).deltaPosition;
			
			InputRotation += touchDeltaPosition.x * 0.1;
		}
	}
	
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
}

function OnTurnBegin(teamCameraVector : Vector3)
{
	InputRotation = 0;
	
	CameraVector = teamCameraVector;
}

}