#pragma strict

import SimpleJSON;

static class WebTool extends MonoBehaviour
{

var mBaseUrl : String = "http://droneserver-alpha.elasticbeanstalk.com";
//var mBaseUrl : String = "http://localhost:1337";

var mEmail : String = "";
var mPassword : String = "";
var mLoginToken : String = "";
var mUserColor : Color = Color.cyan;

function Init() 
{
	mEmail = PlayerPrefs.GetString("email", "");
	mPassword = PlayerPrefs.GetString("password", "");
	
	FactionManager.Init();
}

function CreateUser(email : String, password : String)
{
	var url : String = mBaseUrl + "/l/createUser?username=" + email + "&password=" + password;
	
	var webRequest : WWW = new WWW(url);
	
	yield webRequest;
	
	if (!webRequest.error)
	{
		StoreUserData(email, password);
	}
}

function LoginUser(email : String, password : String)
{
	var url : String = mBaseUrl + "/l/loginUser?username=" + email + "&password=" + password;
	
	var webRequest : WWW = new WWW(url);
	
	yield webRequest;
	
	if (!webRequest.error)
	{
		StoreUserData(email, password);
		StoreLoginData(webRequest.text);
	}
}

function AttemptAutoLogin()
{
	if ((mEmail != "") && (mPassword != ""))
	{
		var url : String = mBaseUrl + "/l/loginUser?username=" + mEmail + "&password=" + mPassword;
	
		var webRequest : WWW = new WWW(url);
	
		yield webRequest;
		
		if (!webRequest.error)
		{
			StoreLoginData(webRequest.text);
		}
	}
}

function Logout()
{
	if ((mEmail != ""))
	{
		var url : String = mBaseUrl + "/l/logoutUser?username=" + mEmail;
	
		var webRequest : WWW = new WWW(url);
	
		mLoginToken = "";
	}
}

function ForgetUserData()
{
	StoreUserData("", "");
}

function StoreUserData(email : String, password : String)
{
	mEmail = email;
	PlayerPrefs.SetString("email", email);
	
	mPassword = password;
	PlayerPrefs.SetString("password", password);
}

function StoreLoginData(jsonText : String)
{
	var json : JSONNode = JSON.Parse(jsonText);
	if (json["token"] != null)
	{
		mLoginToken = json["token"];
	}
	
	FactionManager.AddFaction(GetStoredUsername(), mUserColor, true, true);
}

function IsUserCreated()
{
	return (mEmail != "");
}

function IsLoggedIn()
{
	return (mLoginToken != "");
}

function GetStoredUsername()
{
	if (mEmail == "")
		return "";

	var words = mEmail.Split("@"[0]);
	
	return words[0];
}

function GetStoredEmail()
{
	return mEmail;
}

function GetStoredPassword()
{
	return mPassword;
}

} //WebTool