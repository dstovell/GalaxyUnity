#pragma strict

import Vectrosity;
import SimpleJSON;

enum StarMapViewMode
{
	Galaxy,
	SolarSystem
}

enum StarConnectionType
{
	Regular,
	WormHole,
	
	NumTypes
}

class Node
{
	var index : int;
}

class StarNode
{
	var index : int;
	var rendererIndex : int;
	var position : Vector3;
	var model : GameObject;
	var ringModel : GameObject;
	var territoryModel : GameObject;
	var fleetModel : GameObject;
	var fleetLine : VectorLine;
	var node : Node;
	
	var givenName : String = "";
	
	var connections : List.<StarConnectionNode>;
	
	var planets : List.<PlanetNode>;
	
	var type : StarType = StarType.Red;
	
	private var orbitLineResolution : int = 150;
	
	function GetName() : String
	{
		if (givenName.Length > 0)
			return givenName;
		else
			return "ST-" + index;
	}
	
	function Save() : JSONNode
	{
		var json : JSONClass = new JSONClass();
		json["index"].AsInt = index;
		json["posX"].AsFloat = position.x;
		json["posY"].AsFloat = position.y;
		json["posZ"].AsFloat = position.z;
		json["type"].AsInt = type;
		json["givenName"].Value = givenName;
		
		if (planets)
		{
			json["planets"] = new JSONArray();
			for (var i=0; i<planets.Count; i++)
			{
				if (planets[i])
				{
					var planetNode : JSONNode = planets[i].Save();
					json["planets"][-1] = planetNode;
				}
			}
		}
		
		return json;
	}
	
	function Load(json : JSONNode)
	{
		index = json["index"].AsInt;
		position.x = json["posX"].AsFloat;
		position.y = json["posY"].AsFloat;
		position.z = json["posZ"].AsFloat;
		type = json["type"].AsInt;
		givenName = json["givenName"].Value;
		
		connections = new List.<StarConnectionNode>();
		planets = new List.<PlanetNode>();
		
		for (var i=0; i<json["planets"].Count; i++)
		{
			var planet : PlanetNode = new PlanetNode();
			planet.Load(json["planets"][i]);
			planet.parentStar = this;
			planets.Add(planet);
		}
	}
	
	function Init(_index : int, _type : StarType, _position : Vector3)
	{
		index = _index;
		connections = new List.<StarConnectionNode>();
		planets = new List.<PlanetNode>();
		type = _type;
		position = _position;
	}
		
	function SetViewMode(viewMode : StarMapViewMode, target : StarNode)
	{
		var isControlled : boolean = FactionManager.IsTerritoryControlled(this);
		var i : int = 0;
		var destroyPlanets : boolean = false;
		if (viewMode == StarMapViewMode.Galaxy)
		{
			if (!FactionManager.IsTerritoryDiscovered(this))
				return;
		
			if (!model)
			{
				model = StarComponent.Instantiate(type, position);
			}
			InitComponents();
			model.GetComponent.<Light>().enabled = false;
			if (target == this)
				OnSelected();
				
			if (fleetModel)
				GameObject.Destroy(fleetModel);
			if (fleetLine)
				VectorLine.Destroy(fleetLine);
		}
		else if (viewMode == StarMapViewMode.SolarSystem)
		{
			if (target != this)
			{
				Destroy();
				return;
			}
			GameObject.Destroy(ringModel);
			GameObject.Destroy(territoryModel);
			model.GetComponent.<Light>().enabled = true;
			
			if (FactionManager.IsTerritoryOccupied(this))
			{
				if (!fleetModel)
				{
					var scaleParam : float = 0.008;
					var orbitDist : float = 8.0;
					var fleetPos : Vector3 = model.transform.position + Vector3(0.0, 0.25, orbitDist);
					fleetModel = GameObject.Instantiate(StarMap.fleetModelPrefab, fleetPos, Quaternion.Euler(0, 90, 0)) as GameObject;
					fleetModel.transform.localScale = Vector3(scaleParam, scaleParam, scaleParam);
					var orbiter : OrbiterComponent = fleetModel.AddComponent(OrbiterComponent);
					orbiter.orbitTarget = model;
					orbiter.orbitDistance = orbitDist;
					
					//fleetLine = new VectorLine("Orbit", new Vector3[orbitLineResolution], Color.grey, StarMap.normalLineMaterial, 3, LineType.Continuous, Joins.Weld);
					//fleetLine.MakeCircle(model.transform.position, Vector3.up, orbitDist);
					//fleetLine.Draw3DAuto();
				}
			}
		}
		
		if (planets)
		{
			for (i=0; i<planets.Count; i++)
			{
				if (planets[i])
				{
					planets[i].SetViewMode(viewMode, target);
				}
			}
		}
	}
	
