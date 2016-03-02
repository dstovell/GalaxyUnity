class SteeringTuning
{
	var Alignment : float = 0.0;
	var Cohesion : float = 0.0;
	var Evasion : float = 0.0;
	var Forward : float = 0.0;
	var PathSimplified : float = 0.0;
	var SphericalObstacleRepulsion : float = 0.0;
	var Target : float = 0.0;
}

class AISteeringTuner
{
	private var mAIComp : AIComponent;
	private var mSteerForAlignment : UnitySteer.Behaviors.SteerForAlignment;
	private var mSteerForCohesion : UnitySteer.Behaviors.SteerForCohesion;
	private var mSteerForEvasion : UnitySteer.Behaviors.SteerForEvasion;
	private var mSteerForForward : UnitySteer.Behaviors.SteerForForward;
	private var mPathSimplified : UnitySteer.Behaviors.SteerForPathSimplified;
	private var mSteerForSphericalObstacleRepulsion : UnitySteer.Behaviors.SteerForSphericalObstacles;
	private var mSteerForPoint : UnitySteer.Behaviors.SteerForPoint;
	
	function Init(gameObject : GameObject)
	{
		mAIComp = gameObject.GetComponent(AIComponent);
		mSteerForAlignment = gameObject.GetComponent(UnitySteer.Behaviors.SteerForAlignment);
		mSteerForCohesion = gameObject.GetComponent(UnitySteer.Behaviors.SteerForCohesion);
		mSteerForEvasion = gameObject.GetComponent(UnitySteer.Behaviors.SteerForEvasion);
		mSteerForForward = gameObject.GetComponent(UnitySteer.Behaviors.SteerForForward);
		mPathSimplified = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPathSimplified);
		mSteerForSphericalObstacleRepulsion = gameObject.GetComponent(UnitySteer.Behaviors.SteerForSphericalObstacles);		
		mSteerForPoint = gameObject.GetComponent(UnitySteer.Behaviors.SteerForPoint);
	}

	function UpdateTuning()
	{
		var tuning : SteeringTuning = new SteeringTuning();
		
		if (mAIComp.isLaunching || (mAIComp.isLanding && mAIComp.isTargetClose))
		{
			tuning.Alignment = 0.5;
			tuning.Cohesion = 0.5;
			tuning.PathSimplified = 1.0;
			tuning.SphericalObstacleRepulsion = 0.1;
		}
		else if (mAIComp.isOutNumbered)
		{
			tuning.Alignment = 0.3;
			tuning.Cohesion = 0.3;
			tuning.Evasion = 1.0;
			tuning.SphericalObstacleRepulsion = 0.3;
		}
		else if (!mAIComp.isTargetFriendly && mAIComp.isTargetClose)//(mAIComp.isTargetAttackable)
		{
			tuning.Alignment = 0.3;
			tuning.Cohesion = 0.3;
			tuning.Forward = 1.0;
			tuning.Evasion = 0.2;
			tuning.SphericalObstacleRepulsion = 1.0;
		}
		else if (mAIComp.hasTarget && (mAIComp.obstacleCount == 0) && (mAIComp.vehicleCount == 0))
		{
			tuning.Target = 5.0;
		}
		else if (mAIComp.hasTarget && (mAIComp.obstacleCount == 0))
		{
			tuning.Alignment = 0.3;
			tuning.Cohesion = 0.3;
			tuning.Target = 2.0;
		}
		else if (mAIComp.hasTarget)
		{
			tuning.Alignment = 0.5;
			tuning.Cohesion = 0.5;
			tuning.SphericalObstacleRepulsion = 0.5;
			tuning.Target = 1.0;
		}
		else //if nothing is happening...
		{
			tuning.Alignment = 0.5;
			tuning.Cohesion = 0.5;
			tuning.Forward = 1.0;
			tuning.PathSimplified = 0.0;
			tuning.SphericalObstacleRepulsion = 0.5;
			tuning.Target = 0.0;
		}
		
		//Absolute effects, stuff we want true no matter what else is happening
		if (mAIComp.isInDebrisField || mAIComp.isInMineField)
		{
			tuning.Alignment = 0.3;
			tuning.Cohesion = 0.3;
			tuning.SphericalObstacleRepulsion = 1.5; 
			
			tuning.Target *= 0.5;
		}
		if ((mAIComp.vehicleCount == 0) && (mAIComp.obstacleCount == 0))
		{
			tuning.SphericalObstacleRepulsion = 0.0;
		}
		if (mAIComp.friendlyVehicleCount == 0)
		{
			tuning.Alignment = 0.0;
			tuning.Cohesion = 0.0;
		}
		if (mAIComp.isAboutToCollide)
		{
			tuning.Alignment = 0.0;
			tuning.Cohesion = 0.0;
			tuning.Forward = 0.0;
			tuning.PathSimplified = 0.0;
			tuning.SphericalObstacleRepulsion = 1.0;
			tuning.Target = 0.0;
		}
		
		SetTuning(tuning);
	}
	
	function SetTuning(tuning : SteeringTuning)
	{
		if (mSteerForAlignment) mSteerForAlignment.Weight = tuning.Alignment;
		if (mSteerForCohesion) mSteerForCohesion.Weight = tuning.Cohesion;
		if (mSteerForEvasion) mSteerForEvasion.Weight = tuning.Evasion;
		if (mSteerForForward) mSteerForForward.Weight = tuning.Forward;
		if (mSteerForAlignment) mSteerForAlignment.Weight = tuning.Alignment;
		if (mSteerForSphericalObstacleRepulsion) mSteerForSphericalObstacleRepulsion.Weight = tuning.SphericalObstacleRepulsion;
		if (mSteerForPoint) mSteerForPoint.Weight = tuning.Target;
		if (mPathSimplified) mPathSimplified.Weight = tuning.PathSimplified;
	}
}