#pragma strict

import Vectrosity;

static class ShapeTool extends MonoBehaviour
{

function GetArcPoints(combatant : GameObject, arcRange : float, arcAperture : float) : Vector3[]
{
	//x = r cos(t)    y = r sin(t)
	var arcPoints : Vector3[] = new Vector3[7];
	var startAngle : float = (-1.0 * arcAperture / 2.0) + 90;
	var deltaAngle : float = arcAperture / (arcPoints.length-3.0);
	
	arcPoints[0] = combatant.transform.position;
	for (var i = 1; i < arcPoints.length-1; i++)
	{
		arcPoints[i] = new Vector3(arcRange*Mathf.Cos(startAngle*Mathf.Deg2Rad), 0, arcRange*Mathf.Sin(startAngle*Mathf.Deg2Rad));
		arcPoints[i] = combatant.transform.TransformDirection(arcPoints[i]);
		arcPoints[i] += combatant.transform.position;
		startAngle += deltaAngle;
	}
	arcPoints[arcPoints.length-1] = combatant.transform.position;
	
	return arcPoints;
}

function IsInCombatantArc(point : Vector3, combatant : GameObject, arcRange : float, arcAperture : float) : boolean
{
	var maxDistance : float = arcRange*1;
	var lookDirection : Vector3 = combatant.transform.TransformDirection(Vector3.forward);
	var coneBase : Vector3 = combatant.transform.position + maxDistance*lookDirection;
	var coneAngle : float = arcAperture * Mathf.Deg2Rad;
	
	if ( IsPointInCone(point, combatant.transform.position, coneBase, maxDistance, coneAngle) )
		return true;
	else
		return false;
}

function IsPointInCone(point : Vector3, t : Vector3, b : Vector3, maxDistance : float, aperture : float)
{
	// This is for our convenience
    var halfAperture : float = aperture/2;

    // Vector pointing to X point from apex
    var apexToXVect : Vector3 = t - point;

    // Vector pointing from apex to circle-center point.
    var axisVect : Vector3 = t - b;

    // X is lying in cone only if it's lying in 
    // infinite version of its cone -- that is, 
    // not limited by "round basement".
    // We'll use dotProd() to 
    // determine angle between apexToXVect and axis.
    // We can safely compare cos() of angles 
    // between vectors instead of bare angles.
    var isInInfiniteCone : boolean = 
    			(Vector3.Dot(apexToXVect, axisVect) / apexToXVect.magnitude / axisVect.magnitude) > Mathf.Cos(halfAperture);

    if(!isInInfiniteCone) return false;

    // X is contained in cone only if projection of apexToXVect to axis
    // is shorter than axis. 
    // We'll use dotProd() to figure projection length.
    var isUnderRoundCap : boolean = (Vector3.Dot(apexToXVect, axisVect) / axisVect.magnitude) < axisVect.magnitude;
    
    if(!isUnderRoundCap) return false;
    
    var isTooFarAway : boolean = apexToXVect.magnitude > maxDistance;
    return !isTooFarAway;
}

function GetPolyPoints(center : Vector3, sides : int, polySize : float, startAngle : float)
{
	var sidePoints : Vector3[] = new Vector3[sides+1];
    var sidesFloat : float = sides;

    var step : float = ( 2 * Mathf.PI ) / sidesFloat;
	var halfPolySize = polySize / 2.0;

    for( var i : int = 0; i < sides; i++ )
    {
       	var relativePoint : Vector3 = new Vector3(Mathf.Cos(i*step + startAngle)*halfPolySize, 0, Mathf.Sin(i*step + startAngle)*halfPolySize);
		sidePoints[i] = relativePoint + center;
    }
    sidePoints[sides] = sidePoints[0];
    
    
    return sidePoints;
}

function GetArrowPoints(center : Vector3, arrowSize : float, dir : Vector3)
{
	var sideSize : float = arrowSize*0.35;
	var points : Vector3[] = new Vector3[4];
	points[0] = center + dir*sideSize;
	points[1] = center + Vector3.Cross(dir, Vector3.up).normalized * sideSize*0.4;
	points[2] = center + Vector3.Cross(Vector3.up, dir).normalized * sideSize*0.4;
	points[3] = points[0];
	
	return points;
}

} // ShapeTool 