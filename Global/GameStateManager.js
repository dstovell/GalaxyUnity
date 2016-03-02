#pragma strict

class CombatLocale
{
	var star : StarNode;
	var planet : PlanetNode;
	var owner : FactionNode;
}

class CombatTeam
{
	var teamTag : String;
	var faction : FactionNode;
	var fleet : FleetNode;
}

static class GameStateManager extends MonoBehaviour
{

var MAX_COMBAT_TEAMS : int = 2;

private var mTeamMapping : CombatTeam[];
private var mNumTeams : int = 0;
private var mLocale : CombatLocale;

function Init()
{
	mTeamMapping = new CombatTeam[MAX_COMBAT_TEAMS];
}

function IsCampaignCombat()
{
	return ((mNumTeams>0) && (mLocale != null));
}

function AddTeam(tag : String, faction : FactionNode, fleet : FleetNode)
{
	if (mNumTeams >= MAX_COMBAT_TEAMS)
		return;

	mTeamMapping[mNumTeams] = new CombatTeam();
	mTeamMapping[mNumTeams].teamTag = tag;
	mTeamMapping[mNumTeams].faction = faction;
	mTeamMapping[mNumTeams].fleet = fleet;
	mNumTeams++;
}

function GetFactionByTag(tag : String) : FactionNode
{
	for (var i=0; i<MAX_COMBAT_TEAMS; i++)
	{
		if (mTeamMapping[i] && mTeamMapping[i].teamTag == tag)
			return mTeamMapping[i].faction;
	}
	return null;
}

function GetFleetByTag(tag : String) : FleetNode
{
	for (var i=0; i<MAX_COMBAT_TEAMS; i++)
	{
		if (mTeamMapping[i] && mTeamMapping[i].teamTag == tag)
			return mTeamMapping[i].fleet;
	}
	return null;
}

function ClearTeams()
{
	for (var i=0; i<MAX_COMBAT_TEAMS; i++)
	{
		mTeamMapping[i] = null;
	}
	mNumTeams = 0;
}

function SetLocale(star : StarNode, planet : PlanetNode, owner : FactionNode)
{
	mLocale = new CombatLocale();
	mLocale.star = star;
	mLocale.planet = planet;
	mLocale.owner = owner;
}

function ClearLocale()
{
	mLocale = null;
}

function GetLocale() : CombatLocale
{
	return mLocale;
}

function Clear()
{
	ClearTeams();
	ClearLocale();
}


} //GameStateManager