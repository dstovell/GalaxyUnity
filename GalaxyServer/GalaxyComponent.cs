using UnityEngine;
using System.Collections;

namespace GS
{

public class GalaxyComponent : MessengerListener 
{
	public GameObject galaxyStars;
	public GameObject galaxyZoomer;
	public GameObject galaxyTranslator;
	public GameObject galaxyLookAtPoint;

	private bool moving = false;
	private Vector3 targetPosition;
	private Vector3 targetLookAtPosition;
	private Vector3 previousPosition;
	private Vector3 previousLookAtPosition;
	private float maxZoom = 20.0f;
	private float targetZoom = -1.0f;
	private float previousZoom = 0.5f;
	private float moveTime = 0.0f;
	private float moveDuration = 5.0f;
	private float fullZoom = 0.0f;
	private Vector3 fullZoomPosition;
	private float fullZoomCameraVertical = 0.0f;

	private SgtCustomStarfield starfield;
	private KGFOrbitCam orbitCam;
	private StarData targetStar;

	public void Awake()
	{
		this.InitMessenger("GalaxyComponent");
		this.starfield = galaxyStars.GetComponent<SgtCustomStarfield>();
		this.orbitCam = Camera.main.gameObject.GetComponent<KGFOrbitCam>();
	}

	public void Start() 
	{
		this.fullZoom = this.galaxyZoomer.transform.localScale.x;
		this.fullZoomPosition = this.galaxyTranslator.transform.localPosition;
		this.fullZoomCameraVertical = this.orbitCam.itsRotation.itsVertical.itsStartValue;
	}

	public void MoveToTarget(Vector3 target, float zoom)
	{
		this.previousZoom = this.galaxyZoomer.transform.localScale.x;
		this.previousPosition = this.galaxyTranslator.transform.localPosition;
		this.previousLookAtPosition = this.galaxyLookAtPoint.transform.localPosition;

		this.moveTime = 0.0f;
		this.targetPosition = new Vector3(-1.0f*target.x, -1.0f*target.y, -1.0f*target.z);
		this.targetLookAtPosition = target;
		this.targetZoom = zoom;
		this.moving = true;
	}

	public void RestoreInital()
	{
		MoveToTarget(this.fullZoomPosition, this.fullZoom);
	}

	public void Update() 
	{
		float t = this.moveTime/this.moveDuration;
		if ((this.moving) && (this.galaxyTranslator != null))
		{
			Vector3 pos = Math.interpolateVector(this.previousPosition, this.targetPosition, t*t*t);
			galaxyTranslator.transform.localPosition = pos;

			//float lookAtT = Mathf.Max(Mathf.Min(1.0f, 1.5f*t-0.5f), 0.0f);
			Vector3 lookAt = Math.interpolateVector(this.previousLookAtPosition, this.targetLookAtPosition, t*t*t);
			this.galaxyLookAtPoint.transform.localPosition = lookAt;
		}
		if ((this.targetZoom > 0.0) && (this.galaxyZoomer != null))
		{
			float tValue = (this.targetZoom > this.previousZoom) ? Mathf.Pow(t, 3.0f) : (1.0f -  Mathf.Pow((1.0f-t), 3));
			float zoom = Mathf.Lerp(this.previousZoom, this.targetZoom, tValue);
			galaxyZoomer.transform.localScale = new Vector3(zoom, zoom, zoom);

			float rotationAngle = Mathf.Lerp(this.fullZoomCameraVertical, this.fullZoomCameraVertical-40.0f, (this.maxZoom - zoom)/(this.maxZoom/this.fullZoom));
			this.orbitCam.SetRotationVertical(rotationAngle);
		}

		this.moveTime += Time.deltaTime;

		if (t >= 1.0f)
		{
			if (this.targetZoom == this.maxZoom)
			{
				this.SendMessengerMsg("starview_reached", this.targetStar);
			}
			this.moving = false;
			this.targetZoom = -1.0f;
		}
	}

	public override void OnMessage(string id, object obj1, object obj2)
	{

		switch(id)
		{
			case "starview_selected":
			{
				StarData data = obj1 as StarData;
				this.targetStar = data;
				MoveToTarget(data.Position, this.maxZoom);
				break;
			}

			case "galaxyview_selected":
			{
				RestoreInital();
				break;
			}

			default:break;
		}
	}
}

}

