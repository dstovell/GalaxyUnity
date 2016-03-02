#pragma strict

import Vectrosity;

class RigidbodyMover extends MonoBehaviour
{

enum MoveType
{
	None,
	Simple,
	Complex
}
var mMoveType = MoveType.None;

private var mRigidBody : Rigidbody;
private var mCollider : BoxCollider;
private var mCombatComp : CombatComponent;

private var mTargetVelocity : Vector3;
private var mAcceleration : Vector3;

private var mSpeed : float = 100.0;
var speedFalloffDistMin : float = 0.00;
var speedFalloffDistMax : float = 10.00;
var force : float = 22.00;
 
private var predictTarget : float = 1.00;
private var predictTargetSharpness : float = 3.00;
private var predictThis : float = 0.9;
private var predictThisSharpness : float = 3.00;
 
private var target : Transform = null;
private var targetPosition : Vector3 = Vector3.zero;
 
private var lastTargetPos : Vector3;
var predictThisVel : Vector3;
var predictTargetVel : Vector3;
private var warned : boolean = false;

function Awake()
{
	mTargetVelocity = Vector3.zero;
	mRigidBody = gameObject.GetComponent(Rigidbody);
	if (!mRigidBody)
	{
		mRigidBody = gameObject.AddComponent(Rigidbody);
		
		mCollider = gameObject.AddComponent(BoxCollider);
		mCollider.center = Vector3.zero;
		mCollider.size = Vector3(500, 500, 500);
		
		Physics.gravity = Vector3.zero;
	}
	
	mCombatComp = gameObject.GetComponent(CombatComponent);
	
	mRigidBody.useGravity = false;
}

function Start() 
{
}

function SimpleMove(velocity : Vector3, acceleration : Vector3)
{
	if (!mRigidBody)
	{
		return;
	}

	mMoveType = MoveType.Simple;
	if ((velocity == mTargetVelocity) && (mAcceleration == acceleration))
	{
		return;
	}

	mTargetVelocity = velocity;
	mAcceleration = acceleration;
	
	mRigidBody.velocity = mAcceleration;
}

function ComplexMove(obj : GameObject, speed : float, falloffDistance : float)
{
	mMoveType = MoveType.Complex;
	target = obj.transform;
	mSpeed = speed;
	speedFalloffDistMax = falloffDistance;
}

function ComplexMove(targetPos : Vector3, speed : float, falloffDistance : float)
{
	mMoveType = MoveType.Complex;
	targetPosition = targetPos;
	target = null;
	mSpeed = speed;
	speedFalloffDistMax = falloffDistance;
}

function FixedUpdate()
//function Update()
{
	if (mRigidBody)
	{
		if (mMoveType == MoveType.Simple)
		{
			if (mRigidBody.velocity != mTargetVelocity)
			{
				mRigidBody.velocity += mAcceleration;
			}
		}
		else if (mMoveType == MoveType.Complex)
		{
			UpdateComplexMove();
		}
	}
	
	if (IsWarping())
	{
		SetThrusterLevel(1.0);
	}
	else if (IsMoving() && !IsDead())
	{
		SetThrusterLevel(0.4);
	}
	else
	{
		SetThrusterLevel(0.0);
	}
}

function StopMoving()
{
	if (mMoveType == MoveType.Simple)
	{
		mTargetVelocity = Vector3.zero;
		mAcceleration = Vector3.zero;
		
		mRigidBody.velocity = Vector3.zero;
		mRigidBody.angularVelocity = Vector3.zero;
	}
	else if (mMoveType == MoveType.Complex)
	{
		target = null;
		//targetPosition = Vector3.zero;
	}
	
	mMoveType = MoveType.None;
}

function IsDead()
{
	if (mCombatComp && mCombatComp.IsDead())
		return true;
	else
		return false;
}

function IsMoving()
{
	return (mRigidBody.velocity != Vector3.zero);
}

function IsWarping()
{
	return (gameObject.GetComponent(WarpComponent) != null);
}

function SetThrusterLevel(thrustLevel : float)
{
	for (var i=0; i<gameObject.transform.childCount; i++)
	{
		SetThrusterLevelForObject( gameObject.transform.GetChild(i).gameObject, thrustLevel );
	}	
}

private function SetThrusterLevelForObject(obj : GameObject, thrustLevel : float)
{
	var thruster : SgtThruster = obj.GetComponent(SgtThruster);
	if (thruster)
	{
		thruster.Throttle = thrustLevel;
	}
}

private function UpdateComplexMove()
{
	//If the target is a actual transform, update the position to handle movement
	if (target)
	{
		targetPosition = target.position;
		predictTargetVel = Vector3.Lerp(predictTargetVel, (targetPosition - lastTargetPos) / Time.fixedDeltaTime, Time.fixedDeltaTime * predictTargetSharpness);
	}
	else
	{
		predictTargetVel = Vector3.zero;
	}
	lastTargetPos = targetPosition;

	// get the smooothed velocity of this and the target this frame
	predictThisVel = Vector3.Lerp(predictThisVel, GetComponent.<Rigidbody>().velocity, Time.fixedDeltaTime * predictThisSharpness);
 
	// predict future positions for this and the target
	var predictedTarget = targetPosition + (predictTargetVel * predictTarget);
	var predictedPosition = transform.position + (predictThisVel * predictThis);
 
	// construct a velocity vector from our position to the target's, tweaking the falloff relative to distance
	var toTarget = predictedTarget - predictedPosition;
	var wantedVelocity = toTarget.normalized * mSpeed;
	
	VectorLine.SetRay3D(Color.red, transform.position, wantedVelocity);
 
	// the final force
	var usedForce = (wantedVelocity - GetComponent.<Rigidbody>().velocity);
	GetComponent.<Rigidbody>().AddForce(usedForce, ForceMode.Acceleration);
}

} //RigidbodyMover