	function InitComponents()
	{
		var starComp : StarComponent = model.GetComponent(StarComponent);
		if (starComp)
		{
			starComp.type = type;
			starComp.starNode = this;
		}
		
		var color : Color = Color.white;
		var width : float = 5;
		var mat : Material = StarMap.normalLineMaterial;
		if (FactionManager.IsTerritoryControlled(this))
		{
			color = FactionManager.GetTerritoryColor(this);
		}
		
		if (StarMap.connectionRing)
		{
			StarMap.connectionRing.UpdateColor(rendererIndex, color);
		}
		
		if (connections)
		{
			for (var i=0; i<connections.Count; i++)
			{
				if (connections[i])
					connections[i].Update();
			}
		}
		
		var scale : float = StarComponent.GetSize(type);
		if (!ringModel)
		{
			if (FactionManager.IsTerritoryCapitol(this))
				ringModel = GameObject.Instantiate(StarMap.starRingCapitolPrefab, position, StarMap.starRingPrefab.transform.rotation) as GameObject;
			else
				ringModel = GameObject.Instantiate(StarMap.starRingPrefab, position, StarMap.starRingPrefab.transform.rotation) as GameObject;
			if (FactionManager.IsTerritoryOccupied(this))
			{
				var fleetRing : GameObject = GameObject.Instantiate(StarMap.fleetRingPrefab, position, StarMap.starRingPrefab.transform.rotation) as GameObject;
				var faction : FactionNode = FactionManager.TerritoryOccupier(this).owner;
				SetColor(fleetRing, faction.color);
				fleetRing.transform.parent = ringModel.transform;
			}
				
			var ringSize : float = 6.0;//ringModel.transform.localScale.x;
			//ringModel.transform.localScale = Vector3(scale*ringSize, scale*ringSize, 1);
			ringModel.transform.localScale = Vector3(scale*ringSize, 1, scale*ringSize);
		}
		SetRingColor(color);
		
		if (FactionManager.IsTerritoryControlled(this))
		{
			/*if (!territoryModel)
			{
				territoryModel = GameObject.Instantiate(StarMap.starTerritoryPrefab, position, StarMap.starTerritoryPrefab.transform.rotation) as GameObject;
				territoryModel.transform.position.y -= 1 + Random.Range(0.0, 0.1);
				var territorySize : float = StarMap.minStarDistance * 1.5;
				territoryModel.transform.localScale = Vector3(territorySize, territorySize, 1);
			}
			territoryModel.renderer.materials[1].color = color;
			territoryModel.renderer.materials[1].color.a = 0.2;*/
		}
	}
	
	function SetRingColor(color : Color)
	{
		if (!ringModel)
			return;
	
		if (ringModel.GetComponent.<Renderer>())
			ringModel.GetComponent.<Renderer>().material.color = color;
	
		for (var i : int = 0; i < ringModel.transform.childCount; i++)
		{
			var obj : GameObject = ringModel.transform.GetChild(i).gameObject;
			if (obj && obj.GetComponent.<Renderer>())
			{
				obj.GetComponent.<Renderer>().material.color = color;
			}
		}
	}
	
	function SetColor(gameObject : GameObject, color : Color)
	{
		for (var i : int = 0; i < gameObject.transform.childCount; i++)
		{
			var obj : GameObject = gameObject.transform.GetChild(i).gameObject;
			if (obj && obj.GetComponent.<Renderer>())
			{
				obj.GetComponent.<Renderer>().material.color = color;
			}
				
			if (gameObject.transform.GetChild(i).childCount > 0)
			{
				SetColor(gameObject.transform.GetChild(i).gameObject, color);
			}
		}
	}
	
	function SetRingMotion(enabled : boolean)
	{
		if (!ringModel)
			return;
			
		SetMotion(ringModel, enabled);
	}
	
	function SetMotion(gameObject : GameObject, enabled : boolean)
	{
		for (var i : int = 0; i < gameObject.transform.childCount; i++)
		{				
			if (gameObject.transform.GetChild(i).childCount > 0)
			{
				SetMotion(gameObject.transform.GetChild(i).gameObject, enabled);
			}
		}
	}
	
	function OnSelected()
	{
		SetRingMotion(true);
	}
	
