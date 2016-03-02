#pragma strict

function Start () 
{
	if (gameObject.GetComponent.<Renderer>())
	{
		var renderer = gameObject.GetComponent(Renderer);
		if (renderer != null)
		{
			renderer.enabled = false;
		}
	}
}
