using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class StarComponent : MonoBehaviour 
{
	public SgtStarfieldStar starSprite = null;
	public StarData starData = null;
	public GameObject model = null;

	private Camera galaxyCamera = null;

	void Awake() 
	{
		galaxyCamera = Camera.main;
	}

	void Start() 
	{
	}

	void Update()
	{
	}

	void FixedUpdate() 
	{
		//var rotationRate = 12.0 * Time.fixedDeltaTime;
		
		//transform.RotateAround(transform.position, Vector3.up, rotationRate);
	}

	void OnMouseDown()
	{
		//ON SELECTED Message...
	}

	void CreateModel()
	{
//Needed??
/*#if UNITY_IPHONE
	    if (obj.collider)
	    {
	        var sphereCollider : SphereCollider = obj.collider as SphereCollider;
	        sphereCollider.radius *= 3.0;
	    }
#endif*/
	}

	public void DestroyModel()
	{
		if (this.model != null)
		{
			GameObject.Destroy(this.model);
		}
	}

	static private GameObject _gameObject = new GameObject();
	static public void Create(Transform parent, StarData starData, SgtStarfieldStar starSprite)
	{
		GameObject obj = GameObject.Instantiate(_gameObject, starData.Position, Quaternion.identity) as GameObject;
		StarComponent starComp = obj.AddComponent<StarComponent>();
		starComp.starData = starData;
		starComp.starSprite = starSprite;

		obj.transform.SetParent(parent);
	}

	/*static private var prefabs : GameObject[] = null;
	static function InitPrefabs()
	{
		if (prefabs)
			return;

		prefabs = new GameObject[StarType.NumTypes];
		
		prefabs[StarType.Red] = Resources.Load("Star_Red") as GameObject;
		prefabs[StarType.Yellow] = Resources.Load("Star_Yellow") as GameObject;
		prefabs[StarType.Blue] = Resources.Load("Star_Blue") as GameObject;
	}
	*/
}

}
