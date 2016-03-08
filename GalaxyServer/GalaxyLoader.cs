using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class GalaxyLoader : MonoBehaviour {

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
					star.Position = new Vector3( 0.18f*entry.Value.Position.x, 0.18f*entry.Value.Position.y, 0.18f*entry.Value.Position.z);
					star.Color = entry.Value.StarColor;
					star.Radius = 0.15f * entry.Value.Radius;
					customStarfield.Stars.Add(star);
				}

				customStarfield.Regenerate();

				loaded = true;
			}
		}
	}
}

}
