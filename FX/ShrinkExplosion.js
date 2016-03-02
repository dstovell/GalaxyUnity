#pragma strict

private var fullScale : float;
private var growRate : float;
private var shrinkRate : float;
private var shrinking : int;

function Start () 
{
	fullScale = transform.localScale.x;
	transform.localScale.x = 0.5;
	transform.localScale.y = 0.5;
	transform.localScale.z = 0.5;
	growRate = 0.3;
	shrinkRate = 0.1;
	shrinking = 0;
}

function Update () 
{
	var renderer = gameObject.GetComponent(Renderer);
	if (renderer && renderer.enabled)
	{
		if (!shrinking && (transform.localScale.x >= fullScale))
		{
			shrinking = 1;
		}
		
		if (!shrinking)
		{
			transform.localScale.x += growRate;
			transform.localScale.y += growRate;
			transform.localScale.z += growRate;
		}
		else
		{
			transform.localScale.x -= shrinkRate;
			transform.localScale.y -= shrinkRate;
			transform.localScale.z -= shrinkRate;
		}
		
		if (shrinking && (transform.localScale.x < 3.0))
		{
			Destroy(gameObject.transform.root.gameObject);
		}
	}
}