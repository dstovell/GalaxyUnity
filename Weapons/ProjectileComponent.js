#pragma strict

class ProjectileComponent extends MonoBehaviour
{

var mLifeTime : float = 0.5;
var mSpeed : float = 1.0;

var mVelocity : Vector3;
private var mDestroyTime : float;
var mTarget : GameObject;
private var mAttacker : GameObject;
private var mLaunchPoint : Transform;
private var mDamage : int;
private var mTargetPos : Vector3;
private var mForceMiss : boolean;
private var mProjectileType : String;
private var mWeaponJSON : JSONNode = null;

private var mPastTarget : boolean = false;
private var mVeerAmout : float = 0.0;
private var mMaxVeer : float = 5.0;

private var mLineRenderer : LineRenderer;

function Setup(target : GameObject, attacker : GameObject, launchPoint : Transform, damage : int, forceMiss : boolean, weaponJSON : JSONNode)
{
	mTarget = target;
	mAttacker = attacker;
	mDamage = damage;
	mProjectileType = weaponJSON["WeaponType"].Value;
	mForceMiss = forceMiss;
	mWeaponJSON = weaponJSON;
	mLaunchPoint = launchPoint;
}

function Start()
{
	//DetonatorForce.useExplosionForce = false;

	gameObject.tag = "Projectile";
	
	mLineRenderer = gameObject.GetComponent(LineRenderer);

	mDestroyTime = Time.time + mLifeTime;
	if (mTarget)
	{
		AimAtTarget();
	}
	else
	{
		mVelocity += transform.forward * mSpeed;
	}
	
	if (mProjectileType == "Beam")
	{
		DoDamage();
	}
}

function AimAtTarget()
{
	if (mTarget)
	{
		mTargetPos = mTarget.transform.position;
		//Don't shoot at the bottom
		mTargetPos.y += 1.0; 
		var direction = (mTargetPos - transform.position);
		direction.Normalize();
		mVelocity = direction * mSpeed;
	}
}

function UpdateBeam()
{
	if (mTarget && mLineRenderer)
	{
		mTargetPos = mTarget.transform.position;
		//mLineRenderer.SetVertexCount(2);
		mLineRenderer.SetWidth(1.0,1.0);
		mLineRenderer.SetPosition(0, mLaunchPoint.position);
		mLineRenderer.SetPosition(1, mTargetPos);
	}
}

function VeerOffCourse()
{
	if (mVeerAmout < mMaxVeer)
	{
		var veerVector : Vector3 = mVelocity;
		veerVector.x += 0.3;
		veerVector.y += 0.3;
		veerVector.z += 0.3;
		
		mVelocity = Vector3.RotateTowards(mVelocity, veerVector, 1.0, 0.005);
		mVeerAmout += 1.0;
	}
}

function IsAboutToDie()
{
	if (mPastTarget)
	{
		return true;
	}
	else if (!mForceMiss)
	{
		var distancePerUpdate = mVelocity.magnitude * Time.fixedDeltaTime;
		var dist = Vector3.Distance(transform.position, mTargetPos);
		if (dist <= distancePerUpdate*5)
		{
			return true;
		}
	}
	
	return false;
}

function DoDamage()
{
	var otherCombat : CombatComponent = mTarget.GetComponent(CombatComponent);
	if (!otherCombat.IsDead())
	{
		var killedCombatant : boolean = otherCombat.OnDamage(mAttacker, mDamage, mWeaponJSON);
		BattleLog.OnAttackSuccess(mAttacker, mTarget, "", mDamage, killedCombatant);
	}
}

function Update() 
{
	if(Time.time > mDestroyTime)
	{
		Destroy(gameObject);
	}
	
	if (mProjectileType == "Beam")
	{
		UpdateBeam();
		return;
	}
	
	if (!mForceMiss && (mProjectileType == "TrackingProjectile"))
	{
		AimAtTarget();
	}
	
	transform.position += mVelocity * Time.fixedDeltaTime;
	transform.LookAt(transform.position + mVelocity);
	
	var distancePerUpdate = mVelocity.magnitude * Time.fixedDeltaTime;
	var dist = Vector3.Distance(transform.position, mTargetPos);
	
	if (mForceMiss)
	{
		mTargetPos = mTarget.transform.position;
		if (dist <= distancePerUpdate*30)
		{
			VeerOffCourse();
		}
		else if (mVeerAmout > 0.0)
		{
			mPastTarget = true;
		}
	}
	else
	{
		if (dist <= distancePerUpdate)
		{
			DoDamage();
			Destroy(gameObject);
		}
	}
}

function OnCollisionEnter(collision : Collision)
{
	if (collision.gameObject == mAttacker)
		return;

	DoDamage();
	Destroy(gameObject);
}

}//ProjectileComponent

