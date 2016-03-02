#pragma strict

class TurretComponent extends MonoBehaviour
{

var horizontalAimObjects : GameObject[];
var verticalAimObjects : GameObject[];

private var mAimSpeed : float = 2.0;
var mAimTarget : GameObject;
private var mAngleFromTarget : float = 0;
private var mDefaultForward : Vector3;

function Start() 
{
	mDefaultForward = transform.forward;
}

function SetAimTarget(obj : GameObject)
{
	if (mAimTarget != obj)
	{
		mAimTarget = obj;
		mAngleFromTarget = 180.0;
	}
}

function ClearAimTarget()
{
	mAimTarget = null;
}

function Update() 
{
	if (!mAimTarget)
		return;

	var i : int = 0;
	var obj : GameObject = null;
	var remainingAngleTotal : float = 0;
	var targetAim : Vector3 = Vector3.zero;
	
	if (horizontalAimObjects)
	{
		for (i=0; i<horizontalAimObjects.Length; i++)
		{
			obj = horizontalAimObjects[i];
			targetAim = GetHorizontalTargetAimVector(obj);
			remainingAngleTotal += MoveTowards(obj, targetAim);
		}
	}
	
	/*if (verticalAimObjects)
	{
		for (i=0; i<verticalAimObjects.Length; i++)
		{
			obj = verticalAimObjects[i];
			targetAim = GetVerticalTargetAimVector(obj);
			remainingAngleTotal += MoveTowards(obj, targetAim);
		}
	}*/
	
	mAngleFromTarget = remainingAngleTotal;
}

function IsAtAimTarget() : boolean
{
	return (mAimTarget && (mAngleFromTarget < 1.0));
}

private function MoveTowards(aimObj : GameObject, targetAim : Vector3) : float
{
	var step : float = mAimSpeed * Time.deltaTime;
	var newDir : Vector3 = Vector3.RotateTowards(aimObj.transform.forward, targetAim, step, 0.0);
	aimObj.transform.rotation = Quaternion.LookRotation(newDir);
	var angleRemaining : float = Vector3.Angle(aimObj.transform.forward, targetAim);
	return angleRemaining;
}

private function GetTargetAimVector(aimObj : GameObject) : Vector3
{
	if (mAimTarget)
	{
		var targetDir : Vector3 = mAimTarget.transform.position - aimObj.transform.position;
		return targetDir;
	}
	
	return mDefaultForward;
}

private function GetHorizontalTargetAimVector(aimObj : GameObject) : Vector3
{
	var targetDir : Vector3 = GetTargetAimVector(aimObj);
	targetDir.y = 0.0;
	return targetDir;
}

private function GetVerticalTargetAimVector(aimObj : GameObject) : Vector3
{
	var targetDir : Vector3 = GetTargetAimVector(aimObj);
	targetDir.x = 0.0;
	return targetDir;
}

} //TurretComponent