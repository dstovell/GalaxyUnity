#pragma strict

class FactionNode
{
	var name : String;
	var color : Color;
	var isLocalPlayer : boolean;
	var isHuman : boolean;
}

class TerritoryNode
{
	var star : StarNode;
	var owner : FactionNode;
	var isCapitol : boolean;
	var isDiscovered : boolean;
}

class CombatantNode
{
	var configName : String;
	var componentNames : String[];
	var health : float;
}

class FleetNode
{
	var owner : FactionNode;
	var locationStar : StarNode;
	var ships : List.<CombatantNode>;
}

class BaseNode
{
	var owner : FactionNode;
	var locationPlanet : PlanetNode;
}

static class FactionManager extends MonoBehaviour
{
	var factions : List.<FactionNode>;
	var territories : List.<TerritoryNode>;
	var fleets : List.<FleetNode>;
	var bases : List.<BaseNode>;
	
	function Init()
	{
		if (!factions)
		{
			factions = new List.<FactionNode>();
			territories = new List.<TerritoryNode>();
			fleets = new List.<FleetNode>();
			bases = new List.<BaseNode>();
		}
	}
	
	function AddFaction(name : String, color : Color, isHuman : boolean, isLocalPlayer : boolean)
	{
		if (GetFaction(name) != null)
			return;
			
		Debug.Log("AddFaction name=" + name);
	
		var faction : FactionNode = new FactionNode();
		faction.name = name;
		faction.color = color;
		faction.isHuman = isHuman;
		faction.isLocalPlayer = isLocalPlayer;
		
		//The local player has to be human, for now?
		if (isLocalPlayer) faction.isHuman = true;
		
		factions.Add(faction);
	}
	
	function GetFaction(name : String) : FactionNode
	{
		for (var i=0; i<factions.Count; i++)
		{
			if (factions[i].name == name)
				return factions[i];
		}
		return null;
	}
	
	function ChangeTerritoryNeighboursToDiscovered(star : StarNode, factionName : String)
	{
		if (star.connections)
		{
			for (var i=0; i<star.connections.Count; i++)
			{
				if (star.connections[i])
				{
					ChangeTerritoryToDiscovered(star.connections[i].startStar, factionName);
					ChangeTerritoryToDiscovered(star.connections[i].endStar, factionName);
				}
			}
		}
	}
	
	function ChangeTerritoryToDiscovered(star : StarNode, factionName : String)
	{
		var faction : FactionNode = GetFaction(factionName);
		if (!faction)
			return;
	
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
			{
				territories[i].isDiscovered = true;
				return;
			}
		}
	
		var territory : TerritoryNode = new TerritoryNode();
		territory.star = star;
		territory.isDiscovered = true;
		territory.owner = faction = null;
		territory.isCapitol = false;
		
		territories.Add(territory);
	}
	
	function ChangeTerritoryControl(star : StarNode, factionName : String, newCapitol : boolean)
	{
		var faction : FactionNode = GetFaction(factionName);
		if (!faction)
			return;
	
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
			{
				territories[i].owner = faction;
				territories[i].isCapitol = newCapitol;
				return;
			}
		}
	
		var territory : TerritoryNode = new TerritoryNode();
		territory.star = star;
		territory.owner = faction;
		territory.isDiscovered = false;
		territory.isCapitol = newCapitol;
		
		territories.Add(territory);
	}
	
	function ClearTerritoryControl(star : StarNode)
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
			{
				territories.RemoveAt(i);
				return;
			}
		}
	}
	
	function IsTerritoryControlled(star : StarNode) : boolean
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
				return (territories[i].owner != null);
		}
		return false;
	}
	
	function IsTerritoryDiscovered(star : StarNode) : boolean
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
				return territories[i].isDiscovered;
		}
		return false;
	}
	
	function IsTerritoryCapitol(star : StarNode) : boolean
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
				return territories[i].isCapitol;
		}
		return false;
	}
	
	function GetFactionCapitol(factionName : String) : TerritoryNode
	{	
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].isCapitol && (territories[i].owner.name == factionName))
				return territories[i];
		}
		return null;
	}
	
	function GetTerritoryOwner(star : StarNode) : FactionNode
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
				return territories[i].owner;
		}
		return null;
	}
	
	function GetTerritoryOwnerName(star : StarNode) : String
	{
		for (var i=0; i<territories.Count; i++)
		{
			if (territories[i].star == star)
			{
				if (territories[i].owner)
				{
					return territories[i].owner.name;
				}
				break;
			}
		}
		return "None";
	}
	
	function GetTerritoryColor(star : StarNode) : Color
	{
		for (var i=0; i<territories.Count; i++)
		{
			if ((territories[i].star == star) && territories[i].owner)
				return territories[i].owner.color;
		}
		return Color.black;
	}
	
	function BuildBase(planet : PlanetNode, factionName : String)
	{
		var faction : FactionNode = GetFaction(factionName);
		Debug.Log("BuildBase factionName="+factionName+" faction="+faction+ " planet.name=" + planet.GetName());
		if (!faction)
			return;
	
		var base : BaseNode = new BaseNode();
		base.owner = faction;
		base.locationPlanet = planet;
		
		bases.Add(base);
	}
	
	function FindBase(planet : PlanetNode) : BaseNode
	{
		for (var i=0; i<bases.Count; i++)
		{
			if (bases[i].locationPlanet == planet)
				return bases[i];
		}
		return null;
	}
	
	function BuildFleet(star : StarNode, factionName : String, flagShipConfig : String)
	{
		var faction : FactionNode = GetFaction(factionName);
		Debug.Log("BuildFleet factionName="+factionName+" faction="+faction);
		if (!faction)
			return;
	
		var fleet : FleetNode = new FleetNode();
		fleet.owner = faction;
		fleet.locationStar = star;
		fleet.ships = new List.<CombatantNode>();
		
		var flagShip : CombatantNode = new CombatantNode();
		flagShip.configName = flagShipConfig;
		fleet.ships.Add(flagShip);
		
		fleets.Add(fleet);
		
		//After create, everything is discovered
		FactionManager.ChangeTerritoryNeighboursToDiscovered(star, factionName);
	}
	
	function MoveFleet(fleet : FleetNode, star : StarNode)
	{
		//For now, instant move
		fleet.locationStar = star;
		
		//After move, everything is discovered
		FactionManager.ChangeTerritoryNeighboursToDiscovered(star, fleet.owner.name);
	}
	
	function IsTerritoryOccupied(star : StarNode) : boolean
	{
		for (var i=0; i<fleets.Count; i++)
		{
			if (fleets[i].locationStar == star)
				return true;
		}
		return false;
	}
	
	function TerritoryOccupier(star : StarNode) : FleetNode
	{
		for (var i=0; i<fleets.Count; i++)
		{
			if (fleets[i].locationStar == star)
				return fleets[i];
		}
		return null;
	}
}