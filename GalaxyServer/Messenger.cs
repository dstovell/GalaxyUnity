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
		this.messengerName = name;
		Messenger.AddListener(this);
	}

	public virtual bool OnMessage(string id, object obj1, object obj2)
	{
		return false;
	}
}

public static class Messenger 
{

	private static List<MessengerListener> listeners = new List<MessengerListener>();

	public static void AddListener(MessengerListener newListener)
	{
		listeners.Add(newListener);
	}

	public static void SendMessage(string id, object obj1 = null, object obj2 = null)
	{
		for (int i=0; i<listeners.Count; i++)
		{
			bool consumed = listeners[i].OnMessage(id, obj1, obj2);
			if (consumed)
			{
				break;
			}
		}
	}

	public static void SendMessageFrom(string from, string id, object obj1 = null, object obj2 = null)
	{
		for (int i=0; i<listeners.Count; i++)
		{
			if (listeners[i].messengerName == from)
			{
				continue;
			}

			bool consumed = listeners[i].OnMessage(id, obj1, obj2);
			if (consumed)
			{
				break;
			}
		}
	}

}

}
