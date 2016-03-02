#pragma strict

class AiTurnBrain
{

//This is the amount of time between each action decision the AI team will make, so it doesn't all happen at once
private var mActionWaitTime : float = 2.0;

private var mTimeSinceLastAction : float;

private var mTeam : CombatantTeam;

function AiTurnBrain(team : CombatantTeam)
{
	print("AiTurnBrain");
	mTeam = team;
	
	var aiComp : AIComponent; 
	for (var i=0; i<mTeam.mTeamMembers.Length; i++)
	{
		aiComp = mTeam.mTeamMembers[i].GetComponent(AIComponent);
		if (aiComp)
		{
			aiComp.Disable();
		}
		//aiComp.UseTurnBasedLogic();
	}
}

function OnTurnBegin()
{
	mTimeSinceLastAction = 0;
}

function OnTurnEnd()
{
}

function Update(delta : float)
{
	if ((mTimeSinceLastAction > mActionWaitTime) && !IsTeamMemberDoingAction())
	{	
		DoNextTeamAction();
		mTimeSinceLastAction = 0;
	}
	
	mTimeSinceLastAction += delta;
}

function IsTeamMemberDoingAction()
{
	/*var combatComp : CombatComponent;
	var mover : StrategyMover;
	for (var i=0; i<mTeam.mTeamMembers.Length; i++)
	{
		combatComp = mTeam.mTeamMembers[i].GetComponent(CombatComponent);
		if (combatComp.IsAttacking())
			return true;
		mover = mTeam.mTeamMembers[i].GetComponent(StrategyMover);
		if (mover.IsMoving())
			return true;
	}*/
	
	return false;
}

function DoNextTeamAction()
{
	var combatant : CombatantComponent;
	var combatComp : CombatComponent;
	for (var i=0; i<mTeam.mTeamMembers.Length; i++)
	{
		combatant = mTeam.mTeamMembers[i].GetComponent(CombatantComponent);
		combatComp = mTeam.mTeamMembers[i].GetComponent(CombatComponent);
		if (!combatComp.IsDead())
		{
			DoNextCombatantAction(combatant);
			break;
		}
	}
}

function DoNextCombatantAction(combatant : CombatantComponent)
{
	var aiComp : AIComponent = combatant.gameObject.GetComponent(AIComponent);
	
	var actionTaken : boolean = aiComp.DoNextAction();
}

} //AiTurnBrain