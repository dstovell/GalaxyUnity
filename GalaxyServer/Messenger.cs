using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class MessengerListener : MonoBehaviour 
{
	public string messengerName;

	protected void InitMessenger(string name)
	{
		Debug.Log("MessengerListener.InitMessenger " + name);
		this.messengerName = name;
		Messenger.AddListener(this);
	}

	public void SendMessengerMsg(string name, object obj1 = null, object obj2 = null)
	{
		Messenger.SendMessageFrom(this.messengerName, name, obj1, obj2);
	}

	public virtual void OnMessage(string id, object obj1, object obj2)
	{
	}
}

public static class Messenger 
{

	private static List<MessengerListener> listeners = new List<MessengerListener>();

	public static void AddListener(MessengerListener newListener)
	{
		listeners.Add(newListener);
	}

	public static void SendMessageFrom(string from, string id, object obj1 = null, object obj2 = null)
	{
		Debug.Log("MessengerListener.SendMessageFrom " + from + "." + id + " listeners=" + listeners.Count );
		for (int i=0; i<listeners.Count; i++)
		{
			if (listeners[i].messengerName == from)
			{
				//Debug.Log("MessengerListener.SendMessageFrom skipping " + from);
				continue;
			}

			listeners[i].OnMessage(id, obj1, obj2);
		}
	}

}

}
