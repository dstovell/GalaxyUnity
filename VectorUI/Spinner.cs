using UnityEngine;
using System.Collections;

public class Spinner : MonoBehaviour 
{
	public float spinRate = 0.0f;

	// Use this for initialization
	void Start () 
	{
	
	}
	
	// Update is called once per frame
	void Update () 
	{
		this.transform.Rotate(0, (spinRate * Time.deltaTime), 0);
	}
}
