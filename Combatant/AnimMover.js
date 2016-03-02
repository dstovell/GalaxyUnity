#pragma strict

class AnimMover extends MonoBehaviour
{

public var moveSplinePoints : Transform[];
public var waitToStart : float = 0.0; 
public var endPointWaitTime : float = 0.0;
public var outAndBack : boolean = false;
public var speed : float = 3.0; 

private var mCurrentWayPoint : int;
private var mMovingBack : boolean;
private var mWaitTimer : float;
private var mRigidbodyMover : RigidbodyMover;

function Awake()
{
	mRigidbodyMover = gameObject.GetComponent(RigidbodyMover);
	
	mCurrentWayPoint = 0;
	mMovingBack = false;
	mWaitTimer = waitToStart;
}

function Start() 
{
	setIdle();
}

function IsMoving()
{
	return mRigidbodyMover.IsMoving();
}

function GetCurrentMoveWaypoint()
{
	return moveSplinePoints[mCurrentWayPoint].position;
}

function GetDistanceToCurrentMoveWaypoint()
{
	return Vector3.Distance(transform.position, GetCurrentMoveWaypoint());
}

function IsLastMoveWaypoint()
{
	if (mMovingBack)
		return (mCurrentWayPoint == 0);
	else
		return (mCurrentWayPoint >= (moveSplinePoints.Length-1));
}

function GetMoveVector()
{
	var dir : Vector3 = (GetCurrentMoveWaypoint() - transform.position).normalized;
	var vectorLength : float = speed;

	/*if (IsLastMoveWaypoint())
	{
		//Make sure we don't over shoot the waypoint
		var dist = GetDistanceToCurrentMoveWaypoint();
		if (vectorLength*Time.fixedDeltaTime > dist)
			vectorLength = dist * (1/Time.fixedDeltaTime);
	}*/
	
	return dir * vectorLength;
}

function UpdateMove()
{
	if (mWaitTimer > 0.0)
	{
		mWaitTimer -= Time.fixedDeltaTime;
		return;
	}

	if (!moveSplinePoints || (moveSplinePoints.Length == 0))
		return;

	//Smooth look at updating
	var damping : float = 6.0;
	var lookAtPoint = GetTargetLookAtPoint();
	if (lookAtPoint != transform.position)
	{
		var rotation : Quaternion = Quaternion.LookRotation(lookAtPoint - transform.position);
		transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.fixedDeltaTime * damping);
	}
	
	var moveVector : Vector3 = GetMoveVector();
	var moveDistThisFrame = moveVector.magnitude * Time.fixedDeltaTime;
	if (mRigidbodyMover)
	{
		mRigidbodyMover.SimpleMove(moveVector, moveVector);
	}
    
    //Check if we are close enough to the next waypoint
    //If we are, proceed to follow the next waypoint
    if (!IsLastMoveWaypoint())
    {
    	if (GetDistanceToCurrentMoveWaypoint() < moveDistThisFrame)
    	{
    		if (mMovingBack)
    			mCurrentWayPoint--;
    		else
    			mCurrentWayPoint++;
    	}
    }
    else 
    {
	    if (GetDistanceToCurrentMoveWaypoint() < moveDistThisFrame) 
	    {
        	setIdle();
        	if (outAndBack)
        	{
        		if (mMovingBack)
    				mCurrentWayPoint++;
    			else
    				mCurrentWayPoint--;        		
        		
        		mMovingBack = !mMovingBack;
        		mWaitTimer = endPointWaitTime;
        	}
	    }
	}
}

function GetTargetLookAtPoint()
{
	var lookAtPoint : Vector3;

	lookAtPoint = GetCurrentMoveWaypoint();
	//lookAtPoint.y = transform.position.y;
    
    return lookAtPoint;
}



function setIdle()
{
	if (mRigidbodyMover)
	{
		mRigidbodyMover.StopMoving();
	}
}

function StopMoving()
{
	mCurrentWayPoint = 0;
	setIdle();
}

function FixedUpdate() 
{
	UpdateMove();
}

}