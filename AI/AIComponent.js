
class AIComponent extends MonoBehaviour
{
//Questions 
var hasTarget : boolean = false;
var targetGameObject : GameObject;
var isTargetClose : boolean = false;
var isTargetFriendly : boolean = false;
var isTargetAttackable : boolean = false;
var isLaunching : boolean = false;
var isLanding : boolean = false;
var obstacleCount : int = 0;
var vehicleCount : int = 0;
var friendlyVehicleCount : int = 0;
var hostileVehicleCount : int = 0;
var isProjectileTracking : boolean = false;
var isOutNumbered : boolean = false;
var isInDebrisField : boolean = false;
var isInMineField : boolean = false;
var isAboutToCollide : boolean = false;
//*****************************************	

var lastAction : String = "none";

private var mCombatComp : CombatComponent;
private var mMover : AIMover;
private var mVehicle : UnitySteer.Behaviors.AutonomousVehicle;
private var mRadar : UnitySteer.Behaviors.Radar;
private var mSteerForPoint : UnitySteer.Behaviors.SteerForPoint;

private var mSteeringTuner : AISteeringTuner;

private var mTargets : GameObject[];
private var mVisibleTargets : Array = new Array();

private var mEnabled : boolean = false;

private var mBehaviours : AIBehaviour[];

function Awake()
{
	mCombatComp = gameObject.GetComponent(CombatComponent);
	mMover = gameObject.GetComponent(AIMover);
	mVehicle = gameObject.GetComponent(UnitySteer.Behaviors.AutonomousVehicle);
	mRadar = gameObject.GetComponent(UnitySteer.Behaviors.Radar);
	mSteerForPoint = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPoint);
	
	mSteeringTuner = new AISteeringTuner();
	mSteeringTuner.Init(gameObject);
}

function Start () 
{
	mTargets = CombatManager.Get().GetCombatantsNotOnTeam(gameObject);
	
	mBehaviours = new AIBehaviour[AiBehaviourType.NumTypes];
	for (var i=0; i<mBehaviours.length; i++)
	{
		mBehaviours[i] = AIBehaviourFactory.Create(i);
		mBehaviours[i].Init(gameObject);
	}
}

function Update() 
{
	if (!mEnabled || mCombatComp.IsDead() || mCombatComp.IsHit())
		return;
	
	if (mMover)
		mMover.EnableMoving();
		
	//Wait for any attack animations to complete
	if (mCombatComp.IsAttacking())
		return;
		
	mTargets = CombatManager.Get().GetCombatantsNotOnTeam(gameObject);
	
	DoNextAction();
	
	for (var i=0; i<mBehaviours.length; i++)
	{
		mBehaviours[i].Update(Time.deltaTime);
	}
	
	UpdateQuestions();
	mSteeringTuner.UpdateTuning();
}

function DoNextAction()
{
	var i : int = 0;
	mVisibleTargets.Clear();
	if (mTargets)
	{
		for (i=0; i<mTargets.length; i++)
		{
			var thisCombatant = mTargets[i];
			if (thisCombatant != gameObject)
			{
				var targetCombatComp : CombatComponent = mTargets[i].GetComponent(CombatComponent);
				if (targetCombatComp && !targetCombatComp.IsDead() )//&& mCombatComp.CanSee(mTargets[i], false))
				{
					mVisibleTargets.Add( mTargets[i] );
				}
			}
		}
	}
	
	var actionTaken : boolean = false;
	
	for (i=0; i<mBehaviours.length; i++)
	{
		if (mBehaviours[i].IsAvailable())
		{
			actionTaken = mBehaviours[i].DoAction(mVisibleTargets);
			if (actionTaken)
			{
				lastAction = mBehaviours[i].GetName();
				return true;
			}
		}
	}
	
	return false;
}

function Enable()
{
	mEnabled = true;
}

function Disable()
{
	mEnabled = false;
}

function UpdateQuestions()
{
	hasTarget = ((mSteerForPoint != null) && mSteerForPoint.enabled && (mSteerForPoint.Target != null));
	if (hasTarget) 
		targetGameObject = mSteerForPoint.Target.gameObject;
	else 
		targetGameObject = null;
	isTargetAttackable = (hasTarget && mCombatComp.InRangedRange(0, targetGameObject) && mCombatComp.IsTargetLineOfSight(targetGameObject, false));
	isTargetClose = false;
	obstacleCount = 0;
	vehicleCount = 0;
	friendlyVehicleCount  = 0;
	hostileVehicleCount = 0;
	
	var i : int = 0;
	if (mRadar)
	{
		obstacleCount = mRadar.Obstacles.Count;
		
		vehicleCount = mRadar.Vehicles.Count;
		for (i=0; i<mRadar.Vehicles.Count; i++)
		{
			if (mCombatComp.IsFriendly(mRadar.Vehicles[i].gameObject))
				friendlyVehicleCount++;
			else 
				hostileVehicleCount++;
				
			if (hasTarget && (mRadar.Vehicles[i].gameObject.transform == mSteerForPoint.Target))
				isTargetClose = true;
		}
	}
	
	isInDebrisField = (obstacleCount >= 3);
		
	isOutNumbered = (hostileVehicleCount >= friendlyVehicleCount + 2);
	
	//isAboutToCollide
}

}