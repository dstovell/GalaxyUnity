#pragma strict

class LoadingScreen extends MonoBehaviour
{

var screenGUI : GUITexture;

function Awake() 
{
	screenGUI = GetComponent(GUITexture);
	
	if (screenGUI)
	{
		screenGUI.enabled = false;
		screenGUI.pixelInset.x = 0;
		screenGUI.pixelInset.y = 0;
		screenGUI.pixelInset.height = Screen.height;
		screenGUI.pixelInset.width = Screen.width;
	}
}

}