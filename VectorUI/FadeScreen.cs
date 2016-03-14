using UnityEngine;
using System.Collections;

public class FadeScreen : GS.MessengerListener 
{
	//private float targetAlpha = 0.0f;
	//private float fadeTime = 0.0f;
	private float fadeDuration = 7.0f;
	private UnityEngine.UI.Image image;
	float fontSize = 0.2f;
	bool intialFade = false;

	// Use this for initialization
	public void Start () 
	{
		this.InitMessenger("FadeScreen");

		//this.gameObject.GetComponent<Image>
		this.image = this.gameObject.GetComponent<UnityEngine.UI.Image>();
	}

	public void OnGUI() 
	{
		if (intialFade)
		{
			fontSize -= 0.001f;
		}
		fontSize = Mathf.Max(fontSize, 0.0f);
		if (fontSize == 0.0f)
		{
			return;
		}

		GUI.backgroundColor = Color.black;
		GUIStyle style = new GUIStyle(GUI.skin.label);
		//style.fontStyle = FontStyle.Bold;
		style.richText = true;
		style.fontSize = Mathf.FloorToInt(VectorShape.ScaleSize(fontSize));
		style.wordWrap = true; 
		//style.fontStyle
		float boarderSize = 6.0f;
		float sizeX =  0.6f*Screen.width;
		float sizeY =  0.6f*Screen.height;
		float x = 0.13f*Screen.width;
		float y = 0.13f*Screen.height;
		Rect buttonRect = new Rect(x, y, sizeX, sizeY);

		string colorHex = "#00ffffff";

		GUILayout.BeginArea(buttonRect);
		//GUILayout.Label("<color=cyan>" + this.text + "</color>", style);
		GUILayout.Box("<color=" + colorHex + ">the galaxy</color>", style);
		GUILayout.EndArea();
		//GUI.Label(buttonRect, "<color=cyan>" + this.text + "</color>", style);
	}

	public override bool OnMessage(string id, object obj1, object obj2)
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
				return false;
			}

			case "fade_out":
			{
				if (image != null)
				{
					this.image.CrossFadeAlpha(1.0f, this.fadeDuration, true);
				}
				return false;
			}

			default:break;
		}

		return false;
	}

}
