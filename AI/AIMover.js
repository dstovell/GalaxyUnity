#pragma strict

class AIMover extends MonoBehaviour
{
private var mCombatantComp : CombatantComponent;
private var mCombatComp : CombatComponent;
private var mRigidbody : Rigidbody;
private var mVehicle : UnitySteer.Behaviors.AutonomousVehicle;
private var mSteerForMinimumSpeed : UnitySteer.Behaviors.SteerForMinimumSpeed;
private var mSteerToTarget :  UnitySteer.Behaviors.SteerForPoint;

private var mMaxSpeed : float = 3.0;

private var mDisabledFromCollision : boolean = false;
private var mCollisionTimer : float = 0;

function Awake()
{
	mCombatantComp = gameObject.GetComponent(CombatantComponent);
	mCombatComp = gameObject.GetComponent(CombatComponent);
	mRigidbody = gameObject.GetComponent(Rigidbody);
	mVehicle = gameObject.GetComponent(UnitySteer.Behaviors.AutonomousVehicle);
	mSteerForMinimumSpeed = gameObject.GetComponent(UnitySteer.Behaviors.SteerForMinimumSpeed);
	mSteerToTarget = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPoint);
}

function Start() 
{
	mMaxSpeed = mCombatantComp.GetMaxSpeed();
	
	DisableMoving();
}

function SetMoveTarget(obj : GameObject)
{
	if (obj)
	{
		var steerToTarget : UnitySteer.Behaviors.SteerForPoint = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPoint);		
		steerToTarget.TargetPoint = obj.transform.position;
		steerToTarget.enabled = true;
	}
}

function ClearMoveTarget()
{
	var steerToTarget : UnitySteer.Behaviors.SteerForPoint = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPoint);		
	steerToTarget.TargetPoint = Vector3.zero;
	//steerToTarget.enabled = false;
}

function GetCurrentSpeed() : float
{
	if (mVehicle)
	{
		return mVehicle.Speed;
	}
	return 0.0;
}

function IsMoving() : boolean
{
	return (GetCurrentSpeed() > 0.0);
}



function EnableMoving()
{
	if (gameObject.transform.parent)
		gameObject.transform.parent = null;

	if (mVehicle)
	{
		mVehicle.CanMove = true;
		mVehicle.MaxSpeed = mMaxSpeed;
		mVehicle.MaxForce = mMaxSpeed / 2.0;
		if (mSteerForMinimumSpeed)
			mSteerForMinimumSpeed.MinimumSpeed = mMaxSpeed / 2.0;
	}
}

function DisableMoving()
{
	if (mVehicle)
	{
		mVehicle.CanMove = false;
		//mVehicle.Speed = 0.0;
		if (mSteerForMinimumSpeed)
			mSteerForMinimumSpeed.MinimumSpeed = 0.0;
	}
}

function OnSpawned()
{
	print("OnSpawned " + gameObject.name);

	DisableMoving();
	
	mMaxSpeed = mCombatantComp.GetMaxSpeed();
}

function OnCollisionEnter(collision : Collision)
{
	mDisabledFromCollision = true;
	mCollisionTimer = 1.0;
	if (mRigidbody)
		mRigidbody.isKinematic = false;
}

function Update() 
{
	if (IsDead())
	{
		if (mRigidbody)
			mRigidbody.isKinematic = false;
		DisableMoving();
		ClearMoveTarget();
	}
	
	if (mDisabledFromCollision)
	{
		mCollisionTimer -= Time.deltaTime;
		if (mCollisionTimer <= 0.0)
		{
			mDisabledFromCollision = false;
			if (mRigidbody)
				mRigidbody.isKinematic = true;
		}
	}

	UpdateThrusters();
}

private function UpdateThrusters()
{
	if (IsWarping())
	{
		SetThrusterLevel(1.0);
	}
	else if (IsMoving() && !IsDead())
	{
		SetThrusterLevel(0.4);
	}
	else if (IsOnMap())
	{
		SetThrusterLevel(0.4);
	}
	else
	{
		SetThrusterLevel(0.0);
	}
}

function IsWarping()
{
	return (gameObject.GetComponent(WarpComponent) != null);
}

function IsOnMap()
{
	return (StarMapGUI.Get() != null);
}

private function SetThrusterLevel(thrustLevel : float)
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
	
	var trail : TrailRenderer = obj.GetComponent(TrailRenderer);
	if (trail)
	{
		if ((thrustLevel == 0.0) || IsOnMap())
		{
			trail.enabled = false;
		}
		else 
		{
			trail.enabled = true;
			if (thrustLevel == 1.0)
				trail.time = 5.0;
			else
				trail.time = 1.0;
		}
	}
}

private function IsDead()
{
	if (mCombatComp && mCombatComp.IsDead())
		return true;
	else
		return false;
}


}