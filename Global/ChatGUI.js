#pragma strict

class ChatEntry
{
	var text : String;
	var color : Color;
}

class ChatGUI extends MonoBehaviour
{

private var guiNativeHeight = 480.0;

private var mGuiInFocus = false;
private var mFocusFrameCount = 0;

private var MAX_MESSAGES : int = 40;
var mChatLog : List.<ChatEntry>;

var mScrollPosition : Vector2 = Vector2.zero;

var mSmallLog : boolean = true;

private static var mInstance : ChatGUI;
static function Get()
{
	return mInstance;
}

function Awake() 
{
	mInstance = this;
	mChatLog = new List.<ChatEntry>();
}

function Start()
{

}

function SetGuiInFocus()
{
	mGuiInFocus = true;
	mFocusFrameCount = 5;
}

function IsGuiInFocus()
{
	return mGuiInFocus;
}

function OnGUI() 
{
	var scaleValue = Screen.height/guiNativeHeight;
	var guiScale: Vector3;
	guiScale.x = scaleValue;
    guiScale.y = scaleValue; 
    guiScale.z = 1;
    
    if (mFocusFrameCount == 0)
		mGuiInFocus = false;
	else
		mFocusFrameCount--;
    
    var unscaledMatrix = GUI.matrix;
    GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, guiScale);

	OnChatWindow();
	
	GUI.matrix = unscaledMatrix;
}

function AddChatMessage(string:String)
{
    AddChatMessage(string, Color.white);
}

function AddChatMessage(string:String, color : Color)
{
	var entry : ChatEntry = new ChatEntry();
    entry.text = string;
    entry.color = color;
    
    mChatLog.Add(entry);

    if(mChatLog.Count > MAX_MESSAGES)
        mChatLog.RemoveAt(0);
        
    mScrollPosition.y = 10000;
}

function GetFormatedChatLogText()
{
	var text : String;
	
	for (var i : int = 0; i < mChatLog.Count; i++)
	{
		text += mChatLog[i].text;
		text += "\n";
	}
	
	return text;
}
  
function OnChatWindow()
{
	var windowX : int = 550;
	#if UNITY_IPHONE
	windowX = 425;
	#endif

	if (mSmallLog)
	{
		GUILayout.BeginArea(Rect (windowX,10,220,120), GUIContent("", "onChat"));
			GUILayout.Box(GUIContent("Drone Log", "onChat"));
			GUILayout.BeginScrollView(mScrollPosition);            
				GUILayout.TextArea(GetFormatedChatLogText(), GUILayout.ExpandHeight(true));
			GUILayout.EndScrollView();
			
			if (GUILayout.Button(GUIContent("Expand", "onChat")))
			{
				mSmallLog = false;
			}
		GUILayout.EndArea();
	}
	else
	{
		GUILayout.BeginArea(Rect (windowX,10,220,370), GUIContent("", "onChat"));
			GUILayout.Box(GUIContent("Drone Log", "onChat"));
			GUILayout.BeginScrollView(mScrollPosition);            
				GUILayout.TextArea(GetFormatedChatLogText(), GUILayout.ExpandHeight(true));
			GUILayout.EndScrollView();
			
			if (GUILayout.Button(GUIContent("Collapse", "onChat")))
			{
				mSmallLog = true;
			}
		GUILayout.EndArea();
	}
	
	if (GUI.tooltip)
		SetGuiInFocus();
}

} //ChatGUI
	