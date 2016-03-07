using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{
	public class PlanetData
	{
		public PlanetData(int _id, Hashtable json)
		{
			this.id = ResultParse.Int("id", json, _id);
			this.OribitalDistance = ResultParse.Float("od", json, 0.0f);
			this.Mass = ResultParse.Float("M", json, 0.0f);
			this.Diameter = ResultParse.Float("sz", json, 0.0f);
			this.Class = ResultParse.String("c", json, string.Empty);
			this.ClassName = ResultParse.String("cn", json, string.Empty);
		}

		public int id;
		public float OribitalDistance;
		public float Mass;
		public float Diameter;
		public string Class;
		public string ClassName;
	}

	public class StarData
	{
		public StarData(Hashtable json)
		{
			this.id = ResultParse.Int("id", json, 0);
			this.Mass = ResultParse.Float("M", json, 0.0f);
			this.Class = ResultParse.String("c", json, string.Empty);
			this.Position = ResultParse.Vector(json, Vector3.zero);

			this.Links = new List<int>();
			ArrayList links = ResultParse.Array("lnk", json, ResultParse.EmptyArray);
			for(int i=0; i<links.Count; i++)
			{
				ArrayList link = links[i] as ArrayList;
				this.Links.Add( int.Parse(link[0].ToString()) );
			}

			this.Planets = new List<PlanetData>();
			Hashtable planets = ResultParse.Object("planets", json, ResultParse.EmptyObject);
			foreach(DictionaryEntry entry in planets) 
			{
				this.Planets.Add(new PlanetData(int.Parse(entry.Key.ToString()), entry.Value as Hashtable) );
			}
		}

		public int id;
		public Vector3 Position;
		public float Mass;
		public string Class;

		public List<int> Links;
		public List<PlanetData> Planets;

		public float Radius	{ get {	return GS.Math.getStarRadius(this.Mass); } }
		public float Luminosity { get {	return GS.Math.getStarLuminosity(this.Mass); } }
		public float Temperature { get { return GS.Math.getStarTemperature(this.Mass); } }
		public float FrostPoint	{ get { return GS.Math.getStarFrostPoint(this.Mass); } }
		public Range HabitableZone { get { return GS.Math.getStarHabitableZone(this.Mass); } }
		public Range PlanetZone { get { return GS.Math.getStarPlanetZone(this.Mass); } }
	}

	public class Galaxy
	{
		public Galaxy(Hashtable json = null)
		{
			this.Stars = new Dictionary<int, StarData>();
			Hashtable stars = ResultParse.Object("stars", json, ResultParse.EmptyObject);
			foreach(DictionaryEntry entry in stars)
			{
				this.AddStar(entry.Value as Hashtable);
			}

			Debug.Log("Your Galaxy is made of " + this.Stars.Count + " stars");

			/*if (this.Stars.ContainsKey(42))
			{
				StarData star42 = this.Stars[42];
				Debug.Log("   id=" + star42.id + " Mass=" + star42.Mass + " Class=" + star42.Class + " x=" + star42.Position.x + " y=" + star42.Position.y + " z=" + star42.Position.z + " links=" + star42.Links.Count + " planets=" + star42.Planets.Count);
			}*/
		}

		public void AddStar(Hashtable json = null)
		{
			StarData star = new StarData(json);
			this.Stars.Add(star.id, star);
		}

		public Dictionary<int, StarData> Stars;
	}

	public class GalaxyManager : SystemManager
	{
		public Galaxy galaxy = null;

		void Awake()
		{
			//Put in parent
			this.state = GS.SystemManager.State.Initial;
		}

		public delegate void OnData(string error);

		public void GetGalaxy(OnData cb) 
		{
			this.Get("/api/galaxy/getGalaxy", delegate(string error, Hashtable json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					Debug.LogError("/api/galaxy/getGalaxy err=" + error);
					cb(error);
					return;
				}

				//ResultParse.PrintKeys("getGalaxy", json);

				//Debug.Log("getGalaxy data.Keys=" + json.Keys.Count);

				this.galaxy = new Galaxy(json["galaxy"] as Hashtable);
				this.state = GS.SystemManager.State.Ready;

				cb(null);
				return;
			});
		}

		public void GetStar(int starId, OnData cb) 
		{
			this.Get("/api/galaxy/getStar"+starId, delegate(string error, Hashtable json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					return cb(error);
				}

				this.galaxy.AddStar(json);

				return cb(null);
			});
		}
	}

}

