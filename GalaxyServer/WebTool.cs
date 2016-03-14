using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Ucss;

public class WebRequest
{
	public delegate void OnResponse(string error, Hashtable json);
	public HTTPRequest req = null;
	public OnResponse cb = null;
	public long start = 0;

	public WebRequest(HTTPRequest _req, OnResponse _cb)
	{
		this.req = _req;
		this.cb = _cb;
		this.start = System.DateTime.Now.Ticks;
	}
}

public static class WebTool
{
	public static Dictionary<string, WebRequest> requests = new Dictionary<string, WebRequest>();

	public static bool IsRequestActive()
	{
		return (requests.Count != 0);
	}

	public static void Get(string url, WebRequest.OnResponse cb)
	{
		Debug.Log("HTTP Get url:" + url);

		HTTPRequest request = new HTTPRequest();
		request.url = url;
		request.stringCallback = OnSuccess;
		request.onError = OnFailure;
		UCSS.HTTP.GetString(request);

		requests.Add( request.transactionId, new WebRequest(request, cb) );
	}

	public static void Post(string url, Hashtable data, WebRequest.OnResponse cb)
	{
		Debug.Log("HTTP Get url:" + url);

		WWWForm form = new WWWForm();
		foreach (DictionaryEntry pair in data)
		{
			form.AddField(pair.Key.ToString(), pair.Value.ToString());
		}

		HTTPRequest request = new HTTPRequest();
		request.url = url;
		request.formData = form;
		request.stringCallback = OnSuccess;
		request.onError = OnFailure;
		UCSS.HTTP.PostForm(request);

		requests.Add( request.transactionId, new WebRequest(request, cb) );
	}

	private static void OnSuccess(string text, string transactionId)
	{
		if (requests.ContainsKey(transactionId))
		{
			WebRequest wr = requests[transactionId];

			bool ok = false;
			Hashtable ht = (Hashtable)JSON.JsonDecode(text, ref ok);
			long elapsedTicks = System.DateTime.Now.Ticks - wr.start;
			System.TimeSpan elapsedSpan = new System.TimeSpan(elapsedTicks);
			Debug.Log("HTTP Success url:" + wr.req.url + " took " + Mathf.FloorToInt((float)elapsedSpan.TotalMilliseconds) + "ms");

			wr.cb(null, (ht != null) ? ht["result"] as Hashtable : null);

			requests.Remove(transactionId);
		}
	}

	private static void OnFailure(string error, string transactionId)
	{
		if (requests.ContainsKey(transactionId))
		{
			WebRequest wr = requests[transactionId];

			Debug.LogError("HTTP Failure url:" + wr.req.url + " error:" + error);

			wr.cb(error, null);

			requests.Remove(transactionId);
		}
	}
}
