using UnityEngine;
using System.Collections;
using Ucss;

namespace GS
{

public class SystemManager : MonoBehaviour
{
	protected enum State
	{
		Initial,
		Ready,
		Disconnected
	}
	protected State state;

	public bool IsConnected() { return (this.state == State.Ready); }

	//protected string BaseUrl = "http://droneserver.mod.bz";
	protected string BaseUrl = "http://localhost:1337";

	public void Get(string url, WebRequest.OnResponse cb)
	{
		WebTool.Get(BaseUrl + url, cb);
	}

	public void Post(string url, Hashtable data, WebRequest.OnResponse cb)
	{
		WebTool.Post(BaseUrl + url, data, cb);
	}
}

}
