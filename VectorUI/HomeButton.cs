using UnityEngine;
using System.Collections;

public class HomeButton : GS.MessengerListener 
{
	public void Awake()
	{
		
	}

	public void Spin()
	{
		this.TraverseSpinners(this.gameObject, true);
	}

	public void StopSpin()
	{
		this.TraverseSpinners(this.gameObject, false);
	}

	private void TraverseSpinners(GameObject obj, bool enable)
	{
		Spinner spin = obj.GetComponent<Spinner>();
		if (spin != null)
		{
			spin.enabled = enable;
		}
	    foreach (Transform child in obj.transform)
	    {
			TraverseSpinners(child.gameObject, enable);
	    }
	}

	public void OnMouseDown()
	{
		GS.Messenger.SendMessageFrom("HomeButton", "homebutton_clicked");
	}

	// Update is called once per frame
	public void Update() 
	{
		if (WebTool.IsRequestActive())
		{
			Spin();
		}
		else
		{
			Spin();
			//StopSpin();
		}
	}

	public override void OnMessage(string id, object obj1, object obj2)
	{
		switch(id)
		{
			default:break;
		}
	}

}
