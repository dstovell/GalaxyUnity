﻿using UnityEngine;
using System.Collections;

namespace GS
{

public class User
{
	public User(Hashtable json)
	{
		this.deviceId = ResultParse.String("deviceId", json, string.Empty);
		this.uid = ResultParse.Long("uid", json, 0);
		this.username = ResultParse.String("username", json, string.Empty);
		this.email = ResultParse.String("email", json, string.Empty);

		//ResultParse.PrintKeys("user", json);
	}

	public string deviceId;
	//public System.DateTime lastLogin;
	public long uid;
	public string username;
	public string email;
}

public class LoginManager : SystemManager
{
	public User LocalUser = null;

	public delegate void OnUserData(string error, User user);

	public override void Init()
	{
		this.InitMessenger("login");
	}

	public void LoginUser(OnUserData cb) 
	{
		Hashtable data = new Hashtable();
		data.Add("deviceId", this.GetDeviceId());

		this.Post("/api/users/loginuser", data, delegate(string error, Hashtable json) {
			if (!string.IsNullOrEmpty(error)) 
			{
				cb(error, null);
			}

			this.LocalUser = new User(json);
			this.state = GS.SystemManager.State.Ready;

			SendMessengerMsg("userLogin", this.LocalUser);

			cb(error, this.LocalUser);
		});
	}

	public string GetDeviceId()
	{
		return SystemInfo.deviceUniqueIdentifier;
	}

	public long GetLocalUserId()
	{
		return (this.LocalUser != null) ? this.LocalUser.uid : 0;
	}

	public string GetLocalUserName()
	{
		return (this.LocalUser != null) ? this.LocalUser.username : string.Empty;
	}

	public override void OnMessage(string id, object obj1, object obj2)
	{
		switch(id)
		{
			default:break;
		}
	}
}

}

