using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{
	public class AssetAttribs
	{
		/*public float fasterThanLightSpeed { get {return this.GetFloat("ftlSpeed");} set {this.SetInt("ftlSpeed", value);} }
		public float subLightSpeed { get {return this.GetFloat("ftlSpeed");} set {this.SetInt("ftlSpeed", value);} }
		public float hull;
		public float shield;
		
		public int slots;*/

		public int GetInt(string name, int defaultVal = 0) { return ResultParse.Int(name, this.data, defaultVal); }
		public void SetInt(string name, int value) { this.data[name] = value; }

		public float GetFloat(string name, float defaultVal = 0) { return ResultParse.Float(name, this.data, defaultVal); }
		public void SetFloat(string name, float value) { this.data[name] = value; }

		private Hashtable data;
		
		public AssetAttribs(Hashtable json)
		{
			this.data = json;
		}

		public AssetAttribs()
		{
			this.data = new Hashtable();
		}
	}

	public class AssetMod : AssetAttribs
	{
		public string id;
		public string friendlyName;
		public int slotSize;
		
		public AssetMod(string _id, Hashtable json) : base(json)
		{
			this.id = _id;
		}
	}

	public class CourseNode
	{
		public int arrivalTime;
		public int departureTime;
		public int starId;
		public int orbitId;
		public int slotId;
		public string dockId;

		public CourseNode(Hashtable json)
		{
			this.arrivalTime = ResultParse.Int("ats", json, 0);
			this.departureTime = ResultParse.Int("dts", json, 0);
			this.starId = ResultParse.Int("starId", json, -1);
			this.orbitId = ResultParse.Int("orbitId", json, -1);
			this.slotId = ResultParse.Int("slotId", json, -1);
			this.dockId = ResultParse.String("dockId", json, string.Empty);
		}
	}

	public class CourseData
	{
		public List<CourseNode> nodes;

		public CourseData(ArrayList json)
		{
			for(int i=0; i<json.Count; i++)
			{
				nodes.Add( new CourseNode(json[i] as Hashtable) );
			}
		}
	}

	public class AssetData
	{
		public string transponderId;
		public string assetKey;
		public long uid;

		public CourseData course;
		public AssetAttribs attribs;
		public List<AssetMod> mods;

		public AssetData(Hashtable json)
		{
			this.transponderId = ResultParse.String("trans", json, string.Empty);
			this.uid = ResultParse.Long("uid", json, 0);
			this.assetKey = ResultParse.String("assetKey", json, string.Empty);

			this.attribs = new AssetAttribs( ResultParse.Object("attribs", json, null) );
			this.course = new CourseData( ResultParse.Array("course", json, null) );

			this.mods = new List<AssetMod>();
			Hashtable _mods = ResultParse.Object("mods", json, ResultParse.EmptyObject);
			foreach(DictionaryEntry entry in _mods)
			{
				this.mods.Add( new AssetMod(entry.Key.ToString(), entry.Value as Hashtable) );
			}
		}

		public int GetStarId(int atTime = -1)
		{
			return 0;
		}

		public int GetOrbitId(int atTime = -1)
		{
			return 0;
		}

		public int GetSlotId(int atTime = -1)
		{
			return 0;
		}

		public string GetDockId(int atTime = -1)
		{
			return string.Empty;
		}

		public Vector3 GetStellarPosition(int atTime = -1)
		{
			return Vector3.zero;
		}

		public Vector3 GetSolarPosition(int atTime = -1)
		{
			return Vector3.zero;
		}
	}

	public class AssetsManager : SystemManager
	{
		public Dictionary<string, AssetData> assets = null;

		public delegate void OnData(string error);

		public void GetAssets(OnData cb) 
		{
			this.Get("/api/assets/getForUser", delegate(string error, Hashtable json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					Debug.LogError("/api/galaxy/getGalaxy err=" + error);
					cb(error);
					return;
				}

				this.assets = new Dictionary<string, AssetData>();
				ArrayList _assets = ResultParse.Array("assets", json, ResultParse.EmptyArray);
				
				this.state = GS.SystemManager.State.Ready;

				cb(null);
				return;
			});
		}

		public void GetAssetByTransponder(string transponderId, OnData cb) 
		{
			this.Get("/api/assets/get/"+transponderId, delegate(string error, Hashtable json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					cb(error);
				}

				cb(null);
			});
		}

		public override void Init()
		{
			this.InitMessenger("assets");
		}

		public override bool OnMessage(string id, object obj1, object obj2)
		{
			switch(id)
			{
				default:break;
			}

			return false;
		}
	}

}