	function OnUnSelected()
	{
		SetRingMotion(false);
	}
	
	function GetPosition()
	{
		return position;
	}
	
	function Destroy()
	{
		var i : int = 0;
	
		if (model)
		{
			model.tag = "";
			GameObject.Destroy(model);
			GameObject.Destroy(ringModel);
			GameObject.Destroy(territoryModel);
			model = null;
		}
		
		if (planets)
		{
			for (i=0; i<planets.Count; i++)
			{
				if (planets[i])
				{
					planets[i].Destroy();
				}
			}
		}
	}
	
	function AddConnection(conn : StarConnectionNode)
	{
		connections.Add(conn);
	}
	
	function IsConnectedTo(star : StarNode)
	{
		if ((star == this) || (star == null))
			return false;
	
		for (var i=0; i<connections.Count; i++)
		{
			if ((connections[i].startStar == star) || (connections[i].endStar == star))
			{
				return true;
			}
		}
		
		return false;
	}
	
	function IsConnectedToAnything()
	{
		return (connections.Count > 0);
	}
}

class PlanetNode
{
	var parentStar : StarNode;
	var orbitDistance : float;
	var model : GameObject;
	var starbaseModel : GameObject;
	var type : PlanetType;
	var prefabIndex : int;
	private var line : VectorLine = null;
	private var starbaseLine : VectorLine = null;
	
	private var orbitLineResolution : int = 150;
	
	var givenName : String = "";
	
	function GetName() : String
	{
		if (givenName.Length > 0)
			return givenName;
		else
			return parentStar.GetName() + " " + phoneticAlphabet[GetIndex()];
	}
	
	static var phoneticAlphabet : String[] = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Kilo", "Lima"];
	
	function GetIndex()
	{
		for (var i=0; parentStar.planets.Count; i++)
		{
			if (parentStar.planets[i] == this)
				return i;
		}
		
		return 0;
	}
	
	function Save() : JSONNode
	{
		var json : JSONClass = new JSONClass();
		json["orbitDistance"].AsFloat = orbitDistance;
		json["type"].AsInt = type;
		json["prefabIndex"].AsInt = prefabIndex;
		json["givenName"].Value = givenName;
		
		return json;
	}
	
	function Load(json : JSONNode)
	{
		orbitDistance = json["orbitDistance"].AsFloat;
		type = json["type"].AsInt;
		prefabIndex = json["prefabIndex"].AsInt;
		givenName = json["givenName"].Value;
	}
	
	function HasStarBase() : boolean
	{
		var base : BaseNode = FactionManager.FindBase(this);
		return (base != null);
	}
	
	function Init(_parentStar : StarNode, _type : PlanetType, _prefabIndex : int, _orbitDistance : float)
	{
		parentStar = _parentStar;
		orbitDistance = _orbitDistance;
		type = _type;
		prefabIndex = _prefabIndex;
	}

	function SetViewMode(viewMode : StarMapViewMode, target : StarNode)
	{
		if (viewMode == StarMapViewMode.Galaxy)
		{
			Destroy();
		}
		else if (viewMode == StarMapViewMode.SolarSystem)
		{
			if (target == parentStar)
			{
				if (!model)
				{
					model = PlanetComponent.Instantiate(type, prefabIndex, GetStartPosition(), this);
					InitComponents();
					
					//line = new VectorLine("Orbit", new Vector3[orbitLineResolution], Color.grey, StarMap.normalLineMaterial, 3, LineType.Continuous, Joins.Weld);
					//line.MakeCircle(parentStar.GetPosition(), Vector3.up, orbitDistance);
					//line.Draw3DAuto();
				}
				
				if (HasStarBase() && !starbaseModel)
				{
					var baseOrbit : float = 2.0;
					var scaleParam : float = 0.008 / model.transform.localScale.x;
				
					starbaseModel = GameObject.Instantiate(StarMap.starBaseModelPrefab) as GameObject;
					starbaseModel.transform.parent = model.transform;
					starbaseModel.transform.localPosition = Vector3(0.0, 0.25, baseOrbit);
					starbaseModel.transform.localScale = Vector3(scaleParam, scaleParam, scaleParam);
					var orbiter : OrbiterComponent = starbaseModel.AddComponent(OrbiterComponent);
					orbiter.orbitTarget = model;
					orbiter.orbitDistance = 10; //For orbit speed...
					
					//starbaseLine = new VectorLine("Orbit", new Vector3[orbitLineResolution], Color.grey, StarMap.normalLineMaterial, 3, LineType.Continuous, Joins.Weld);
					//starbaseLine.MakeCircle(Vector3.zero, Vector3.up, baseOrbit);
					//starbaseLine.Draw3DAuto(Mathf.Infinity, model.transform);
				}
			}
			else
			{
				Destroy();
			}
		}
	}
	
