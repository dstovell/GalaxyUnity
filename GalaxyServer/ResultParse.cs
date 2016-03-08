using UnityEngine;
using System.Collections;

namespace GS
{

public static class ResultParse 
{
	public static string String(string paramName, Hashtable json, string defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return p.ToString();
	}

	public static int Int(string paramName, Hashtable json, int defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return int.Parse(p.ToString());
	}

	public static long Long(string paramName, Hashtable json, long defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return long.Parse(p.ToString());
	}

	public static float Float(string paramName, Hashtable json, float defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return float.Parse(p.ToString());
	}

	public static double Double(string paramName, Hashtable json, double defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return double.Parse(p.ToString());
	}
	
	public static Hashtable EmptyObject = new Hashtable();
	public static Hashtable Object(string paramName, Hashtable json, Hashtable defaultValue = null)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return p as Hashtable;
	}

	public static ArrayList EmptyArray = new ArrayList();
	public static ArrayList Array(string paramName, Hashtable json, ArrayList defaultValue = null)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		var p = json[paramName];
		if (p == null) 
		{
			return defaultValue;
		}

		return p as ArrayList;
	}

	public static Vector3 Vector(Hashtable json, Vector3 defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		float x = ResultParse.Float("x", json, 0);
		float y = ResultParse.Float("y", json, 0);
		float z = ResultParse.Float("z", json, 0);
		return new Vector3(x, y, z);
	}

	public static Vector3 Vector(string paramName, Hashtable json, Vector3 defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		Hashtable v = ResultParse.Object(paramName, json, null);
		return ResultParse.Vector(v, defaultValue);
	}

	public static void PrintKeys(string name, Hashtable json)
	{
		if (json != null)
		{	
			foreach(DictionaryEntry entry in json)
			{
				string val = (entry.Value != null) ? entry.Value.ToString() : string.Empty;
				Debug.Log(name + " key=" + entry.Key.ToString() + " val=[" + val + "]");
			}
		}
	}
}

}

