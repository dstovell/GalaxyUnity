using UnityEngine;
using System.Collections;

public class FadeScreen : GS.MessengerListener 
{
	private float fadeDuration = 7.0f;
	private UnityEngine.UI.Image image;
	private float fontSize = 0.05f;
	private string text = string.Empty;
	private bool intialFade = false;

	// Use this for initialization
	public void Start () 
	{
		this.InitMessenger("FadeScreen");

		//this.gameObject.GetComponent<Image>
		this.image = this.gameObject.GetComponent<UnityEngine.UI.Image>();
		this.text = "connecting to the galaxy...";
	}

	public void OnGUI() 
	{
		if (intialFade)
		{
			fontSize = 0.0f;
		}
		fontSize = Mathf.Max(fontSize, 0.0f);
		if (fontSize == 0.0f)
		{
			return;
		}

		GUI.backgroundColor = Color.black;
		GUIStyle style = new GUIStyle(GUI.skin.label);
		style.richText = true;
		style.fontSize = Mathf.FloorToInt(VectorShape.ScaleSize(fontSize));
		style.wordWrap = true;
		float boarderSize = 6.0f;
		float sizeX =  0.6f*Screen.width;
		float sizeY =  0.6f*Screen.height;
		float x = 0.12f*Screen.width;
		float y = 0.09f*Screen.height;
		Rect buttonRect = new Rect(x, y, sizeX, sizeY);

		string colorHex = "#00ffffff";

		GUILayout.BeginArea(buttonRect);
		GUILayout.Box("<color=" + colorHex + ">" + this.text + "</color>", style);
		GUILayout.EndArea();
	}

	public override void OnMessage(string id, object obj1, object obj2)
	{

		switch(id)
		{
			case "fade_in":
			{
				if (image != null)
				{
					this.image.CrossFadeAlpha(0.0f, this.fadeDuration, true);
				}
				this.intialFade = true;
				break;
			}

			case "fade_out":
			{
				if (image != null)
				{
					this.image.CrossFadeAlpha(1.0f, this.fadeDuration, true);
				}
				break;
			}

			default:break;
		}
	}

}
