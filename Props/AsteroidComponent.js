#pragma strict

class AsteroidComponent extends MonoBehaviour
{

private var mMajorAxis : Vector3;

function Start() 
{
	if (gameObject.GetComponent.<Renderer>())
	{
		var bounds : Bounds = new Bounds();
		var renderer = gameObject.GetComponent(Renderer);
		if (!renderer)
		{
			bounds = renderer.bounds;
		}
		
		if ((bounds.size.x > bounds.size.y) && (bounds.size.x > bounds.size.z))
			mMajorAxis = Vector3(1.0, 0.0, 0.0);
		else if ((bounds.size.y > bounds.size.x) && (bounds.size.y > bounds.size.z))
			mMajorAxis = Vector3(0.0, 1.0, 0.0);
		else 
			mMajorAxis = Vector3(0.0, 0.0, 1.0);
	}
}

function FixedUpdate() 
{
	var rotationRate = 12.0 * Time.fixedDeltaTime;
	
	transform.RotateAround(transform.position, mMajorAxis, rotationRate);
}

}