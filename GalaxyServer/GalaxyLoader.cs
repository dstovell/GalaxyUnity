using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class GalaxyLoader : MonoBehaviour {

	public Sprite starSprite = null;

	private bool loaded = false;

	// Use this for initialization
	void Start () 
	{
	}
	
	// Update is called once per frame
	void Update () 
	{
		if (GameflowManager.Instance.galaxyManager.IsConnected())
		{
			if (!loaded)
			{
				SgtCustomStarfield customStarfield = this.gameObject.GetComponent<SgtCustomStarfield>();

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

					StarComponent.Create(this.transform, entry.Value, star);
				}

				Camera.main.depthTextureMode = DepthTextureMode.Depth;

				customStarfield.Regenerate();

				loaded = true;
			}
		}
	}
}

}
