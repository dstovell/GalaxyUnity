#pragma strict

class AIBehaviour
{
	var gameObject : GameObject;
	var combatComp : CombatComponent;
	var mover : AIMover;
	var harvester : HarvesterComponent;
	var turret : TurretComponent;
	var hanger : HangerComponent;

	var refreshTime : float = 0.0;
	
	function GetName() { return "none"; }
	
	function Init(combatant : GameObject)
	{
		gameObject = combatant;
		combatComp = combatant.GetComponent(CombatComponent);
		mover = combatant.GetComponent(AIMover);
		harvester = combatant.GetComponent(HarvesterComponent);
		turret = combatant.GetComponent(TurretComponent);
		hanger = combatant.GetComponent(HangerComponent);
	}

	function IsAvailable()
	{
		return false;
	}
	
	function IsValidTarget(target : GameObject) : boolean
	{
		if (!target)
			return false;
	
		var targetCombatComp : CombatComponent = target.GetComponent(CombatComponent);
		if (!targetCombatComp || targetCombatComp.IsDead())
		{
			return false;
		}
		return true;
	}
	
	function IsAttackable(target : GameObject) : boolean
	{
		if (combatComp && combatComp.HasRangedAttack())
		{
			if (combatComp.InRangedRange(0, target) && combatComp.IsTargetLineOfSight(target, false))
				return true;
		}
			
		return false;
	}
	
	function GetTargetDanger(target : GameObject) : float
	{
		if (!target)
			return 0.0;
	
		var targetCombatComp : CombatComponent = target.GetComponent(CombatComponent);
		if (!targetCombatComp || targetCombatComp.IsDead())
			return 0.0;
			
		if (!targetCombatComp.HasRangedAttack())
			return 0.0;
		
		return 1.0;
	}
	
	function GetTargetDistance(target : GameObject) : float
	{
		if (!target)
			return 999999.0;
			
		return Vector3.Distance(target.transform.position, gameObject.transform.position);
	}
	
	function BestAttackTarget(targets : GameObject[], previousTarget : GameObject) : GameObject
	{
		var i : int = 0;
		
		//For now, allow AI to be fixated on the previous target
		if (previousTarget)
		{
			for (i=0; i<targets.length; i++)
			{
				if (previousTarget == targets[i])
				{
					return targets[i];
				}
			}
		}
		
		var bestTarget : GameObject = null;
		var bestTargetDist : float = 9999.0;
		var bestTargetDanger : float = -9999.0;
		for (i=0; i<targets.length; i++)
		{
			if (!IsValidTarget(targets[i]))
				continue;
			if (GetTargetDanger(targets[i]) < bestTargetDanger)
				continue;
			if (GetTargetDistance(targets[i]) > bestTargetDist)
				continue;
				
			bestTarget = targets[i];
			bestTargetDist = GetTargetDistance(targets[i]);
			bestTargetDanger = GetTargetDanger(targets[i]);
		}
		
		return bestTarget;
	}
	
	function DoAction(targetArray : Array)
	{
		if (refreshTime > 0.0)
			return false;
	
		var targets : GameObject[] = new GameObject[targetArray.length];
		for (var i=0; i<targetArray.length; i++)
		{
			targets[i] = targetArray[i] as GameObject;
		}
		return DoAction(targets);
	}
	
	function DoAction(targets : GameObject[])
	{
		return false;
	}
	
	function Update(deltaTime : float)
	{
		if (refreshTime > 0.0)
		{
			refreshTime -= deltaTime;
		}
	}
}

enum AiBehaviourType
{
	AimAtTarget,
	RangedAttack,
	LaunchDockedShips,
	Harvest,
	HoldPosition,
	MoveToTarget,
	
	WarpOut,
	
	NumTypes
}

static class AIBehaviourFactory
{
	static function Create(type : AiBehaviourType)
	{
		switch (type)
		{
			case AiBehaviourType.AimAtTarget: return new AimAtTargetBehaviour();
			case AiBehaviourType.RangedAttack: return new RangedAttackBehaviour();
			case AiBehaviourType.LaunchDockedShips: return new LaunchDockedShipsBehaviour();
			case AiBehaviourType.Harvest: return new HarvestBehaviour();
			case AiBehaviourType.HoldPosition: return new HoldPositionBehaviour();
			case AiBehaviourType.MoveToTarget: return new MoveToTargetBehaviour();
			case AiBehaviourType.WarpOut: return new WarpOutBehaviour();
		}
		
		return null;
	}
}

class AimAtTargetBehaviour extends AIBehaviour
{
	function GetName() { return "AimAtTarget"; }
	
