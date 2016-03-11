using UnityEngine;
using System.Collections;

namespace GS
{

public class GalaxyComponent : MessengerListener 
{
	public GameObject galaxyZoomer;
	public GameObject galaxyTranslator;

	private bool moving = false;
	private Vector3 targetPosition;
	private Vector3 previousPosition;
	private float targetZoom = -1.0f;
	private float previousZoom = 0.5f;
	private float moveTime = 0.0f;
	private float moveDuration = 20.0f;

	public void Awake()
	{
		this.InitMessenger("GalaxyComponent");
	}

	public void Start() 
	{
	}

	public void MoveToTarget(Vector3 target, float zoom)
	{
		this.moveTime = 0.0f;
		this.targetPosition = new Vector3(-1.0f*target.x, -1.0f*target.y, -1.0f*target.z);
		this.targetZoom = zoom;
		this.moving = true;
	}

	public void Update() 
	{
		float t = this.moveTime/this.moveDuration;
		if ((this.moving) && (this.galaxyTranslator != null))
		{
			Vector3 pos = Math.interpolateVector(this.previousPosition, this.targetPosition, t);
			galaxyTranslator.transform.localPosition = pos;
		}
		if ((this.targetZoom > 0.0) && (this.galaxyZoomer != null))
		{
			float zoom = Mathf.Lerp(this.previousZoom, this.targetZoom, t*t*t);
			galaxyZoomer.transform.localScale = new Vector3(zoom, zoom, zoom);
		}

		this.moveTime += Time.deltaTime;

		if (t >= 1.0f)
		{
			this.moving = false;
			this.targetZoom = -1.0f;
		}
	}

	public override bool OnMessage(string id, object obj1, object obj2)
	{
		
		switch(id)
		{
			case "star_selected":
			{
				StarData data = obj1 as StarData;
				MoveToTarget(data.Position, 40.0f);
				//MoveToTarget(new Vector3(-249.0f, 123.0f, 11.0f), 40.0f);
				break;
			}

			default:break;
		}

		return false;
	}
}

}