	function InitComponents()
	{
		var orbiter : OrbiterComponent = model.GetComponent(OrbiterComponent);
		if (orbiter)
		{
			orbiter.orbitTarget = parentStar.model;
			orbiter.orbitDistance = orbitDistance;
		}
		
		var planetComp : PlanetComponent = model.GetComponent(PlanetComponent);
		if (planetComp)
		{
			planetComp.type = type;
			planetComp.planetNode = this;
		}
	}
	
	function GetStartPosition()
	{
		var pos : Vector3 = parentStar.GetPosition();
		pos.x += orbitDistance;
		return pos;
	}
	
	function Destroy()
	{
		if (model)
		{
			GameObject.DestroyImmediate(model);
			model = null;
		}
		
		if (line)
		{
			VectorLine.Destroy(line);
			line = null;
		}
		
		if (starbaseModel)
		{
			GameObject.DestroyImmediate(starbaseModel);
			starbaseModel = null;
		}
		
		if (starbaseLine)
		{
			VectorLine.Destroy(starbaseLine);
			starbaseLine = null;
		}
	}
}

class StarConnectionNode
{
	var startStar : StarNode;
	var endStar : StarNode;
	var type : StarConnectionType;
	var rendererIndex : int;
	
	function Save() : JSONNode
	{
		var json : JSONClass = new JSONClass();
		json["startStar"].AsInt = startStar.index;
		json["endStar"].AsFloat = endStar.index;
		json["type"].AsInt = type;
		return json;
	}
	
	function Load(json : JSONNode, stars : StarNode[])
	{
		startStar = stars[ json["startStar"].AsInt ];
		endStar = stars[ json["endStar"].AsInt ];
		type = json["type"].AsInt;
		
		startStar.AddConnection(this);
		endStar.AddConnection(this);
	}
	
	function Init(start : StarNode,	end : StarNode, _type : StarConnectionType)
	{
		startStar = start;
		endStar = end;
		type = _type;
		
		startStar.AddConnection(this);
		endStar.AddConnection(this);
	}
	
	function GetColorStart() : Color
	{
		var color : Color = Color.white;
		if (FactionManager.IsTerritoryControlled(startStar))
		{
			color = FactionManager.GetTerritoryColor(startStar);
		}
		if (!FactionManager.IsTerritoryDiscovered(startStar))
		{
			color.a = 0.0;
		}
		return color;
	}
	
	function GetColorEnd() : Color
	{
		var color : Color = Color.white;
		if (FactionManager.IsTerritoryControlled(endStar))
		{
			color = FactionManager.GetTerritoryColor(endStar);
		}
		if (!FactionManager.IsTerritoryDiscovered(endStar))
		{
			color.a = 0.0;
		}
		return color;
	}
	
	function GetColor() : Color
	{
		var color : Color = Color.white;
		if (FactionManager.IsTerritoryControlled(startStar))
		{
			var colorStart = FactionManager.GetTerritoryColor(startStar);
			var colorEnd = FactionManager.GetTerritoryColor(endStar);
			if (colorStart == colorEnd)
				color = colorEnd;
		}
		if (!FactionManager.IsTerritoryDiscovered(startStar) || !FactionManager.IsTerritoryDiscovered(endStar))
		{
			color.a = 0.0;
		}
		return color;
	}
	
	function SetViewMode(viewMode : StarMapViewMode, target : StarNode)
	{
		if (viewMode == StarMapViewMode.Galaxy)
		{
		}
		else if (viewMode == StarMapViewMode.SolarSystem)
		{
		}
	}
	
	function GetPoints() : Vector3[]
	{
		var dirV : Vector3 = (startStar.GetPosition() - endStar.GetPosition()).normalized;
		var multiplier : float = StarMap.starRingRadius;
	
		var points : Vector3[] = new Vector3[2];
		points[0] = startStar.GetPosition() - multiplier*dirV;
		points[1] = endStar.GetPosition() + multiplier*dirV;
		return points;
	}
	
	function Update()
	{
		StarMap.connectionLine.UpdateColor(rendererIndex, GetColor());
	}
}

