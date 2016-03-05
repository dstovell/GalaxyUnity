using UnityEngine;
using System.Collections;

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

	//protected string BaseUrl = "http://droneserver.mod.bz";
	protected string BaseUrl = "http://localhost:1337";

	public delegate void OnRequest(string error, Hashtable json);

	public void Get(string url, OnRequest cb)
	{
		StartCoroutine(GetRoutine(url, cb));
	}

	protected IEnumerator GetRoutine(string url, OnRequest cb)
	{
		Debug.Log(this.GetType().ToString() + " Get " + url);
		WWW webRequest = new WWW(BaseUrl + url);

		yield return webRequest;

		if (string.IsNullOrEmpty(webRequest.error)) 
		{
			//JSONNode json = JSON.Parse(webRequest.text);
			//string err = json["err"].ToString();
			bool ok = false;
			Hashtable ht = (Hashtable)JSON.JsonDecode(webRequest.text, ref ok);
			cb(null, ht["result"] as Hashtable);
		} 
		else 
		{
			cb(webRequest.error, null);	
		}
	}

	public void Post(string url, Hashtable data, OnRequest cb)
	{
		StartCoroutine(PostRoutine(url, data, cb));
	}

	protected IEnumerator PostRoutine(string url, Hashtable data, OnRequest cb)
	{
		Debug.Log(this.GetType().ToString() + " Post " + url);
		WWWForm form = new WWWForm();
		foreach (DictionaryEntry pair in data)
		{
			form.AddField(pair.Key.ToString(), pair.Value.ToString());
		}
		WWW webRequest = new WWW(BaseUrl + url, form);

		yield return webRequest;

		if (string.IsNullOrEmpty(webRequest.error)) 
		{
			//JSONNode json = JSON.Parse(webRequest.text);
			bool ok = false;
			Hashtable ht = (Hashtable)JSON.JsonDecode(webRequest.text, ref ok);
			ResultParse.PrintKeys(url, ht);
			//Debug.LogError(ht["err"].ToString());
			cb(null, ht["result"] as Hashtable);
		} 
		else 
		{
			cb(webRequest.error, null);	
		}
	}
}

}