	function IsAvailable()
	{
		if (combatComp && combatComp.HasRangedAttack() && turret)
		{
			return true;
		}
		return false;
	}
	
	function DoAction(targets : GameObject[])
	{
		var aimTarget : GameObject = BestAttackTarget(targets, null);
		
		if (aimTarget)
		{
			turret.SetAimTarget(aimTarget);
			if (turret.IsAtAimTarget())
				return false;

			return true;
		}
		
		return false;
	}
}

class LaunchDockedShipsBehaviour extends AIBehaviour
{
	function GetName() { return "LaunchDockedShips"; }
	
	function IsAvailable()
	{
		if (hanger && hanger.AvailableForLaunch())
		{
			return true;
		}
		return false;
	}
	
	function DoAction(targets : GameObject[])
	{
		hanger.QueueLaunchAll();
		return true;
	}
}

class RangedAttackBehaviour extends AIBehaviour
{
	function GetName() { return "RangedAttack"; }
	
	function IsAvailable()
	{
		if (combatComp && combatComp.HasRangedAttack())
		{
			return true;
		}
		return false;
	}
	
	var previousTarget : GameObject = null;
	
	function DoAction(targets : GameObject[])
	{
		if (!IsValidTarget(previousTarget))
			previousTarget = null;
	
		var i : int = 0;
		var attackTarget : GameObject = null;
		for (i=0; i<targets.length; i++)
		{
			if (previousTarget == targets[i])
			{
				attackTarget = targets[i];
				break;
			}
		}
	
		if (!attackTarget)
		{
			for (i=0; i<targets.length; i++)
			{
				if (IsAttackable(targets[i]))
				{
					attackTarget = targets[i];
					break;
				}
			}
		}
		
		if (attackTarget)
		{
			//Debug.Log("[" + combatComp.gameObject.name + "] RangedAttack on [" + attackTarget.name + "]");
			combatComp.RangedAttack(attackTarget);
			refreshTime = 2.0;
			return true;
		}
		
		return false;
	}
}

class HoldPositionBehaviour extends AIBehaviour
{
	function GetName() { return "HoldPosition"; }

	function IsAvailable()
	{
		if (mover && !CombatManager.Get().IsBattleOver())
		{
			return true;
		}
		return false;
	}
	
	function DoAction(targets : GameObject[])
	{
		if (targets.length == 0)
		{
			return true;
		}
	
		for (var i=0; i<targets.length; i++)
		{
			var targetCombatComp : CombatComponent = targets[i].GetComponent(CombatComponent);
			if (IsAttackable(targets[i]))
			{
				//we're going to attack next turn, so do nothing
				return true;
			}
		}
	
		return false;
	}
}

class MoveToTargetBehaviour extends AIBehaviour
{
	function GetName() { return "MoveToTarget"; }

	function IsAvailable()
	{
		if (mover && combatComp && combatComp.HasRangedAttack())
		{
			return true;
		}
		return false;
	}
	
	var previousTarget : GameObject = null;
	
	function DoAction(targets : GameObject[])
	{
		if (!IsValidTarget(previousTarget))
			previousTarget = null;
	
		var moveTarget : GameObject = BestAttackTarget(targets, previousTarget);
		
		if (moveTarget && !IsAttackable(moveTarget))
		{
			mover.SetMoveTarget(moveTarget);
			//previousTarget = moveTarget;
			return true;
		}
		
		return false;
	}
}

class HarvestBehaviour extends AIBehaviour
{
	function GetName() { return "Harvest"; }
	
	var resouceToHarvest : GameObject = null;

	function IsAvailable()
	{
		if (mover && harvester)
		{
			return true;
		}
		return false;
	}
	
	function DoAction(targets : GameObject[])
	{
		if (harvester.IsHarvesting())
			return true;
	
		if (!resouceToHarvest)
			resouceToHarvest = harvester.NearestResource();
			
		if (resouceToHarvest)
		{
			mover.SetMoveTarget(resouceToHarvest);
			return true;
		}
	
		return false;
	}
}

class WarpOutBehaviour extends AIBehaviour
{
	function GetName() { return "WarpOut"; }
	
	var hasWarpedOut : boolean = false;

	function IsAvailable()
	{
		if (mover && CombatManager.Get().IsBattleOver())
		{
			return true;
		}
		return false;
	}
	
	function DoAction(targets : GameObject[])
	{
		if (!hasWarpedOut)
		{
			hasWarpedOut = true;
			WarpComponent.WarpOut(gameObject, gameObject.transform.forward, 2.0);
			
			return true;
		}		
	
		return false;
	}
}