static class StarMap extends MonoBehaviour
{
	var regularStarConnectionDistance : float = 160;
	var minStarDistance : float = 80;
	var starRingRadius : float = 14;
	var starRingPrefab : GameObject;
	var starRingCapitolPrefab : GameObject;
	var starTerritoryPrefab : GameObject;
	var fleetRingPrefab : GameObject;
	var fleetModelPrefab : GameObject;
	var starBaseModelPrefab : GameObject;
	
	var minPlanetCount : int = 3;
	var maxPlanetCount : int = 7;
	
	var minPlanetOrbitIncrement : float = 1;
	var maxPlanetOrbitIncrement : float = 3;
		
	static var glowLineMaterial : Material;
	static var normalLineMaterial : Material;
	
	var viewMode : StarMapViewMode = StarMapViewMode.Galaxy;
	var lastViewTarget : StarNode;

	var stars : StarNode[] = null;
	var connections : StarConnectionNode[] = null;
	
	var connectionRing : ShapeRenderer;
	var connectionLine : ShapeRenderer;

	var territory : GameObject;
	
	function IsAvailable() : boolean
	{
		return (stars && (stars.Length > 0));
	}
	
	function InitPrefabs()
	{
		StarComponent.InitPrefabs();
		PlanetComponent.InitPrefabs();
		starRingPrefab = Resources.Load("StarRing");
		starRingCapitolPrefab = Resources.Load("StarRingCapitol");
		starTerritoryPrefab = Resources.Load("StarTerritory");
		fleetRingPrefab = Resources.Load("FleetRing");
		fleetModelPrefab = Resources.Load("carrier_01_blue");
		starBaseModelPrefab = Resources.Load("StationSmall");
	}
	
	function DestroyPrefabs()
	{
		StarComponent.DestroyPrefabs();
		PlanetComponent.DestroyPrefabs();
	}
	
	function InitMaterials()
	{
		if (!glowLineMaterial)
			glowLineMaterial = Resources.Load("VectorLineGlow") as Material;
			
		if (!normalLineMaterial)
			normalLineMaterial = Resources.Load("VectorLine") as Material;
	}
	
	function Clear()
	{
		var i = 0;
		if (connections)
		{
			for (i=0; i<connections.Length; i++)
			{
				if (connections[i])
				{
					connections[i] = null;
				}
			}
			connections = null;
		}
		
		if (stars)
		{
			for (i=0; i<stars.Length; i++)
			{
				stars[i].Destroy();
				stars[i] = null;
			}
			stars = null;
		}
		
		DestroyLineRendering();
	}
	
	function PrepareForLevelLoad()
	{
		DestroyLineRendering();
	}
	
	function GenerateStarMapForFaction(factionName : String)
	{
		var mapSize = Vector2(600, 600);
		StarMap.Generate(25, Vector3(-1*mapSize.x/2.0, 0, mapSize.y/2.0), Vector3(mapSize.x/2.0, 0, -1*mapSize.y/2.0));
		
		FactionManager.BuildFleet(StarMap.stars[0], factionName, "LightCarrier");
		
		GenerateAIFaction("Red Pirates", Color.red, 5);
		GenerateAIFaction("Yellow Pirates", Color.yellow, 5);
	}
	
