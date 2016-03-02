#pragma strict

import Vectrosity;

enum CombatActionType
{
	CAT_WEAPON,
	CAT_EVADE,
	CAT_REPAIR,
}

class CombatAction
{
	var type : CombatActionType;
}

class CombatComponent extends MonoBehaviour
{
private var mActions : CombatAction[];
private var mCurrentActionIndex : int;

private var mCombatantComp : CombatantComponent;

private var mModelObject : GameObject;

//private var mHealth : int;
var mHealth : int;

var mLargeWeaponEmitter : Transform;
var mSmallWeaponEmitter : Transform;

var mHitEffect : GameObject;
private var mDestroyEffect : GameObject;
var mDestroyModel : GameObject;

private var mIsAttackPhase : boolean = false;
var mIsAttackPhaseTargets : List.<GameObject>;

function Awake() 
{
	mCombatantComp = GetComponent(CombatantComponent);
}

function Start() 
{
	var modelTransform = transform.Find("model");
    if (modelTransform)
    {
    	mModelObject = modelTransform.gameObject;
    }
    else if (gameObject.GetComponent.<Animation>())
   	{
   		mModelObject = gameObject;
   	}
    
    if (mCombatantComp.mCombatantConfig["DestroyEffect"] != null)
	{
		mDestroyEffect = Resources.Load(mCombatantComp.mCombatantConfig["DestroyEffect"]) as GameObject;
	}

	mLargeWeaponEmitter = gameObject.transform.Find("Large_Emit");
    mSmallWeaponEmitter = gameObject.transform.Find("Small_Emit");
    
    ResetState();
}

function ResetState()
{
	mHealth = GetMaxHealth();
}

function OnSpawned()
{
	ResetState();
}

function Update() 
{	

}

function GetMaxHealth()
{
	return mCombatantComp.mCombatantConfig["MaxHealth"].AsInt;
}

function GetHealth()
{
	return mHealth;
}

function IsDead()
{
	return (mHealth <= 0);
}

function IsAttacking()
{
	return false;
}

function IsHit()
{
	return false;
}

function InVisualRange(target : GameObject)
{
	var dist = Vector3.Distance(transform.position, target.transform.position);
	if (dist <= mCombatantComp.mCombatantConfig["SightRange"].AsFloat)
	{
		return true;
	}
	
	return false;
}

function CanSee(target : GameObject, drawRay)
{
	if (InVisualRange(target))
	{
		return IsTargetLineOfSight(target, drawRay);
	}
	
	return false;
}

function IsFriendly(obj : GameObject)
{
	//This will include allied units later, maybe?
	return (gameObject.tag == obj.tag);
}

function IsHostile(obj : GameObject)
{
	return !IsFriendly(obj);
}

function IsNeutral(obj : GameObject)
{
	return false;
}

function GetWeaponCount() : int
{
	if (!mCombatantComp.mCombatantConfig)
		return 0;

	var weaponCount : int = 0;
	if (mCombatantComp.mComponentConfigs != null)
	{
		for (var i=0; i<mCombatantComp.mComponentConfigs.Count; i++)
		{
			if (mCombatantComp.mComponentConfigs[i]["Category"].Value == "Weapon")
				weaponCount++;
		}
	}
	
	return weaponCount;
}

function GetWeapon(index : int) : JSONNode
{
	if (!mCombatantComp.mCombatantConfig)
		return null;

	if (mCombatantComp.mCombatantConfig["RangedWeapon"] != null)
	{
		return mCombatantComp.mCombatantConfig["RangedWeapon"];
	}
	else if (mCombatantComp.mComponentConfigs != null)
	{
		var weaponIndex = 0;
		for (var i=0; i<mCombatantComp.mComponentConfigs.Count; i++)
		{
			if (mCombatantComp.mComponentConfigs[i]["Category"].Value == "Weapon")
			{
				if (weaponIndex == index)
					return mCombatantComp.mComponentConfigs[i];
				else
					weaponIndex++;
			}
		}
	}
	
	return null;
}

function InAttackRange(weaponIndex : int, target : GameObject)
{
	if (HasRangedAttack() && InRangedRange(weaponIndex, target))
		return true;
		
	return false;
}

function InRangedRange(weaponIndex : int, target : GameObject) : boolean
{
	if (HasRangedAttack())
	{
		var weaponGridRange : float = GetWeapon(weaponIndex)["WeaponMaxRange"].AsFloat;
		var weaponFireArc : float = 90.0;
		if ( ShapeTool.IsInCombatantArc(target.transform.position, gameObject, weaponGridRange, weaponFireArc) )
		{
			return true;
		}
	}
	
	return false;
}

function HasRangedAttack()
{
	var weaponCount = GetWeaponCount();
	for (var i=0; i<weaponCount; i++)
	{
		if (GetWeapon(i)["WeaponMaxRange"].AsFloat > 0.0)
			return true;
	}
	return false;
}

function GetProjectileEmitTransform(weaponIndex : int) : Transform
{
	var weaponData : JSONNode = GetWeapon(weaponIndex);
	if (mLargeWeaponEmitter && (weaponData["WeaponType"].Value == "TrackingProjectile"))
		return mLargeWeaponEmitter;
	else if (mSmallWeaponEmitter)
		return mSmallWeaponEmitter;
	
	return gameObject.transform;
}

//Might move this to a central location later...
function GetWeaponPrefab(name : String) : GameObject
{
	return Resources.Load( name ) as GameObject;
}

function EmitProjectile(weaponIndex : int, target : GameObject)
{
	var weaponData : JSONNode = GetWeapon(weaponIndex);

	var weaponTrans : Transform = GetProjectileEmitTransform(weaponIndex);
	var newProjectile : GameObject = Instantiate(GetWeaponPrefab(weaponData["ProjectileEffect"]), weaponTrans.position, weaponTrans.rotation);
	var projectileComp : ProjectileComponent = newProjectile.GetComponent(ProjectileComponent);
	if (projectileComp)
	{
		var isMiss : boolean = false;

		var damage = weaponData["WeaponMaxDamage"].AsInt;
		
		projectileComp.Setup(target, gameObject, weaponTrans, damage, isMiss, weaponData);
	}
}

function AimAt(weaponIndex : int, target : GameObject)
{
	transform.LookAt(target.transform);
}

function RangedAttack(target : GameObject)
{
	if (target == gameObject)
		return;
	
	var otherCombat : CombatComponent = target.GetComponent(CombatComponent);
	if (otherCombat)
	{
		AimAt(0, target);
		
		EmitProjectile(0, target);
	}
}

function GetCenter()
{
	var center : Vector3 = transform.position;
	if (gameObject.GetComponent.<Collider>())
	{
		center = gameObject.GetComponent.<Collider>().bounds.center;
	}
	
	return center;
}

function OnDamage(attacker : GameObject, damage : int, weaponJSON : JSONNode)
{
	var wasDead : boolean = IsDead();

	mHealth -= damage;
	if (mHealth < 0)
		mHealth = 0;

	if (IsDead())
	{
		if (mDestroyEffect)
		{
			GameObject.Instantiate(mDestroyEffect, transform.position, transform.rotation);
			if (mDestroyModel)
				Destroy(mDestroyModel);
		}
		else
		{
			if (mModelObject && mCombatantComp.mCombatantConfig["DeathAnim"] != null)
			{
				var controller : CharacterController = GetComponent(CharacterController);
				if (controller)
					controller.enabled = false;
			
				mModelObject.GetComponent.<Animation>().Play( mCombatantComp.mCombatantConfig["DeathAnim"] );
			}
		}
	}
	else
	{
		if (weaponJSON && weaponJSON["HitEffect"])
		{
			//These should get stashed somewhere
			var hitPrefab : GameObject = Resources.Load(weaponJSON["HitEffect"]) as GameObject;
			GameObject.Instantiate(hitPrefab, transform.position, transform.rotation);
		}
		else if (mHitEffect)
		{
			var hitEffect : GameObject = GameObject.Instantiate(mHitEffect, transform.position, transform.rotation);
			//hitEffect.transform.localScale = new Vector3(10,10,10);
		}
		else
		{
			if (mCombatantComp.mCombatantConfig["HitAnim"] != null)
			{
				mModelObject.GetComponent.<Animation>().Play( mCombatantComp.mCombatantConfig["HitAnim"] );
			}
		}
	}
	
	if (!wasDead && IsDead())
	{
		//this shot killed me!
		return true;
	}
	else
	{
		return false;
	}
}

function OnRepair(repairAmount : int)
{
	mHealth += repairAmount;
	if (mHealth > GetMaxHealth())
		mHealth = GetMaxHealth();
}

function GetWeaponPosition()
{
	var weaponPos : Vector3 = transform.position;
	/*var controller : CharacterController = GetComponent(CharacterController);
	if (controller)
	{
		weaponPos += controller.center;
	}*/
	
	return weaponPos;
}

function GetAbsoluteParent(obj : GameObject) : GameObject
{
	var transform : Transform = obj.transform;
	while (transform.parent)
	{
		transform = transform.parent;
	}
	return transform.gameObject;
}

function IsTargetLineOfSight(target : GameObject, drawRay) : boolean
{
	var lineOfSight = false;

	var weaponPos : Vector3 = GetWeaponPosition();
	var targetPos : Vector3 = target.transform.position;

	var hit : RaycastHit;
	var direction = (targetPos - weaponPos);
	direction.Normalize();
	if (Physics.Raycast(weaponPos, direction, hit))
	{
		if ( hit.rigidbody && ((hit.rigidbody.gameObject == target) || (GetAbsoluteParent(hit.rigidbody.gameObject) == target)) )
		{
			lineOfSight = true;
		}
		else if ( hit.collider && ((hit.collider.gameObject == target) || (GetAbsoluteParent(hit.collider.gameObject) == target)) )
		{
			lineOfSight = true;
		}
		else
		{
			//target is now in cover, or behind another valid target
			lineOfSight = false;
		}
	}
	
	if (drawRay)
	{
		var debugRay : LineRenderer = GetComponent(LineRenderer);
		if (!debugRay) 
		{
			debugRay = gameObject.AddComponent(LineRenderer);
			debugRay.material = new Material(Shader.Find("Particles/Additive"));
		}
		debugRay.SetWidth(0.1, 0.1);
		debugRay.SetVertexCount(2);
		debugRay.SetPosition(0, weaponPos);
		debugRay.SetPosition(1, targetPos);
		if (lineOfSight)
			debugRay.SetColors(Color.green, Color.green);
		else
			debugRay.SetColors(Color.red, Color.red);		
	}
	
	//nothing hit by the raycast?
	return lineOfSight;
}

} //CombatComponent