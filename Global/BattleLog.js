#pragma strict


static class BattleLog extends MonoBehaviour
{
	function AddToLog(msg : String)
	{
		if (ChatGUI.Get())
		{
			ChatGUI.Get().AddChatMessage(msg);
		}
	}
	
	function OnBeginTurn(turnNumber : int)
	{
		var msg : String = "Begin Turn " + turnNumber.ToString();
		AddToLog(msg);
	}
	
	function GetName(obj : GameObject)
	{
		if (obj.tag == "Team2")
		{
			return "Blue Drone";
		}
		else
		{
			return "Red Drone";
		}
	}

	function OnAttackSuccess(attacker : GameObject, target : GameObject, weaponName : String, damage : int, wasKillShot : boolean)
	{
		if (wasKillShot)
		{
			var killMsg : String = GetName(attacker) + " destroyed " + GetName(target);
			AddToLog(killMsg);
		}
		else
		{
			var msg : String = GetName(attacker) + " hit " + GetName(target);
			AddToLog(msg);
		}
	}
	
	function OnAttackFailure(attacker : GameObject, target : GameObject, weaponName : String)
	{
		AddToLog( GetName(attacker) + " missed " + GetName(target) );
	}

} // GridTool 