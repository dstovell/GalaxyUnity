using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{


	public class SolarSystemComponent : MessengerListener 
	{
		public GameObject solarSystemZoomer;

		public GameObject starModel;

		public GameObject[] planetPrefabs;

		public List<GameObject> Planets;

		private bool moving = false;
		private float maxZoom = 1.0f;
		private float targetZoom = -1.0f;
		private float previousZoom = 0.5f;
		private float zoomTime = 0.0f;
		private float zoomDuration = 3.0f;
		private float initialZoom = 0.0f;

		private KGFOrbitCam orbitCam;
		private StarData targetStar;

		public void Awake()
		{
			this.InitMessenger("SolarSystemComponent");
			this.orbitCam = Camera.main.gameObject.GetComponent<KGFOrbitCam>();
			this.Planets = new List<GameObject>();
		}

		public void Start() 
		{
			this.initialZoom = this.solarSystemZoomer.transform.localScale.x;
		}

		public void ZoomToTarget(float zoom)
		{
			this.previousZoom = this.solarSystemZoomer.transform.localScale.x;

			this.zoomTime = 0.0f;
			this.targetZoom = zoom;
			this.moving = true;
		}

		public void RestoreInital()
		{
			ZoomToTarget(this.initialZoom);
		}

		public void Update() 
		{
			float t = this.zoomTime/this.zoomDuration;
			if ((this.targetZoom > 0.0) && (this.solarSystemZoomer != null))
			{
				float tValue = (this.targetZoom > this.previousZoom) ? Mathf.Pow(t, 3.0f) : (1.0f -  Mathf.Pow((1.0f-t), 3));
				float zoom = Mathf.Lerp(this.previousZoom, this.targetZoom, tValue);
				this.solarSystemZoomer.transform.localScale = new Vector3(zoom, zoom, zoom);
			}

			this.zoomTime += Time.deltaTime;

			if (t >= 1.0f)
			{
				if (this.targetZoom == this.maxZoom)
				{
					//this.SendMessengerMsg("solarsystemview_reached", this.targetStar);
				}
				this.moving = false;
				this.targetZoom = -1.0f;
			}
		}

		public void CreateSolarSystem()
		{
			if (this.starModel != null)
			{
				this.starModel.gameObject.SetActive(true);

				float starModelSize = this.targetStar.Radius * 100.0f;
				this.starModel.transform.localScale = new Vector3(starModelSize, starModelSize, starModelSize);
				for (int i=0; i<this.targetStar.Planets.Count; i++)
				{
					GS.PlanetData planetData = this.targetStar.Planets[i];
					GameObject planet = GameObject.Instantiate(this.planetPrefabs[0]);
					planet.transform.parent = this.gameObject.transform;
					float planetModelSize = planetData.Diameter * 4.0f;
					planet.transform.localScale = new Vector3(planetModelSize, planetModelSize, planetModelSize);

					this.Planets.Add(planet);

					SgtSimpleOrbit orbit = planet.GetComponent<SgtSimpleOrbit>();
					if (orbit != null)
					{
						orbit.Radius = planetData.OribitalDistance * 200.0f;
						orbit.DegreesPerSecond = 20.0f / planetData.OribitalDistance;
					}
					SgtAtmosphere atmos = planet.GetComponent<SgtAtmosphere>();
					if (atmos != null)
					{
						atmos.Lights[0] = this.GetComponent<Light>();
					}

					SgtCloudsphere clouds = planet.GetComponent<SgtCloudsphere>();
					if (atmos != null)
					{
						clouds.Lights[0] = this.GetComponent<Light>();
					}
				}
			}
		}

		public void DestroySolarSystem()
		{
			if (this.starModel != null)
			{
				this.starModel.gameObject.SetActive(false);

				for (int i=0; i<this.Planets.Count; i++)
				{
					GameObject.Destroy(this.Planets[i]);
				}
				this.Planets.Clear();
			}
		}

		public override void OnMessage(string id, object obj1, object obj2)
		{
			switch(id)
			{
				case "starview_reached":
				{
					DestroySolarSystem();
					break;
				}

				case "starview_onbegin":
				{
					RestoreInital();
					break;
				}

				case "solarsystemview_onbegin":
				{
					StarData data = obj1 as StarData;
					this.targetStar = data;
					this.ZoomToTarget(this.maxZoom);
					this.CreateSolarSystem();
					break;
				}

				default:break;
			}
		}
	}

}