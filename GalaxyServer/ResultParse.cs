using UnityEngine;
using System.Collections;
using SimpleJSON;

namespace GS
{

public static class ResultParse 
{
	public static string String(string paramName, JSONNode json, string defaultValue)
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

	public static int Int(string paramName, JSONNode json, int defaultValue)
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

		return p.AsInt;
	}

	public static long Long(string paramName, JSONNode json, long defaultValue)
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

	public static float Float(string paramName, JSONNode json, float defaultValue)
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

		return p.AsFloat;
	}

	public static double Double(string paramName, JSONNode json, double defaultValue)
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

		return p.AsDouble;
	}
	
	public static JSONClass EmptyObject = new JSONClass();
	public static JSONClass Object(string paramName, JSONNode json, JSONClass defaultValue = null)
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

		return p.AsObject;
	}

	public static Vector3 Vector(JSONNode json, Vector3 defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		float x = ResultParse.Int("x", json, 0);
		float y = ResultParse.Int("y", json, 0);
		float z = ResultParse.Int("y", json, 0);
		return new Vector3(x, y, z);
	}

	public static Vector3 Vector(string paramName, JSONNode json, Vector3 defaultValue)
	{
		if (json == null) 
		{
			return defaultValue;
		}

		JSONNode v = ResultParse.Object(paramName, json, null);
		return ResultParse.Vector(v, defaultValue);
	}
}

}

