using UnityEngine;
using System.Collections;

namespace GS
{

public class GameflowManager : MonoBehaviour 
{
	public static GameflowManager Instance = null;

	public LoginManager loginManager = null;
	public GalaxyManager galaxyManager = null;

	void Awake()
	{
		if (Instance == null)
		{
			Instance = this;
		}
		loginManager = this.gameObject.AddComponent<LoginManager>();
		galaxyManager = this.gameObject.AddComponent<GalaxyManager>();
	}

	// Use this for initialization
	void Start() 
	{
		loginManager.LoginUser(delegate(string error, User user) {

			galaxyManager.GetGalaxy(delegate(string error2) {
				
			});
		});
	}
	
	// Update is called once per frame
	void Update () 
	{
	
	}
}

}
