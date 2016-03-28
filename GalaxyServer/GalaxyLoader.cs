using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

	public class GalaxyStar 
	{
		private SgtStarfieldStar starSprite = null;
		private StarData starData = null;
		private float intialRadius = 0.0f;
	
		public GalaxyStar(StarData _starData, SgtStarfieldStar _starSprite)
		{
			this.starData = _starData;
			this.starSprite = _starSprite;
			if (this.starSprite != null)
			{
				this.intialRadius = this.starSprite.Radius;
			}
		}

		public void OnUpdate()
		{
			
		}
	
		public void OnMessage(string id, object obj1, object obj2)
		{
	
			switch(id)
			{
				case "solarsystemview_onbegin":
				{
					if (this.starSprite != null)
					{
						this.starSprite.Radius = 0.0001f;
					}
					break;
				}
	
				case "starview_reached":
				{
					if (this.starSprite != null)
					{
						this.starSprite.Radius = this.intialRadius;
					}
					break;
				}
	
				default:break;
			}

			Debug.Log("this.starSprite.Radius=" + this.starSprite.Radius );
		}
	}
	
	public class GalaxyLoader : MessengerListener {
	
		public Sprite starSprite = null;
	
		private bool loaded = false;
	
		private Dictionary<int, GalaxyStar> stars;

		private SgtCustomStarfield customStarfield;
	
		void Awake() 
		{
			this.stars = new Dictionary<int, GalaxyStar>();
			InitMessenger("GalaxyLoader");
		}
		
		// Update is called once per frame
		void Update () 
		{
			if (GameflowManager.Instance.galaxyManager.IsConnected())
			{
				if (!loaded)
				{
					this.customStarfield = this.gameObject.GetComponent<SgtCustomStarfield>();
	
					Galaxy galaxy = GameflowManager.Instance.galaxyManager.galaxy;
					foreach(KeyValuePair<int, StarData> entry in galaxy.Stars)
					{
						SgtStarfieldStar star = new SgtStarfieldStar();
						star.Position = new Vector3( entry.Value.Position.x, entry.Value.Position.y, entry.Value.Position.z);
						star.Color = entry.Value.StarColor;
						star.Radius = 0.75f*entry.Value.Radius;
						if (this.starSprite != null)
						{
							star.Sprite = this.starSprite;
						}
						customStarfield.Stars.Add(star);

						this.stars[entry.Value.id] = new GalaxyStar(entry.Value, star);
					}
	
					//Camera.main.depthTextureMode = DepthTextureMode.Depth;
	
					this.customStarfield.Regenerate();
	
					loaded = true;
				}
			}
		}
	
		public override void OnMessage(string id, object obj1, object obj2)
		{
	
			switch(id)
			{

				case "starview_onbegin":
				case "starview_reached":
				case "solarsystemview_onbegin":
				{
					StarData data = obj1 as StarData;
					Debug.Log("Looking for star id=" + data.id);
					if (this.stars.ContainsKey(data.id))
					{
						Debug.Log("Calling OnMessage(" + id + ") star id=" + data.id);
						this.stars[data.id].OnMessage(id, obj1, obj2);
						this.customStarfield.Regenerate();
						//SgtCustomStarfield customStarfield = this.gameObject.GetComponent<SgtCustomStarfield>();
						//customStarfield.Regenerate();
					}
					break;
				}
	
				default:break;
			}
		}
	}

}
