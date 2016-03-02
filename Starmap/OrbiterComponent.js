#pragma strict

class OrbiterComponent extends MonoBehaviour
{

var orbitTarget : GameObject = null;
var orbitDistance : float;

var orbitSpeed : float;

function Start()
{
	if (orbitTarget)
	{
		var center = orbitTarget.transform.position;
		transform.RotateAround(center, Vector3.up, Random.Range(0.0, 360.0));
	}
	
	orbitSpeed = (3*360) / (orbitDistance * orbitDistance);
}

function Update() 
{
	if (orbitTarget)
	{
		var center = orbitTarget.transform.position;
		transform.RotateAround(center, Vector3.up, orbitSpeed * Time.deltaTime);
	}
}


}