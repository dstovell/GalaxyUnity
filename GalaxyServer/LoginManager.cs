using UnityEngine;
using System.Collections;
using SimpleJSON;

namespace GS
{

public class User
{
	public User(JSONNode json)
	{
		this.uid = ResultParse.Long("uid", json, 0);
		this.username = ResultParse.String("username", json, string.Empty);
		this.email = ResultParse.String("email", json, string.Empty);
	}

	public long uid;
	public string username;
	public string email;
}

public class LoginManager : SystemManager
{
	public User LocalUser = null;

	void Awake()
	{
		//Put in parent
		this.state = GS.SystemManager.State.Initial;
	}

	public delegate void OnUserData(string error, User user);

	public void LoginUser(OnUserData cb) 
	{
		Hashtable data = new Hashtable();
		data.Add("deviceId", this.GetDeviceId());

		this.Post("/api/users/loginuser", data, delegate(string error, JSONNode json) {
			if (!string.IsNullOrEmpty(error)) 
			{
				return cb(error, null);
			}

			this.state = GS.SystemManager.State.Ready;
			this.LocalUser = new User(json);
			return cb(error, this.LocalUser);
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
}

}

