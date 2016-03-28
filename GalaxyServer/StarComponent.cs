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
	
	private float intialRadius = 0.0f;

	static private GameObject _gameObject = new GameObject();
	static public StarComponent Create(Transform parent, StarData starData, SgtStarfieldStar starSprite)
	{
		GameObject obj = GameObject.Instantiate(_gameObject, starData.Position, Quaternion.identity) as GameObject;
		StarComponent starComp = obj.AddComponent<StarComponent>();
		starComp.starData = starData;
		starComp.starSprite = starSprite;

		obj.transform.SetParent(parent);
		return starComp;
	}
}

}
