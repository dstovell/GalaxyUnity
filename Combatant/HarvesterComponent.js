#pragma strict

class HarvesterComponent extends MonoBehaviour
{

private var mCollectionDistance : float = 30.0;
private var mResources : GameObject[];

private var line : VectorLine = null;
static var glowLineMaterial : Material;

private var combatComp : CombatComponent;

function Start() 
{
	combatComp = gameObject.GetComponent(CombatComponent);
	mResources = GameObject.FindGameObjectsWithTag("Resource");
	
	if (!glowLineMaterial)
		glowLineMaterial = Resources.Load("VectorLineGlow") as Material;
}

function NearestResource() : GameObject 
{
	var nearestDist : float = 99999.0;
	var nearestResouce : GameObject = null;
	for (var i=0; i<mResources.length; i++)
	{
		var dist : float = Vector3.Distance(mResources[i].transform.position, transform.position);
		if (!nearestResouce || (dist < nearestDist))
		{
			nearestResouce = mResources[i];
			nearestDist = dist;
		}
	}
	
	return nearestResouce;
}

function IsHarvesting() : boolean 
{
	if (line)
		return true;
		
	return false;
}

function FixedUpdate() 
{
	var shouldCollect : boolean = false;
	var resourcePos : Vector3 = Vector3.zero;
	for (var i=0; i<mResources.length; i++)
	{
		if (Vector3.Distance(mResources[i].transform.position, transform.position) <= mCollectionDistance)
		{
			shouldCollect = true;
			resourcePos = mResources[i].transform.position;
			break;
		}
	}
	
	if (combatComp && combatComp.IsDead())
	{
		shouldCollect = false;
	}
	
	var points : Vector3[] = new Vector3[2];
	points[0] = transform.position;
	points[1] = resourcePos;
	
	if (shouldCollect && !line)
	{
		//line = new VectorLine("Conn", points, Color.cyan, glowLineMaterial, 50, LineType.Discrete, Joins.Weld);
		//line.Draw3DAuto();
	}
	else if (!shouldCollect && line)
	{
		VectorLine.Destroy(line);
		line = null;
	}
	else if (line)
	{
		//line.Resize(points);
	}
}

}