	function GenerateAIFaction(factionName : String, factionColor : Color, starCount : int)
	{
		FactionManager.AddFaction(factionName, factionColor, false, false);
	
		for (var i=0; i<stars.Length; i++)
		{
			var thisStar : StarNode = stars[stars.Length-i-1];
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				FactionManager.ChangeTerritoryControl(thisStar, factionName, true);
				FactionManager.BuildBase(thisStar.planets[0], factionName);
				
				GenerateTerritory(thisStar, factionName, factionColor, starCount-1);
				return;
			}
		}
	}
	
	function GenerateTerritory(startStar : StarNode, factionName : String, factionColor : Color, starCount : int) : int
	{
		var starsAdded : int = 0;
		var i : int = 0;
		var thisStar : StarNode = null;
		for (i=0; i<startStar.connections.Count; i++)
		{
			if (startStar.connections[i].startStar == startStar)
				thisStar = startStar.connections[i].endStar;
			else
				thisStar = startStar.connections[i].startStar;
			
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				FactionManager.ChangeTerritoryControl(thisStar, factionName, false);
				FactionManager.BuildBase(thisStar.planets[0], factionName);
				starCount--;
				starsAdded++;
			}
			if (starCount <= 0)
				return starsAdded;
		}
		
		for (i=0; i<startStar.connections.Count; i++)
		{
			if (startStar.connections[i].startStar == startStar)
				thisStar = startStar.connections[i].endStar;
			else
				thisStar = startStar.connections[i].startStar;
			
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				var newStars : int = GenerateTerritory(thisStar, factionName, factionColor, starCount);
				starCount -= newStars;
				starsAdded += newStars;
				if (starCount <= 0)
					return starsAdded;
			}
		}
		
		return starsAdded;
	}
	
	function Generate(starCount : int, cornerA : Vector3, cornerB : Vector3)
	{
		InitMaterials();
		InitPrefabs();

		CreateStars(starCount, cornerA, cornerB);
		CreateConnections();
		
		CreatePlanets();
	}
	
	function CreateStars(starCount : int, cornerA : Vector3, cornerB : Vector3)
	{
		stars = new StarNode[starCount];
		for (var i=0; i<starCount; i++)
		{
			stars[i] = new StarNode();
			
			var pos : Vector3 = RandomStarPosition(cornerA, cornerB);
			var type : StarType = StarComponent.RandomType();
			
			stars[i].Init(i, type, pos);
		}
	}
	
	function ShouldLinkStars(starA : StarNode, starB : StarNode) : boolean
	{
		if (starA == starB)
			return false;
	
		if (starA.IsConnectedTo(starB))
			return false;
			
		var dist = Vector3.Distance(starA.GetPosition(), starB.GetPosition());
		
		return (dist < regularStarConnectionDistance);
	}
	
	function AreStarsAligned(starA : StarNode, starB : StarNode) : boolean
	{
		var dist = Vector3.Distance(starA.GetPosition(), starB.GetPosition());
	
		var alignDist = minStarDistance - 5.0; //???
		if ((dist % alignDist) < (alignDist*0.1))
		{
			return true;
		}
		return false;
	}
	
	function UpdateTerritories()
	{
		//Disable for now
		return;
	
		var i : int = 0;
		var CIRCLE_POINTS : int = 20;
		var CIRCLE_SIZE : float = minStarDistance * 1.1;
		var starCount : int = 0;
		for (i=0; i<stars.Length; i++)
		{
			if (FactionManager.IsTerritoryControlled(stars[i]))
			{
				starCount++;
			}
		}		
		
		var points : Vector2[] = new Vector2[starCount * CIRCLE_POINTS];
		var pointIndex : int = 0;
		for (i=0; i<stars.Length; i++)
		{
			if (FactionManager.IsTerritoryControlled(stars[i]))
			{
				var circlePoints : Vector3[] = ShapeTool.GetPolyPoints(stars[i].GetPosition(), CIRCLE_POINTS, CIRCLE_SIZE, 0.0);
				for (var j=0; j<CIRCLE_POINTS; j++)
				{
					var newPoint : Vector2 = new Vector2(circlePoints[j].x, circlePoints[j].z);
					if (newPoint != Vector2.zero)
					{
						points[pointIndex] = new Vector2(circlePoints[j].x, circlePoints[j].z);
						pointIndex++;
					}
				}
			}
		}
		
		print("UpdateTerritories pointIndex=" + pointIndex + " starCount=" + starCount);
		if (pointIndex == 0)
			return;	
	
		DestroyTerritories();
		
		//var outline : VectorLine = new VectorLine("Outline", new Vector3[2], Color.cyan, StarMap.glowLineMaterial, 3, LineType.Discrete, Joins.Weld);
		//outline.MakeWireframe( territory.GetComponent(MeshFilter).mesh );
		//outline.Draw3DAuto();
	}
	
	function DestroyTerritories()
	{
		if (territory)
			GameObject.Destroy(territory);
	}
	
	function CreateConnections()
	{
		var i : int = 0;
		var j : int = 0;
		var dist : float = 0;
		
		connections = new StarConnectionNode[stars.Length*stars.Length];
		
		var connectionIndex = 0;
		for (i=0; i<stars.Length; i++)
		{
			for (j=0; j<i; j++)
			{
				if ( ShouldLinkStars(stars[j], stars[i]) )
				{
					connections[connectionIndex] = new StarConnectionNode();
					connections[connectionIndex].Init(stars[j], stars[i], StarConnectionType.Regular);
					connectionIndex++;
				}
			}
		}
		
		for (i=0; i<stars.Length; i++)
		{
			if (!stars[i].IsConnectedToAnything())
			{
				var closestStar : StarNode = null;
				var closestDist : float = 99999.0;
				for (j=0; j<stars.Length; j++)
				{
					var areConnectable : boolean = true;
					
					var thisDist = Vector3.Distance(stars[j].GetPosition(), stars[i].GetPosition());
					if ((i != j) && (closestDist > thisDist) && areConnectable)
					{
						closestStar = stars[j];
						closestDist = thisDist;						
					}
				}
				if (closestStar)
				{
					connections[connectionIndex] = new StarConnectionNode();
					connections[connectionIndex].Init(closestStar, stars[i], StarConnectionType.Regular);
					connectionIndex++;
				}
			}
		}
	}
	
	function SetupLineRendering()
	{
		var i : int = 0;
	
		/*if (!connectionRing)
		{
			connectionRing  = new ShapeRenderer();
			if (useHexGrid)
			{
				connectionRing.InitForShapes(ShapeType.Hex, stars.Length, normalLineMaterial, 5);
				for (i=0; i<stars.Length; i++)
				{
					stars[i].rendererIndex = connectionRing.AddHex(stars[i].GetPosition(), Vector3.up, 2.0*starRingRadius, Color.grey, (Mathf.PI / 2.0));
				}
			}
			else
			{
				connectionRing.InitForShapes(ShapeType.Circle, stars.Length, normalLineMaterial, 5);
				for (i=0; i<stars.Length; i++)
				{
					stars[i].rendererIndex = connectionRing.AddCircle(stars[i].GetPosition(), Vector3.up, starRingRadius, Color.grey);
				}
			}
		}*/
		
		if (!connectionLine)
		{
			var connectionCount : int = 0;
			for (i=0; i<connections.Length; i++)
			{
				if (connections[i] )//&& (FactionManager.IsTerritoryDiscovered(startStar) || FactionManager.IsTerritoryDiscovered(endStar)))
					connectionCount++;
			}
		
			connectionLine = new ShapeRenderer();
			connectionLine.InitForShapes(ShapeType.LineSegment, connectionCount, normalLineMaterial, 5);
			for (i=0; i<connectionCount; i++)
			{
				if (connections[i] )//&& (FactionManager.IsTerritoryDiscovered(startStar) || FactionManager.IsTerritoryDiscovered(endStar)))
				{
					var linePoints : Vector3[] = connections[i].GetPoints();
					connections[i].rendererIndex = connectionLine.AddLineSegment(linePoints[0], linePoints[1], connections[i].GetColor());
				}
			}
		}
	}
	
	function DestroyLineRendering()
	{	
		if (connectionRing)
		{
			connectionRing.StopRendering();
			connectionRing = null;
		}
		
		if (connectionLine)
		{
			connectionLine.StopRendering();
			connectionLine = null;
		}
	}
	
	function SetViewFactionCapitol(factionName : String) : StarNode
	{
		var territory : TerritoryNode = FactionManager.GetFactionCapitol(factionName);
		if (territory)
		{
			SetViewMode(StarMapViewMode.Galaxy, territory.star);
			return territory.star;
		}
		else
		{
			for (var i=0; i<stars.Length; i++)
			{
				if (stars[i] && FactionManager.IsTerritoryOccupied(stars[i]))
				{
					SetViewMode(StarMapViewMode.Galaxy, stars[i]);
					return stars[i];
				}
			}
			
			SetViewMode(StarMapViewMode.Galaxy, stars[0]);
			return stars[0];
		}
	}
	
	function RefreshViewMode()
	{
		SetViewMode(viewMode, lastViewTarget);
	}
	
	function SetViewMode(_viewMode : StarMapViewMode, target : StarNode)
	{
		SetupLineRendering();
	
		viewMode = _viewMode;
		lastViewTarget = target;
		var i : int = 0;
		for (i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				stars[i].SetViewMode(viewMode, target);
			}
		}
		
		for (i=0; i<connections.Length; i++)
		{
			if (connections[i])
			{
				connections[i].SetViewMode(viewMode, target);
			}
		}
		
		if (_viewMode == StarMapViewMode.Galaxy)
		{
			if(connectionRing) connectionRing.BeginRendering();
			connectionLine.BeginRendering();
			
			UpdateTerritories();
		}
		else if (_viewMode == StarMapViewMode.SolarSystem)
		{
			if(connectionRing) connectionRing.StopRendering();
			connectionLine.StopRendering();
			
			DestroyTerritories();
		}
	}
	
	function FindStarNode(starObject : GameObject)
	{
		for (var i=0; i<stars.Length; i++)
		{
			if (stars[i] && (stars[i].model == starObject))
			{
				return stars[i];
			}
		}
		return null;
	}
	
	function RandomPosition(cornerA : Vector3, cornerB : Vector3)
	{
		var position: Vector3 = Vector3(Random.Range(cornerA.x, cornerB.x), Random.Range(cornerA.y, cornerB.y), Random.Range(cornerA.z, cornerB.z));
		return position;
	}
	
	function IsNearStar(pos : Vector3)
	{
		for (var i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				var dist : float = Vector3.Distance(pos, stars[i].GetPosition());
				if (dist < minStarDistance)
					return true;
			}
		}
		return false;
	}
	
	function RandomStarPosition(cornerA : Vector3, cornerB : Vector3)
	{
		var position : Vector3 = Vector3.zero;
		for (var i=0; i<200; i++)
		{
			position = RandomPosition(cornerA, cornerB);
			
			if (!IsNearStar(position))
				return position;
		}
		
		return position;
	}
	
	private static function SortPlanetByType(p1 : PlanetNode, p2 : PlanetNode) 
	{
		if (p1.type == p2.type)
			return 0;
    	if (p1.type > p2.type)
    		return 1;
    	else
    		return -1;
	}
	
	function CreatePlanets()
	{
		for (var i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				var j=0;
				var planetCount : int = Random.Range(minPlanetCount, maxPlanetCount);
				for (j=0; j<planetCount; j++)
				{
					var planet = new PlanetNode();
					var type : PlanetType = PlanetComponent.RandomType();
					var prefabIndex : int = PlanetComponent.GetRandomPrefabIndex(type);
					planet.Init(stars[i], type, prefabIndex, 0);
					stars[i].planets.Add(planet);
				}
				
				stars[i].planets.Sort(SortPlanetByType);
				
				var orbitDistance : float = StarComponent.GetSize(stars[i].type) - minPlanetOrbitIncrement;
				for (j=0; j<planetCount; j++)
				{
					orbitDistance += Random.Range(minPlanetOrbitIncrement, maxPlanetOrbitIncrement);
					orbitDistance += PlanetComponent.GetSize(stars[i].planets[j].type) * 2.0;
					stars[i].planets[j].orbitDistance = orbitDistance;
				}
			}
		}
	}
	
	private var JSON_VERSION : int = 3;
	
	function Save() : JSONNode
	{
		var i : int = 0;
	
		var json : JSONClass = new JSONClass();
		
		json["version"].AsInt = JSON_VERSION;
		
		json["stars"] = new JSONArray();
		for (i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				var starNode : JSONNode = stars[i].Save();
				json["stars"][-1] = starNode;
			}
		}
		
		json["connections"] = new JSONArray();
		for (i=0; i<connections.Length; i++)
		{
			if (connections[i])
			{
				var connectionNode : JSONNode = connections[i].Save();
				json["connections"][-1] = connectionNode;
			}
		}
		
		return json;
	}
	
	function IsVersionCorrect(json : JSONNode) : boolean
	{
		if (json["version"] != null)
		{
			if (json["version"].AsInt == JSON_VERSION)
			{
				return true;
			}
		}
		
		return false;
	}
	
	function Load(json : JSONNode)
	{
		var i : int = 0;
		
		if (json["stars"])
		{
			stars = new StarNode[json["stars"].Count];
			for (i=0; i<json["stars"].Count; i++)
			{
				stars[i] = new StarNode();
				stars[i].Load(json["stars"][i]);
			}
		}
		
		if (json["connections"])
		{
			connections = new StarConnectionNode[json["connections"].Count];
			for (i=0; i<json["connections"].Count; i++)
			{
				connections[i] = new StarConnectionNode();
				connections[i].Load(json["connections"][i], stars);
			}
		}
	}
	
	function SaveLocal()
	{
		var json : JSONNode = Save();
		var jsonString : String = json.ToString();
		PlayerPrefs.SetString("StarMap", jsonString);
		PlayerPrefs.Save();
	}
	
	function LoadLocal()
	{
		var jsonString : String = PlayerPrefs.GetString("StarMap", "");
		if (jsonString)
		{
			var json : JSONNode = JSON.Parse(jsonString);
			if (!IsVersionCorrect(json))
				return false;
		
			InitMaterials();
			InitPrefabs();
		
			Load(json);
			//SetViewMode(StarMapViewMode.Galaxy, null);
			var capitol : StarNode = StarMap.SetViewFactionCapitol(WebTool.GetStoredUsername());
			StarMapCamera.Get().OnStarSelected(capitol.model);
			return true;
		}
		
		return false;
	}
	
	function ClearLocal()
	{
		PlayerPrefs.DeleteKey("StarMap");
	}

} // StarMap 